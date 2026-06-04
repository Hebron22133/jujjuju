-- WORKAROUND: Create a function that bypasses RLS
-- This function will allow us to query user profiles without hitting RLS infinite recursion

DROP FUNCTION IF EXISTS public.get_user_profile(uuid);

CREATE FUNCTION public.get_user_profile(user_id uuid)
RETURNS TABLE (
  id uuid,
  balance numeric,
  is_activated boolean,
  is_admin boolean,
  tier_level integer,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, balance, is_activated, is_admin, tier_level, created_at, updated_at
  FROM public.users
  WHERE id = user_id;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_profile(uuid) TO authenticated, anon;
