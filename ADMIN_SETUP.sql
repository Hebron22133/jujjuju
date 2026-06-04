-- Admin Setup Script - Run in Supabase SQL Editor

-- Step 1: Ensure is_admin column exists
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS is_admin boolean not null default false;

-- Step 2: Set papasupe85@gmail.com as admin
UPDATE public.users
SET is_admin = true
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'papasupe85@gmail.com'
  LIMIT 1
);

-- Step 3: Verify the update
SELECT id, email, is_admin FROM public.users 
WHERE id = (
  SELECT id FROM auth.users 
  WHERE email = 'papasupe85@gmail.com'
);
