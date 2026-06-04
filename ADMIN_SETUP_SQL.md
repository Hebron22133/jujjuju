-- CRITICAL: Run this in Supabase SQL Editor to set up admin account

-- 1. First, get the user ID (replace with actual user if needed)
SELECT id, email, is_admin FROM public.users WHERE email = 'papasupe85@gmail.com';

-- 2. Then run ONE of these:

-- Option A: If user exists in users table, just set is_admin:
UPDATE public.users
SET is_admin = true, is_activated = true
WHERE email = 'papasupe85@gmail.com';

-- Option B: If user doesn't exist in users table (check with query above first), 
-- you need to add them. First get the auth user ID from auth.users:
SELECT id, email FROM auth.users WHERE email = 'papasupe85@gmail.com';

-- Then insert into users table with that ID:
INSERT INTO public.users (id, email, is_admin, is_activated)
VALUES ('USER_ID_FROM_ABOVE', 'papasupe85@gmail.com', true, true)
ON CONFLICT (id) DO UPDATE SET is_admin = true, is_activated = true;

-- 3. Verify it worked:
SELECT id, email, is_admin, is_activated FROM public.users WHERE email = 'papasupe85@gmail.com';
