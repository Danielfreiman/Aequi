-- Fix potential schema mismatch for 'cost' column
-- Dashboard uses 'cost', Schema might only have 'custo_fixo'

DO $$
BEGIN
    -- Check if 'cost' does NOT exist but 'custo_fixo' DOES exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'custo_fixo') THEN
        
        -- Create 'cost' as generated column aliasing 'custo_fixo'
        ALTER TABLE public.products 
        ADD COLUMN cost numeric(12,2) GENERATED ALWAYS AS (custo_fixo) STORED;
        
    END IF;

    -- ALSO check if 'custo_fixo' does NOT exist but 'cost' DOES exist (inverse case)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'custo_fixo') 
       AND EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'products' AND column_name = 'cost') THEN
        
        -- Create 'custo_fixo' as generated column aliasing 'cost'
        ALTER TABLE public.products 
        ADD COLUMN custo_fixo numeric(12,2) GENERATED ALWAYS AS (cost) STORED;
        
    END IF;

END $$;
