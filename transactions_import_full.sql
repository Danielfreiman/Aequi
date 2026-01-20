-- Importa transacoes do JSON (Firebase) para o Supabase, criando stores e categorias faltantes.
-- Passo: substitua o bloco $$...$$ abaixo pelo array JSON completo (ex: conteudo de transactions.json).
-- Cuidado: o script limpa fin_transactions antes de inserir (ajuste se nao quiser limpar).

with
json_input as (
  -- injete o JSON via variável CONTENT (ex: psql --set=CONTENT="$(cat transactions.json)")
  select :'CONTENT'::jsonb as data
),
profile_sel as (
  select id from public.profiles order by created_at limit 1
),
raw_tx as (
  select jsonb_array_elements(data) as tx
  from json_input
),
-- lojas: cria se nao existir pela storeId (external_id)
upsert_stores as (
  insert into public.stores (profile_id, name, external_id)
  select p.id,
         coalesce(tx->>'storeName', 'Loja ' || left(tx->>'storeId', 8)),
         tx->>'storeId'
  from raw_tx r
  cross join profile_sel p
  where (tx->>'storeId') is not null
    and not exists (select 1 from public.stores s where s.external_id = tx->>'storeId')
  returning id, external_id
),
all_stores as (
  select id, external_id from upsert_stores
  union all
  select id, external_id from public.stores
),
-- categorias: coleta tanto da categoria principal quanto das categorias dos itens
cats as (
  select distinct trim(both from tx->>'category') as cat
  from raw_tx
  where tx->>'category' is not null and tx->>'category' <> ''
  union
  select distinct trim(both from item->>'category') as cat
  from raw_tx r,
       lateral jsonb_array_elements(tx->'items') as item
  where item->>'category' is not null and item->>'category' <> ''
),
upsert_categories as (
  insert into public.finance_categories (profile_id, name, source)
  select p.id, cat, 'firebase'
  from cats, profile_sel p
  where cat is not null
    and not exists (
      select 1 from public.finance_categories fc
      where fc.profile_id = p.id and fc.name = cat
    )
  returning id, name
),
all_categories as (
  select id, name from upsert_categories
  union all
  select id, name from public.finance_categories
),
-- limpeza opcional de transacoes existentes
del as (
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
  tx->>'storeId',
  tx->>'type',
  tx->>'description',
  (tx->>'date')::date,
  tx->>'category',
  (tx->>'value')::numeric,
  coalesce((tx->>'isPaid')::boolean, false),
  tx->>'bankId',
  tx->'items'
from raw_tx r
cross join profile_sel p
left join all_stores s on s.external_id = tx->>'storeId';
