-- ============================================================================
-- FINAL COMPREHENSIVE DATABASE FIX - RUN THIS ONCE IN SUPABASE SQL EDITOR
-- This resolves ALL conflicts from migrations and sets up the complete database
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- STEP 1: DROP CONFLICTING TRIGGERS AND FUNCTIONS (if they exist)
-- ============================================================================

DROP TRIGGER IF EXISTS set_user_tier ON public.users CASCADE;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users CASCADE;
DROP FUNCTION IF EXISTS public.touch_user_row() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_auth_user() CASCADE;
DROP FUNCTION IF EXISTS public.admin_activate_user(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.admin_activate_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.admin_deactivate_user(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.admin_create_order(text, numeric, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.admin_assign_order(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.process_order(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.request_withdrawal(numeric) CASCADE;
DROP FUNCTION IF EXISTS public.admin_review_withdrawal(uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.admin_create_product(text, text, text, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.admin_create_task(uuid, text, text, text, numeric, numeric, text) CASCADE;
DROP FUNCTION IF EXISTS public.admin_assign_task(uuid, uuid) CASCADE;
DROP FUNCTION IF EXISTS public.complete_daily_task(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.request_withdrawal_leveled(uuid, numeric) CASCADE;
DROP FUNCTION IF EXISTS public.admin_approve_withdrawal(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.upgrade_level(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.calculate_tier_level(numeric) CASCADE;
DROP FUNCTION IF EXISTS public.current_user_is_admin() CASCADE;

-- ============================================================================
-- STEP 2: DROP CONFLICTING TABLES (if they exist) - careful with order!
-- ============================================================================

DROP TABLE IF EXISTS public.daily_completions CASCADE;
DROP TABLE IF EXISTS public.user_progress CASCADE;
DROP TABLE IF EXISTS public.withdrawals CASCADE;
DROP TABLE IF EXISTS public.transactions CASCADE;
DROP TABLE IF EXISTS public.tasks CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.orders CASCADE;
DROP TABLE IF EXISTS public.levels CASCADE;

-- ============================================================================
-- STEP 3: CREATE HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.calculate_tier_level(balance numeric)
RETURNS integer
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
    WHEN balance >= 20000 THEN 5
    WHEN balance >= 10000 THEN 4
    WHEN balance >= 5000 THEN 3
    WHEN balance >= 4000 THEN 2
    WHEN balance >= 2000 THEN 1
    ELSE 0
  END;
$$;

CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM public.users WHERE id = auth.uid()),
    FALSE
  );
$$;

-- ============================================================================
-- STEP 4: RECREATE USERS TABLE WITH ALL FIELDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  balance numeric(14, 2) NOT NULL DEFAULT 2000 CHECK (balance >= 0),
  is_activated boolean NOT NULL DEFAULT FALSE,
  is_admin boolean NOT NULL DEFAULT FALSE,
  tier_level integer NOT NULL DEFAULT 1,
  bank_name text,
  bank_code text,
  account_number text,
  account_holder_name text,
  bank_updated_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ensure RLS is enabled on users table
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 5: RECREATE TRANSACTION TABLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('signup_bonus', 'order_commission', 'withdrawal', 'withdrawal_refund')),
  amount numeric(14, 2) NOT NULL,
  status text NOT NULL DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  commission_rate numeric(5, 2) NOT NULL DEFAULT 1.2 CHECK (commission_rate >= 0),
  assigned_to uuid REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_orders_assigned_to ON public.orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.withdrawals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  transaction_id uuid REFERENCES public.transactions(id) ON DELETE SET NULL,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamptz NOT NULL DEFAULT now(),
  reviewed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_withdrawals_user_id ON public.withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON public.withdrawals(status);
ALTER TABLE public.withdrawals ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: RECREATE PRODUCTS AND TASKS TABLES (for the app)
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  image_url text,
  image_data bytea,
  price numeric(14, 2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at);
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_url text,
  image_data bytea,
  amount numeric(14, 2) NOT NULL CHECK (amount > 0),
  commission_rate numeric(5, 2) NOT NULL DEFAULT 1.2 CHECK (commission_rate >= 0),
  assigned_to uuid REFERENCES public.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'assigned', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_product_id ON public.tasks(product_id);
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 7: CREATE TRIGGER FUNCTIONS FOR UPDATING TIMESTAMPS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.touch_user_row()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  NEW.tier_level = public.calculate_tier_level(NEW.balance);
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.touch_row()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, balance, is_activated, tier_level)
  VALUES (NEW.id, 2000, FALSE, public.calculate_tier_level(2000))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.transactions (user_id, type, amount, status)
  VALUES (NEW.id, 'signup_bonus', 2000, 'completed')
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- STEP 8: CREATE TRIGGERS
-- ============================================================================

CREATE TRIGGER set_user_tier
BEFORE INSERT OR UPDATE OF balance, is_activated, is_admin ON public.users
FOR EACH ROW EXECUTE FUNCTION public.touch_user_row();

CREATE TRIGGER touch_orders_updated_at
BEFORE INSERT OR UPDATE ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.touch_row();

CREATE TRIGGER touch_tasks_updated_at
BEFORE INSERT OR UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.touch_row();

CREATE TRIGGER touch_products_updated_at
BEFORE INSERT OR UPDATE ON public.products
FOR EACH ROW EXECUTE FUNCTION public.touch_row();

CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================================
-- STEP 9: CREATE CORE BUSINESS FUNCTIONS
-- ============================================================================

-- Process Order (for legacy orders table)
CREATE OR REPLACE FUNCTION public.process_order(p_order_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile public.users%ROWTYPE;
  v_order public.orders%ROWTYPE;
  v_commission numeric(14, 2);
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  SELECT * INTO v_profile FROM public.users WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF v_profile.is_activated = FALSE THEN
    RAISE EXCEPTION 'Account must be activated before processing orders';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.assigned_to <> v_user_id THEN
    RAISE EXCEPTION 'This order is not assigned to you';
  END IF;

  IF v_order.status <> 'assigned' THEN
    RAISE EXCEPTION 'Order cannot be processed in its current status';
  END IF;

  v_commission := ROUND(v_order.amount * v_order.commission_rate / 100, 2);

  UPDATE public.orders
  SET status = 'completed', completed_at = NOW()
  WHERE id = p_order_id;

  UPDATE public.users
  SET balance = balance + v_commission
  WHERE id = v_user_id;

  INSERT INTO public.transactions (user_id, type, amount, status)
  VALUES (v_user_id, 'order_commission', v_commission, 'completed');

  RETURN p_order_id;
END;
$$;

-- Request Withdrawal
CREATE OR REPLACE FUNCTION public.request_withdrawal(p_amount numeric)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile public.users%ROWTYPE;
  v_transaction_id uuid;
  v_withdrawal_id uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Withdrawal amount must be greater than zero';
  END IF;

  SELECT * INTO v_profile FROM public.users WHERE id = v_user_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User profile not found';
  END IF;

  IF v_profile.is_activated = FALSE THEN
    RAISE EXCEPTION 'Account must be activated before requesting withdrawals';
  END IF;

  IF v_profile.balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient wallet balance';
  END IF;

  UPDATE public.users
  SET balance = balance - p_amount
  WHERE id = v_user_id;

  INSERT INTO public.transactions (user_id, type, amount, status)
  VALUES (v_user_id, 'withdrawal', p_amount, 'pending')
  RETURNING id INTO v_transaction_id;

  INSERT INTO public.withdrawals (user_id, transaction_id, amount, status)
  VALUES (v_user_id, v_transaction_id, p_amount, 'pending')
  RETURNING id INTO v_withdrawal_id;

  RETURN v_withdrawal_id;
END;
$$;

-- Admin Review Withdrawal
CREATE OR REPLACE FUNCTION public.admin_review_withdrawal(p_withdrawal_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_withdrawal public.withdrawals%ROWTYPE;
BEGIN
  IF public.current_user_is_admin() = FALSE THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF p_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid withdrawal decision';
  END IF;

  SELECT * INTO v_withdrawal
  FROM public.withdrawals
  WHERE id = p_withdrawal_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found';
  END IF;

  IF v_withdrawal.status <> 'pending' THEN
    RAISE EXCEPTION 'Withdrawal has already been reviewed';
  END IF;

  UPDATE public.withdrawals
  SET status = p_status, reviewed_at = NOW()
  WHERE id = p_withdrawal_id;

  UPDATE public.transactions
  SET status = CASE WHEN p_status = 'approved' THEN 'completed' ELSE 'rejected' END
  WHERE id = v_withdrawal.transaction_id;

  IF p_status = 'rejected' THEN
    UPDATE public.users
    SET balance = balance + v_withdrawal.amount
    WHERE id = v_withdrawal.user_id;

    INSERT INTO public.transactions (user_id, type, amount, status)
    VALUES (v_withdrawal.user_id, 'withdrawal_refund', v_withdrawal.amount, 'completed');
  END IF;
END;
$$;

-- ============================================================================
-- STEP 10: GRANT PERMISSIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.process_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_withdrawal(uuid, text) TO authenticated;

-- ============================================================================
-- STEP 11: CREATE ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Users policies
DROP POLICY IF EXISTS "users_select_own" ON public.users;
CREATE POLICY "users_select_own"
ON public.users FOR SELECT
USING (id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "users_update_own" ON public.users;
CREATE POLICY "users_update_own"
ON public.users FOR UPDATE
USING (id = auth.uid() OR public.current_user_is_admin())
WITH CHECK (id = auth.uid() OR public.current_user_is_admin());

-- Orders policies
DROP POLICY IF EXISTS "orders_assigned_users" ON public.orders;
CREATE POLICY "orders_assigned_users"
ON public.orders FOR SELECT
USING (assigned_to = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "orders_admin_manage" ON public.orders;
CREATE POLICY "orders_admin_manage"
ON public.orders FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- Tasks policies
DROP POLICY IF EXISTS "tasks_select" ON public.tasks;
CREATE POLICY "tasks_select"
ON public.tasks FOR SELECT
USING (assigned_to = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "tasks_admin_manage" ON public.tasks;
CREATE POLICY "tasks_admin_manage"
ON public.tasks FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "tasks_users_update_own" ON public.tasks;
CREATE POLICY "tasks_users_update_own"
ON public.tasks FOR UPDATE
USING (assigned_to = auth.uid() AND status = 'assigned')
WITH CHECK (assigned_to = auth.uid() AND (status = 'completed' OR status = 'assigned'));

-- Transactions policies
DROP POLICY IF EXISTS "transactions_select_own" ON public.transactions;
CREATE POLICY "transactions_select_own"
ON public.transactions FOR SELECT
USING (user_id = auth.uid() OR public.current_user_is_admin());

-- Withdrawals policies
DROP POLICY IF EXISTS "withdrawals_select_own" ON public.withdrawals;
CREATE POLICY "withdrawals_select_own"
ON public.withdrawals FOR SELECT
USING (user_id = auth.uid() OR public.current_user_is_admin());

DROP POLICY IF EXISTS "withdrawals_admin_manage" ON public.withdrawals;
CREATE POLICY "withdrawals_admin_manage"
ON public.withdrawals FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

-- Products policies
DROP POLICY IF EXISTS "products_admin_manage" ON public.products;
CREATE POLICY "products_admin_manage"
ON public.products FOR ALL
USING (public.current_user_is_admin())
WITH CHECK (public.current_user_is_admin());

DROP POLICY IF EXISTS "products_select_all" ON public.products;
CREATE POLICY "products_select_all"
ON public.products FOR SELECT
USING (TRUE);

-- ============================================================================
-- ✅ DATABASE SETUP COMPLETE
-- ============================================================================

SELECT '✅ Database setup complete! Summary:' AS status;

SELECT COUNT(*) AS users_count FROM public.users;
SELECT 'Tables:' AS summary, COUNT(*) AS table_count FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
SELECT proname as function_name FROM pg_proc WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public') AND proname IN ('process_order', 'request_withdrawal', 'admin_review_withdrawal', 'current_user_is_admin');
