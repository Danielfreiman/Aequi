create extension if not exists "pgcrypto";

-- Master para bypass (opcional)
create or replace function public.is_master()
returns boolean
language sql
security definer
set search_path = public
as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'danifreiman44@gmail.com';
$$;

-- Perfis (restaurantes/contas)
create table public.profiles (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users on delete cascade,
  nome_restaurante text not null,
  cnpj varchar(14),
  plan_tier text not null default 'single' check (plan_tier in ('single','multi')),
  created_at timestamptz default now()
);
create index idx_profiles_owner on public.profiles(owner_id);
create unique index idx_profiles_owner_cnpj on public.profiles(owner_id, cnpj);

-- Assinaturas
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  plan_id text not null,              -- id do plano no billing
  plan_name text,
  status text default 'active',
  period_start timestamptz,
  period_end timestamptz,
  trial_end timestamptz,
  created_at timestamptz default now()
);
create index idx_subscriptions_profile on public.subscriptions(profile_id);

create table public.subscription_items (
  id uuid primary key default gen_random_uuid(),
  subscription_id uuid not null references public.subscriptions(id) on delete cascade,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  price_id text,
  quantity int default 1,
  created_at timestamptz default now()
);
create index idx_subscription_items_sub on public.subscription_items(subscription_id);
create index idx_subscription_items_profile on public.subscription_items(profile_id);

-- Relacionamento usuário<->perfil (multiuser)
create table public.profile_users (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  role text default 'member', -- owner|admin|member
  created_at timestamptz default now(),
  primary key (profile_id, user_id)
);

-- Lojas
create table public.stores (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  location text,
  external_id text,
  created_at timestamptz default now()
);
create unique index idx_stores_profile_name on public.stores(profile_id, name);
create unique index idx_stores_external_id on public.stores(external_id);

-- Categorias financeiras
create table public.finance_categories (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  source text default 'firebase',
  created_at timestamptz default now()
);
create unique index idx_finance_categories_profile_name on public.finance_categories(profile_id, name);

-- Configurações (app_settings)
create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  key text not null,
  value jsonb not null,
  created_at timestamptz default now()
);
create unique index idx_app_settings_profile_key on public.app_settings(profile_id, key);

