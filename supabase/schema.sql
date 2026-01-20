-- Aequi database schema for Supabase/PostgreSQL
-- Run in Supabase SQL editor

create extension if not exists "pgcrypto";

-- master user helper (full access)
create or replace function public.is_master()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'danifreiman44@gmail.com';
$$;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  nome_restaurante text not null,
  cnpj varchar(14) not null,
  plan_tier text not null default 'single' check (plan_tier in ('single','multi')),
  created_at timestamptz default now()
);

create index if not exists idx_profiles_owner on public.profiles(owner_id);
create unique index if not exists idx_profiles_owner_cnpj on public.profiles(owner_id, cnpj);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  nome text not null,
  preco_venda numeric(12,2) not null,
  categoria text,
  custo_fixo numeric(12,2) default 0,
  markup numeric(6,3) default 0, -- ex: 0.40 = 40%
  created_at timestamptz default now()
);

create table if not exists public.ingredients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  nome text not null,
  unidade_medida text not null,           -- g, ml, un
  custo_unidade numeric(12,4) not null,   -- custo por unidade de medida
  created_at timestamptz default now()
);

create table if not exists public.product_recipe (
  product_id uuid references public.products(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id) on delete cascade,
  gramatura_ml_qtd numeric(12,4) not null, -- precisao fina para adicionais
  primary key (product_id, ingredient_id)
);

create table if not exists public.ifood_reconciliation (
  order_id text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  valor_bruto numeric(12,2) not null,
  taxas_ifood numeric(12,2) not null,
  repasse_liquido numeric(12,2) not null,
  status_conferido boolean default false,
  created_at timestamptz default now()
);

create table if not exists public.cash_flow (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('pagar','receber')),
  descricao text not null,
  valor numeric(12,2) not null,
  vencimento date not null,
  status_pago boolean default false,
  created_at timestamptz default now()
);

-- Migration helpers (safe no-ops on fresh DB)
alter table public.profiles add column if not exists owner_id uuid;
update public.profiles set owner_id = id where owner_id is null;
alter table public.profiles alter column owner_id set not null;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_owner_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_owner_id_fkey foreign key (owner_id) references auth.users(id) on delete cascade;
  end if;
end $$;
alter table public.profiles add column if not exists plan_tier text;
update public.profiles set plan_tier = coalesce(plan_tier, 'single');
alter table public.profiles alter column plan_tier set default 'single';
alter table public.profiles alter column plan_tier set not null;
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_plan_tier_check'
  ) then
    alter table public.profiles add constraint profiles_plan_tier_check check (plan_tier in ('single','multi'));
  end if;
end $$;
create index if not exists idx_profiles_owner on public.profiles(owner_id);
create unique index if not exists idx_profiles_owner_cnpj on public.profiles(owner_id, cnpj);

-- Enable RLS
alter table public.profiles enable row level security;
alter table public.products enable row level security;
alter table public.ingredients enable row level security;
alter table public.product_recipe enable row level security;
alter table public.ifood_reconciliation enable row level security;
alter table public.cash_flow enable row level security;

-- Drop old policies if they exist (idempotent)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "products_by_profile" on public.products;
drop policy if exists "ingredients_by_profile" on public.ingredients;
drop policy if exists "ifood_reconciliation_by_profile" on public.ifood_reconciliation;
drop policy if exists "cash_flow_by_profile" on public.cash_flow;
drop policy if exists "product_recipe_by_profile" on public.product_recipe;

-- profiles: usuario enxerga apenas restaurantes que ele e dono (ou master)
create policy "profiles_select_own" on public.profiles for select using (owner_id = auth.uid() or public.is_master());
create policy "profiles_insert_own" on public.profiles for insert with check (owner_id = auth.uid() or public.is_master());
create policy "profiles_update_own" on public.profiles for update using (owner_id = auth.uid() or public.is_master()) with check (owner_id = auth.uid() or public.is_master());

-- Tabelas com profile_id direto (verifica que o profile pertence ao usuario ou master)
create policy "products_by_profile" on public.products
using (
  public.is_master() or exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = auth.uid())
)
with check (
  public.is_master() or exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = auth.uid())
);

create policy "ingredients_by_profile" on public.ingredients
using (
  public.is_master() or exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = auth.uid())
)
with check (
  public.is_master() or exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = auth.uid())
);

create policy "ifood_reconciliation_by_profile" on public.ifood_reconciliation
using (
  public.is_master() or exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = auth.uid())
)
with check (
  public.is_master() or exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = auth.uid())
);

create policy "cash_flow_by_profile" on public.cash_flow
using (
  public.is_master() or exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = auth.uid())
)
with check (
  public.is_master() or exists (select 1 from public.profiles p where p.id = profile_id and p.owner_id = auth.uid())
);

-- product_recipe: vincula via product_id/ingredient_id ao dono ou master
create policy "product_recipe_by_profile" on public.product_recipe
using (
  public.is_master() or exists (
    select 1 from public.products p
    join public.profiles pr on pr.id = p.profile_id
    where p.id = product_id and pr.owner_id = auth.uid()
  )
 ) with check (
  public.is_master() or (
    exists (
      select 1 from public.products p
      join public.profiles pr on pr.id = p.profile_id
      where p.id = product_id and pr.owner_id = auth.uid()
    )
    and exists (
      select 1 from public.ingredients i
      join public.profiles pr on pr.id = i.profile_id
      where i.id = ingredient_id and pr.owner_id = auth.uid()
    )
  )
);
