-- Migration to fix "column products.nome does not exist" error
-- Mirrors 'name' column to 'nome' for legacy compatibility
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS nome text GENERATED ALWAYS AS (name) STORED;