-- RH
create table public.hr_employees (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  external_id text,
  email text,
  name text not null,
  role text,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index idx_hr_employees_profile_email on public.hr_employees(profile_id, email);
create unique index idx_hr_employees_external_id on public.hr_employees(external_id);

create table public.hr_time_cards (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  employee_id uuid references public.hr_employees(id) on delete set null,
  employee_external_id text,
  date date not null,
  check_in time,
  check_out time,
  lunch_start time,
  lunch_end time,
  hours_worked numeric(6,2),
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create index idx_hr_time_cards_employee_external on public.hr_time_cards(employee_external_id);

-- Transações financeiras (contas + DRE)
create table public.fin_transactions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  store_id uuid references public.stores(id) on delete set null,
  store_external_id text,
  type text not null check (type in ('Receita','Despesa')),
  description text,
  date date not null,
  category text,
  value numeric(12,2) not null,
  is_paid boolean default false,
  bank_id text,
  items jsonb,
  created_at timestamptz default now()
);
create index idx_fin_transactions_profile_date on public.fin_transactions(profile_id, date);
create index idx_fin_transactions_store_external on public.fin_transactions(store_external_id);
create index idx_fin_transactions_store_id on public.fin_transactions(store_id);

-- Produtos e receitas
create table public.products (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  nome text not null,
  preco_venda numeric(12,2) not null,
  categoria text,
  custo_fixo numeric(12,2) default 0,
  markup numeric(6,3) default 0,
  created_at timestamptz default now()
);
create index idx_products_profile on public.products(profile_id);

create table public.ingredients (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  nome text not null,
  unidade_medida text not null,
  custo_unidade numeric(12,4) not null,
  created_at timestamptz default now()
);
create index idx_ingredients_profile on public.ingredients(profile_id);

create table public.product_recipe (
  product_id uuid references public.products(id) on delete cascade,
  ingredient_id uuid references public.ingredients(id) on delete cascade,
  gramatura_ml_qtd numeric(12,4) not null,
  primary key (product_id, ingredient_id)
);

-- Conciliação iFood
create table public.ifood_reconciliation (
  order_id text primary key,
  profile_id uuid not null references public.profiles(id) on delete cascade,
  valor_bruto numeric(12,2) not null,
  taxas_ifood numeric(12,2) not null,
  repasse_liquido numeric(12,2) not null,
  status_conferido boolean default false,
  created_at timestamptz default now()
);

-- Fluxo de caixa
create table public.cash_flow (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  tipo text not null check (tipo in ('pagar','receber')),
  descricao text not null,
  valor numeric(12,2) not null,
  vencimento date not null,
  status_pago boolean default false,
  created_at timestamptz default now()
);
create index idx_cash_flow_profile on public.cash_flow(profile_id, vencimento);

-- Imports (firebase/users)
create table public.user_imports (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  email text not null,
  name text,
  role text,
  created_at timestamptz default now(),
  source text default 'firebase'
);
create unique index idx_user_imports_profile_email on public.user_imports(profile_id, email);

-- RLS
alter table public.profiles enable row level security;
alter table public.subscriptions enable row level security;
alter table public.subscription_items enable row level security;
alter table public.profile_users enable row level security;
alter table public.products enable row level security;
alter table public.ingredients enable row level security;
alter table public.product_recipe enable row level security;
alter table public.ifood_reconciliation enable row level security;
alter table public.cash_flow enable row level security;
alter table public.stores enable row level security;
alter table public.finance_categories enable row level security;
alter table public.app_settings enable row level security;
alter table public.hr_employees enable row level security;
alter table public.hr_time_cards enable row level security;
alter table public.fin_transactions enable row level security;
alter table public.user_imports enable row level security;

-- Policies (master ou owner/participante)
create policy "profiles_select_own" on public.profiles for select using (owner_id = auth.uid() or public.is_master());
create policy "profiles_insert_own" on public.profiles for insert with check (owner_id = auth.uid() or public.is_master());
create policy "profiles_update_own" on public.profiles for update using (owner_id = auth.uid() or public.is_master()) with check (owner_id = auth.uid() or public.is_master());

-- helper para checar vínculo via profile_users
create or replace view public.profile_membership as
select pu.user_id, p.id as profile_id, p.owner_id
from public.profile_users pu
join public.profiles p on p.id = pu.profile_id;

-- policies genéricas por profile_id
do $$
declare tbl text;
begin
  for tbl in select unnest(array[
    'products','ingredients','ifood_reconciliation','cash_flow',
    'stores','finance_categories','app_settings','hr_employees',
    'hr_time_cards','fin_transactions','user_imports','subscriptions','subscription_items'
  ]) loop
    execute format($f$
      drop policy if exists "%1$s_by_profile" on public.%1$s;
      create policy "%1$s_by_profile" on public.%1$s
      using (
        public.is_master()
        or exists (select 1 from public.profiles p where p.id = profile_id and (p.owner_id = auth.uid() or exists (select 1 from public.profile_users m where m.profile_id = p.id and m.user_id = auth.uid())))
      )
      with check (
        public.is_master()
        or exists (select 1 from public.profiles p where p.id = profile_id and (p.owner_id = auth.uid() or exists (select 1 from public.profile_users m where m.profile_id = p.id and m.user_id = auth.uid())))
      );
    $f$, tbl);
  end loop;
end $$;

-- product_recipe específica
drop policy if exists "product_recipe_by_profile" on public.product_recipe;
create policy "product_recipe_by_profile" on public.product_recipe
using (
  public.is_master() or exists (
    select 1 from public.products p
    join public.profiles pr on pr.id = p.profile_id
    where p.id = product_id and (pr.owner_id = auth.uid() or exists (select 1 from public.profile_users m where m.profile_id = pr.id and m.user_id = auth.uid()))
  )
) with check (
  public.is_master() or (
    exists (
      select 1 from public.products p
      join public.profiles pr on pr.id = p.profile_id
      where p.id = product_id and (pr.owner_id = auth.uid() or exists (select 1 from public.profile_users m where m.profile_id = pr.id and m.user_id = auth.uid()))
    )
    and exists (
      select 1 from public.ingredients i
      join public.profiles pr on pr.id = i.profile_id
      where i.id = ingredient_id and (pr.owner_id = auth.uid() or exists (select 1 from public.profile_users m where m.profile_id = pr.id and m.user_id = auth.uid()))
    )
  )
);
