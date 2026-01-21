-- FIXED MIGRATION: Drop and recreate to ensure columns exist
DROP TRIGGER IF EXISTS on_product_cost_change ON public.products;
DROP FUNCTION IF EXISTS public.log_product_cost_change();
DROP TABLE IF EXISTS public.product_cost_history;

-- Create table with ALL required columns
CREATE TABLE public.product_cost_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    old_cost NUMERIC(10,2),
    new_cost NUMERIC(10,2),
    old_price NUMERIC(10,2),
    new_price NUMERIC(10,2),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    changed_by UUID -- Captures who made the change
);

-- Enable RLS
ALTER TABLE public.product_cost_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see history of their own products
CREATE POLICY "Users can view history of their own products"
ON public.product_cost_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_cost_history.product_id
    AND p.profile_id IN (
      SELECT id FROM public.profiles WHERE owner_id = auth.uid()
    )
  )
);

-- Function to log changes
CREATE OR REPLACE FUNCTION public.log_product_cost_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Log only if cost or price changed
    IF (OLD.cost IS DISTINCT FROM NEW.cost) OR (OLD.price IS DISTINCT FROM NEW.price) THEN
        INSERT INTO public.product_cost_history (product_id, old_cost, new_cost, old_price, new_price, changed_by)
        VALUES (NEW.id, OLD.cost, NEW.cost, OLD.price, NEW.price, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
CREATE TRIGGER on_product_cost_change
AFTER UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.log_product_cost_change();
