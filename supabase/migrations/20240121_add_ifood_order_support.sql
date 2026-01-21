
-- Migration: 20240121_add_ifood_order_support.sql
-- Description: Complete schema for iFood integration, including connections, menu, and orders.

-- 1. Create ifood_connections table for centralized auth persistence
CREATE TABLE IF NOT EXISTS public.ifood_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    store_id UUID REFERENCES public.stores(id) ON DELETE SET NULL,
    merchant_id TEXT,
    merchant_name TEXT,
    corporate_name TEXT,
    cnpj TEXT,
    status TEXT DEFAULT 'active',
    address JSONB,
    access_token TEXT,
    refresh_token TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Unique connection per profile
    CONSTRAINT ifood_connections_profile_unique UNIQUE(profile_id)
);

-- 2. Create menu_items table for cardápio mirror
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(12,2) NOT NULL,
    original_price DECIMAL(12,2),
    category TEXT,
    status TEXT DEFAULT 'active',
    external_code TEXT,
    source TEXT DEFAULT 'ifood',
    ifood_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    UNIQUE(profile_id, ifood_id)
);

-- 3. Create ifood_orders table to store detailed order information
CREATE TABLE IF NOT EXISTS public.ifood_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    ifood_order_id TEXT NOT NULL,
    short_code TEXT,
    order_type TEXT, -- DELIVERY, TAKEOUT, INDOOR
    order_status TEXT, -- CONCLUDED, CANCELLED, etc.
    customer_name TEXT,
    delivery_fee DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) NOT NULL,
    items_amount DECIMAL(12,2) NOT NULL,
    discounts DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_timestamp TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(profile_id, ifood_order_id)
);

-- 4. Create ifood_order_items table
CREATE TABLE IF NOT EXISTS public.ifood_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES public.ifood_orders(id) ON DELETE CASCADE,
    ifood_product_id TEXT,
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Link to fin_transactions and products
DO $$ 
BEGIN
    -- Ensure ifood_order_id in fin_transactions
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fin_transactions' AND column_name = 'ifood_order_id') THEN
        ALTER TABLE public.fin_transactions ADD COLUMN ifood_order_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_fin_transactions_ifood_order_id ON public.fin_transactions(ifood_order_id);
    END IF;

    -- Ensure idood_id and cost in products
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ifood_id') THEN
        ALTER TABLE public.products ADD COLUMN ifood_id TEXT;
        CREATE INDEX IF NOT EXISTS idx_products_ifood_id ON public.products(ifood_id);
    END IF;
END $$;

-- Enable RLS for all tables
ALTER TABLE public.ifood_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ifood_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ifood_order_items ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies (using the same pattern as other tables)
DO $$
DECLARE tbl TEXT;
BEGIN
  FOR tbl IN SELECT unnest(ARRAY['ifood_connections','menu_items','ifood_orders']) LOOP
    EXECUTE format($f$
      DROP POLICY IF EXISTS "%1$s_by_profile" ON public.%1$s;
      CREATE POLICY "%1$s_by_profile" ON public.%1$s
      USING (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND (p.owner_id = auth.uid() or EXISTS (SELECT 1 FROM public.profile_users m WHERE m.profile_id = p.id AND m.user_id = auth.uid())))
      )
      WITH CHECK (
        EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = profile_id AND (p.owner_id = auth.uid() or EXISTS (SELECT 1 FROM public.profile_users m WHERE m.profile_id = p.id AND m.user_id = auth.uid())))
      );
    $f$, tbl);
  END LOOP;
END $$;

-- Items policies (linked through order_id)
DROP POLICY IF EXISTS "ifood_order_items_by_profile" ON public.ifood_order_items;
CREATE POLICY "ifood_order_items_by_profile" ON public.ifood_order_items
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.ifood_orders io WHERE io.id = order_id AND io.profile_id IN (
    SELECT p.id FROM public.profiles p WHERE p.owner_id = auth.uid() OR EXISTS (SELECT 1 FROM public.profile_users m WHERE m.profile_id = p.id AND m.user_id = auth.uid())
  ))
);

-- 6. View for iFood CMV and Margin analysis
CREATE OR REPLACE VIEW public.view_ifood_cmv_analysis AS
SELECT 
    io.profile_id,
    io.ifood_order_id,
    io.short_code,
    io.order_timestamp as date,
    io.total_amount as revenue,
    SUM(ioi.quantity * p.cost) as estimated_total_cost,
    io.total_amount - SUM(ioi.quantity * p.cost) as gross_profit,
    CASE 
        WHEN io.total_amount > 0 THEN (io.total_amount - SUM(ioi.quantity * p.cost)) / io.total_amount * 100 
        ELSE 0 
    END as margin_percent
FROM 
    public.ifood_orders io
JOIN 
    public.ifood_order_items ioi ON io.id = ioi.order_id
LEFT JOIN 
    public.products p ON ioi.ifood_product_id = p.ifood_id AND io.profile_id = p.profile_id
WHERE 
    io.order_status = 'CONCLUDED'
GROUP BY 
    io.profile_id, io.ifood_order_id, io.short_code, io.order_timestamp, io.total_amount;
