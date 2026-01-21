
-- Migration: 20240121_add_ifood_order_support.sql
-- Description: Add columns and tables to support iFood order synchronization and transaction linking.

-- 1. Add ifood_order_id to fin_transactions to link financial transactions to iFood orders
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'fin_transactions' AND column_name = 'ifood_order_id') THEN
        ALTER TABLE fin_transactions ADD COLUMN ifood_order_id TEXT;
        CREATE INDEX idx_fin_transactions_ifood_order_id ON fin_transactions(ifood_order_id);
        
        -- Add unique constraint for (profile_id, ifood_order_id) to support upsert
        IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fin_transactions_profile_ifood_order_unique') THEN
            ALTER TABLE fin_transactions ADD CONSTRAINT fin_transactions_profile_ifood_order_unique UNIQUE (profile_id, ifood_order_id);
        END IF;
    END IF;
END $$;

-- 2. Create ifood_orders table to store detailed order information
CREATE TABLE IF NOT EXISTS ifood_orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    ifood_order_id TEXT NOT NULL,
    short_code TEXT,
    order_type TEXT, -- DELIVERY, TAKEOUT, INDOOR
    order_status TEXT, -- CONCLUDED, CANCELLED, etc.
    customer_name TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    items_amount DECIMAL(10,2) NOT NULL,
    discounts DECIMAL(10,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    order_timestamp TIMESTAMP WITH TIME ZONE,
    
    -- Unique constraint for profile_id and ifood_order_id
    UNIQUE(profile_id, ifood_order_id)
);

CREATE INDEX IF NOT EXISTS idx_ifood_orders_profile_id ON ifood_orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_ifood_orders_timestamp ON ifood_orders(order_timestamp);

-- 3. Create ifood_order_items table
CREATE TABLE IF NOT EXISTS ifood_order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES ifood_orders(id) ON DELETE CASCADE,
    ifood_product_id TEXT, -- To link with menu_items.ifood_id
    name TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    total_price DECIMAL(10,2) NOT NULL,
    observations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ifood_order_items_order_id ON ifood_order_items(order_id);

-- Enable RLS
ALTER TABLE ifood_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE ifood_order_items ENABLE ROW LEVEL SECURITY;

-- Add RLS Policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own ifood_orders') THEN
        CREATE POLICY "Users can view their own ifood_orders" ON ifood_orders FOR SELECT USING (auth.uid() = profile_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own ifood_orders') THEN
        CREATE POLICY "Users can insert their own ifood_orders" ON ifood_orders FOR INSERT WITH CHECK (auth.uid() = profile_id);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own ifood_orders') THEN
        CREATE POLICY "Users can update their own ifood_orders" ON ifood_orders FOR UPDATE USING (auth.uid() = profile_id);
    END IF;

    -- Items policies (linked through order_id)
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own ifood_order_items') THEN
        CREATE POLICY "Users can view their own ifood_order_items" ON ifood_order_items FOR SELECT 
        USING (EXISTS (SELECT 1 FROM ifood_orders WHERE id = order_id AND profile_id = auth.uid()));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own ifood_order_items') THEN
        CREATE POLICY "Users can insert their own ifood_order_items" ON ifood_order_items FOR INSERT 
        WITH CHECK (EXISTS (SELECT 1 FROM ifood_orders WHERE id = order_id AND profile_id = auth.uid()));
    END IF;
END $$;

-- 4. Add ifood_id to products table for linking
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'ifood_id') THEN
        ALTER TABLE public.products ADD COLUMN ifood_id TEXT;
        CREATE INDEX idx_products_ifood_id ON public.products(ifood_id);
    END IF;
END $$;

-- 5. View for iFood CMV and Margin analysis
CREATE OR REPLACE VIEW view_ifood_cmv_analysis AS
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
    ifood_orders io
JOIN 
    ifood_order_items ioi ON io.id = ioi.order_id
LEFT JOIN 
    public.products p ON ioi.ifood_product_id = p.ifood_id AND io.profile_id = p.profile_id
WHERE 
    io.order_status = 'CONCLUDED'
GROUP BY 
    io.profile_id, io.ifood_order_id, io.short_code, io.order_timestamp, io.total_amount;
