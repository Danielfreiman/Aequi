-- Executa schema completo e importa transactions.json via staging _tx_raw
\set ON_ERROR_STOP on

-- 1) Schema (pular se já existir - comentar para re-criação)
-- \i supabase/schema.sql

-- 2) Staging do JSON (usando NDJSON - uma linha por objeto)
drop table if exists public._tx_raw;
create table public._tx_raw (data jsonb);

-- Força encoding UTF-8
set client_encoding = 'UTF8';

-- Carrega diretamente do arquivo NDJSON (1 objeto JSON por linha)
\copy public._tx_raw(data) from 'transactions_ndjson.tmp'

-- 3) Importa transacoes
with
profile_sel as (
  select id from public.profiles order by created_at limit 1
),
cats as (
  select distinct trim(both from data->>'category') as cat
  from public._tx_raw
  where data->>'category' is not null and data->>'category' <> ''
  union
  select distinct trim(both from item->>'category') as cat
  from public._tx_raw r,
       lateral jsonb_array_elements(
         case when jsonb_typeof(data->'items') = 'array' then data->'items' else '[]'::jsonb end
       ) as item
  where item->>'category' is not null and item->>'category' <> ''
),
ins_cats as (
  insert into public.finance_categories (profile_id, name, source)
  select p.id, cat, 'firebase'
  from cats, profile_sel p
  where cat is not null
    and not exists (
      select 1 from public.finance_categories fc
      where fc.profile_id = p.id and fc.name = cat
    )
  returning id
),
ins_stores as (
  insert into public.stores (profile_id, name, external_id)
  select distinct on (data->>'storeId') 
    p.id, 
    coalesce(data->>'storeName', 'Loja ' || left(data->>'storeId', 8)), 
    data->>'storeId'
  from public._tx_raw r
  cross join profile_sel p
  where data->>'storeId' is not null
    and not exists (select 1 from public.stores s where s.external_id = data->>'storeId')
  on conflict do nothing
  returning id
),
all_stores as (
  select id, external_id from public.stores
),
del_tx as (
  delete from public.fin_transactions returning 1
)
insert into public.fin_transactions (
  profile_id,
  store_id,
  store_external_id,
  type,
  description,
  date,
  category,
  value,
  is_paid,
  bank_id,
  items
)
select
  p.id,
  s.id,
  j.data->>'storeId',
  j.data->>'type',
  j.data->>'description',
  (j.data->>'date')::date,
  j.data->>'category',
  (j.data->>'value')::numeric,
  coalesce((j.data->>'isPaid')::boolean, false),
  j.data->>'bankId',
  j.data->'items'
from public._tx_raw j
cross join profile_sel p
left join public.stores s on s.external_id = j.data->>'storeId';

-- 4a) Corrige store_id para registros que não foram resolvidos no JOIN
update public.fin_transactions t
set store_id = s.id
from public.stores s
where t.store_external_id = s.external_id
  and t.store_id is null;

-- 4b) Limpa staging
drop table if exists public._tx_raw;
