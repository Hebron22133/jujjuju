-- COMPLETE RLS POLICY FIX
-- Remove ALL recursive policy calls

-- Drop all problematic policies
DROP POLICY IF EXISTS "users can read own profile" ON public.users;
DROP POLICY IF EXISTS "admins can update users" ON public.users;
DROP POLICY IF EXISTS "admins can insert orders" ON public.orders;
DROP POLICY IF EXISTS "admins can update orders" ON public.orders;

-- Create fixed policies WITHOUT recursive function calls

-- Users policy: Users can only read their own profile
CREATE POLICY "users can read own profile"
ON public.users FOR SELECT
USING (id = auth.uid());

-- Transactions: Users can read their own transactions only
DROP POLICY IF EXISTS "users can read own transactions" ON public.transactions;
CREATE POLICY "users can read own transactions"
ON public.transactions FOR SELECT
USING (user_id = auth.uid());

-- Orders: Simple policies without admin check
DROP POLICY IF EXISTS "users can read own orders" ON public.orders;
CREATE POLICY "users can read own orders"
ON public.orders FOR SELECT
USING (assigned_to = auth.uid() OR status = 'completed');

-- Withdrawals: Users can read their own withdrawals
DROP POLICY IF EXISTS "users can read own withdrawals" ON public.withdrawals;
CREATE POLICY "users can read own withdrawals"
ON public.withdrawals FOR SELECT
USING (user_id = auth.uid());

-- DISABLE admin-related policies for now
-- They will be re-enabled after we verify basic auth works
