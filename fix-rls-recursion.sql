-- FIX: Remove infinite recursion from RLS policy
-- This policy was calling current_user_is_admin() which queries the users table
-- causing infinite recursion

DROP POLICY IF EXISTS "users can read own profile" ON public.users;

CREATE POLICY "users can read own profile"
ON public.users FOR SELECT
USING (id = auth.uid());
