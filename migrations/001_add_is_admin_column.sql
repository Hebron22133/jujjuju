-- Migration: Add is_admin column to users table
-- This adds admin role support to the users table

-- Add the is_admin column if it doesn't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin boolean not null default false;

-- Update the trigger to include is_admin in the monitored columns
DROP TRIGGER IF EXISTS set_user_tier ON public.users;

CREATE TRIGGER set_user_tier
BEFORE INSERT OR UPDATE OF balance, is_activated, is_admin ON public.users
FOR EACH ROW EXECUTE FUNCTION public.touch_user_row();

-- Verify the column was added
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'is_admin';
