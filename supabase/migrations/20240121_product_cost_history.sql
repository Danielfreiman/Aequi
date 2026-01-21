-- Migration to track product cost and price history
CREATE TABLE IF NOT EXISTS public.product_cost_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
    old_cost NUMERIC(10,2),
    new_cost NUMERIC(10,2),
    old_price NUMERIC(10,2),
    new_price NUMERIC(10,2),
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    changed_by UUID -- Captures who made the change if available via auth.uid()
);

-- Enable RLS
ALTER TABLE public.product_cost_history ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see history for products they own (via profile linkage)
-- Assuming products are linked to profiles, and profiles to auth.users.
-- Optimized policy:
CREATE POLICY "Users can view history of their own products"
ON public.product_cost_history
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products p
    WHERE p.id = product_cost_history.product_id
    AND p.profile_id IN (
      SELECT id FROM public.profiles WHERE id = auth.uid() -- Assumes profile.id = auth.uid or linked 1:1
    )
  )
);

-- Function to log changes
CREATE OR REPLACE FUNCTION public.log_product_cost_change()
RETURNS TRIGGER AS $$
BEGIN
    -- unique logic to avoid logging if no change
    IF (OLD.cost IS DISTINCT FROM NEW.cost) OR (OLD.price IS DISTINCT FROM NEW.price) THEN
        INSERT INTO public.product_cost_history (product_id, old_cost, new_cost, old_price, new_price, changed_by)
        VALUES (NEW.id, OLD.cost, NEW.cost, OLD.price, NEW.price, auth.uid());
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger
DROP TRIGGER IF EXISTS on_product_cost_change ON public.products;
CREATE TRIGGER on_product_cost_change
AFTER UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.log_product_cost_change();
