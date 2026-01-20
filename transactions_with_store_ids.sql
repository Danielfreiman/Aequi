-- Atualizar store_id em fin_transactions com base em store_external_id
update public.fin_transactions
set store_id = stores.id
from public.stores
where fin_transactions.store_external_id = stores.external_id;

-- Criar lojas ausentes com base nos storeIds do JSON
insert into public.stores (id, profile_id, name, external_id)
select gen_random_uuid(), (select id from public.profiles limit 1), 'Loja Importada', tx->>'storeId'
from jsonb_array_elements('[{"type": "Despesa", "description": "INSS - Léo (3/12)", "storeId": "VhYM0uSasOXQneuURJS1", "date": "2026-03-20", "isPaid": false, "category": "Fatura Detalhada", "items": [{"description": "Compra açaí  (3/3)", "category": "Custos (CMV/CMV)", "value": 1000}, {"description": "trste 2  (3/3)", "category": "Custos (CMV/CMV)", "value": 50}], "value": 1298}]'::jsonb) as tx
where not exists (select 1 from public.stores where external_id = tx->>'storeId');

-- Inserir transações com store_id correto
insert into public.fin_transactions (profile_id, store_id, type, description, date, category, value, is_paid, items)
select 
  (select id from public.profiles limit 1), 
  stores.id, 
  tx->>'type', 
  tx->>'description', 
  (tx->>'date')::date, 
  tx->>'category', 
  (tx->>'value')::numeric, 
  (tx->>'isPaid')::boolean, 
  (tx->>'items')::jsonb
from jsonb_array_elements('[{"type": "Despesa", "description": "INSS - Léo (3/12)", "storeId": "VhYM0uSasOXQneuURJS1", "date": "2026-03-20", "isPaid": false, "category": "Fatura Detalhada", "items": [{"description": "Compra açaí  (3/3)", "category": "Custos (CMV/CMV)", "value": 1000}, {"description": "trste 2  (3/3)", "category": "Custos (CMV/CMV)", "value": 50}], "value": 1298}]'::jsonb) as tx
join public.stores on tx->>'storeId' = stores.external_id;