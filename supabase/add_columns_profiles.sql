-- Add new columns to the profiles table
ALTER TABLE public.profiles
ADD COLUMN avatar_url text;

-- Optionally, add a default value or constraints
-- ALTER TABLE public.profiles
-- ADD COLUMN avatar_url text DEFAULT 'default_avatar_url';