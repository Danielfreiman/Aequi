-- Tabela de produtos (ingredientes base e produtos finais)
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  product_type text default 'final' check (product_type in ('ingredient', 'final', 'complement')),
  -- ingredient = matéria prima (açaí kg, leite condensado, etc)
  -- final = produto vendável (açaí 200ml, 500ml, etc)
  -- complement = complementos (granola, paçoca, etc)
  name text not null,
  description text,
  price numeric(10,2) default 0,
  cost numeric(10,2),
  category text,
  unit text default 'un', -- un, kg, g, ml, l
  stock_quantity numeric(10,3) default 0,
  min_stock numeric(10,3) default 0,
  pdv_code text,
  ifood_code text,
  is_active boolean default true,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Tabela de composição de produtos (quais ingredientes compõem um produto)
create table if not exists public.product_compositions (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade, -- produto final
  ingredient_id uuid references public.products(id) on delete cascade, -- ingrediente base
  quantity numeric(10,4) not null, -- quantidade do ingrediente usada
  unit text default 'g', -- unidade (g, ml, un)
  created_at timestamp with time zone default now()
);

-- Índices para busca rápida
create index if not exists idx_products_name on public.products(name);
create index if not exists idx_products_pdv_code on public.products(pdv_code);
create index if not exists idx_products_ifood_code on public.products(ifood_code);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_type on public.products(product_type);
create index if not exists idx_compositions_product on public.product_compositions(product_id);
create index if not exists idx_compositions_ingredient on public.product_compositions(ingredient_id);


-- Apaga a tabela antes de criar para garantir estrutura correta
DROP TABLE IF EXISTS public.product_categories CASCADE;
CREATE TABLE public.product_categories (
  id uuid default gen_random_uuid() primary key,
  profile_id uuid references public.profiles(id) on delete cascade,
  name text not null,
  category_type text default 'product', -- product, ingredient, complement
  created_at timestamp with time zone default now(),
  unique(name, category_type)
);

-- Inserir categorias padrão (só se não existirem)
insert into public.product_categories (name, category_type) 
select * from (values 
  ('Açaí', 'product'),
  ('Bebidas', 'product'),
  ('Sobremesas', 'product'),
  ('Complementos', 'complement'),
  ('Ingredientes', 'ingredient')
) as v(name, category_type)
where not exists (
  select 1 from public.product_categories pc 
  where pc.name = v.name and pc.category_type = v.category_type
);

-- Habilitar RLS
alter table public.products enable row level security;
alter table public.product_compositions enable row level security;
alter table public.product_categories enable row level security;

-- Políticas para products
create policy "Products are viewable by owner" on public.products
  for select using (auth.uid() = profile_id or profile_id is null);

create policy "Products are insertable by owner" on public.products
  for insert with check (auth.uid() = profile_id or profile_id is null);

create policy "Products are updatable by owner" on public.products
  for update using (auth.uid() = profile_id or profile_id is null);

create policy "Products are deletable by owner" on public.products
  for delete using (auth.uid() = profile_id or profile_id is null);

-- Políticas para product_compositions
create policy "Compositions are viewable by all" on public.product_compositions
  for select using (true);

create policy "Compositions are insertable by all" on public.product_compositions
  for insert with check (true);

create policy "Compositions are updatable by all" on public.product_compositions
  for update using (true);

create policy "Compositions are deletable by all" on public.product_compositions
  for delete using (true);

-- Políticas para product_categories
create policy "Product categories are viewable by owner" on public.product_categories
  for select using (auth.uid() = profile_id or profile_id is null);

create policy "Product categories are insertable by owner" on public.product_categories
  for insert with check (auth.uid() = profile_id or profile_id is null);

-- Trigger para atualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Criar trigger apenas se não existir
do $$
begin
  if not exists (
    select 1 from pg_trigger where tgname = 'update_products_updated_at'
  ) then
    create trigger update_products_updated_at
      before update on public.products
      for each row
      execute function update_updated_at_column();
  end if;
end;
$$;

-- Função para calcular custo automático baseado na composição
create or replace function calculate_product_cost(p_product_id uuid)
returns numeric as $$
declare
  total_cost numeric := 0;
begin
  select coalesce(sum(
    pc.quantity * (
      case 
        when ing.unit = 'kg' and pc.unit = 'g' then ing.cost / 1000
        when ing.unit = 'l' and pc.unit = 'ml' then ing.cost / 1000
        else ing.cost
      end
    )
  ), 0)
  into total_cost
  from public.product_compositions pc
  join public.products ing on pc.ingredient_id = ing.id
  where pc.product_id = p_product_id;
  
  return total_cost;
end;
$$ language plpgsql;
