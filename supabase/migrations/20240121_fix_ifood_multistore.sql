-- Migration: 20240121_fix_ifood_multistore.sql
-- Description: Update iFood integration tables to support multiple stores per profile and fix CMV view.

-- 1. Update ifood_connections to be unique per store instead of just profile
ALTER TABLE public.ifood_connections DROP CONSTRAINT IF EXISTS ifood_connections_profile_unique;
ALTER TABLE public.ifood_connections ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
-- Ensure uniqueness by store
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ifood_connections_store_unique') THEN
        ALTER TABLE public.ifood_connections ADD CONSTRAINT ifood_connections_store_unique UNIQUE(store_id);
    END IF;
END $$;

-- 2. Ensure store_id expansion for isolation
ALTER TABLE public.menu_items ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE public.ifood_orders ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;
ALTER TABLE public.fin_transactions ADD COLUMN IF NOT EXISTS store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE;

-- 3. Fix constraints for menu_items and ifood_orders to use store_id
ALTER TABLE public.menu_items DROP CONSTRAINT IF EXISTS menu_items_profile_id_ifood_id_key;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'menu_items_store_ifood_unique') THEN
        ALTER TABLE public.menu_items ADD CONSTRAINT menu_items_store_ifood_unique UNIQUE(store_id, ifood_id);
    END IF;
END $$;

ALTER TABLE public.ifood_orders DROP CONSTRAINT IF EXISTS ifood_orders_profile_id_ifood_order_id_key;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ifood_orders_store_ifood_unique') THEN
        ALTER TABLE public.ifood_orders ADD CONSTRAINT ifood_orders_store_ifood_unique UNIQUE(store_id, ifood_order_id);
    END IF;
END $$;

-- 4. Fix view_ifood_cmv_analysis to work with store_id and global products
DROP VIEW IF EXISTS public.view_ifood_cmv_analysis;
CREATE OR REPLACE VIEW public.view_ifood_cmv_analysis AS
SELECT 
    io.store_id,
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
    public.products p ON ioi.ifood_product_id = p.ifood_id
-- We join by ifood_id. Since ifood_id is unique across iFood catalog, it should work.
-- If multi-user collision is a concern, we'd join on user_id too.
WHERE 
    io.order_status = 'CONCLUDED'
GROUP BY 
    io.store_id, io.ifood_order_id, io.short_code, io.order_timestamp, io.total_amount;
