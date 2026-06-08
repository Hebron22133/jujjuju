-- ============================================================================
-- COMPREHENSIVE DATABASE FIX - RUN THIS IN SUPABASE SQL EDITOR
-- This file sets up ALL functions, tables, and policies needed
-- ============================================================================

-- Enable pgcrypto if not already enabled
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================================
-- 1. ENSURE TABLES EXIST WITH ALL COLUMNS
-- ============================================================================

-- Add bank fields to users if they don't exist
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS bank_name text,
ADD COLUMN IF NOT EXISTS bank_code text,
ADD COLUMN IF NOT EXISTS account_number text,
ADD COLUMN IF NOT EXISTS account_holder_name text,
ADD COLUMN IF NOT EXISTS bank_updated_at timestamptz;

-- ============================================================================
-- 2. CREATE HELPER FUNCTIONS FIRST
-- ============================================================================

-- Calculate tier level based on balance
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

-- Check if current user is admin
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND is_admin = TRUE
  );
$$;

-- ============================================================================
-- 3. CREATE TRIGGER FUNCTIONS
-- ============================================================================

-- Update user tier level and updated_at timestamp
CREATE OR REPLACE FUNCTION public.touch_user_row()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  new.updated_at = NOW();
  new.tier_level = public.calculate_tier_level(new.balance);
  RETURN new;
END;
$$;

-- Handle new auth user creation
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, balance, is_activated, tier_level)
  VALUES (new.id, 2000, FALSE, public.calculate_tier_level(2000))
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO public.transactions (user_id, type, amount, status)
  VALUES (new.id, 'signup_bonus', 2000, 'completed')
  ON CONFLICT DO NOTHING;

  RETURN new;
END;
$$;

-- ============================================================================
-- 4. CREATE TRIGGERS
-- ============================================================================

DROP TRIGGER IF EXISTS set_user_tier ON public.users;
CREATE TRIGGER set_user_tier
BEFORE INSERT OR UPDATE OF balance, is_activated, is_admin ON public.users
FOR EACH ROW EXECUTE FUNCTION public.touch_user_row();

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();

-- ============================================================================
-- 5. CREATE/REPLACE ALL CORE FUNCTIONS
-- ============================================================================

-- Admin: Create Order
CREATE OR REPLACE FUNCTION public.admin_create_order(
  p_title text,
  p_amount numeric,
  p_commission_rate numeric DEFAULT 1.2
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_id uuid;
BEGIN
  IF public.current_user_is_admin() = FALSE THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  IF p_amount IS NULL OR p_amount <= 0 THEN
    RAISE EXCEPTION 'Order amount must be greater than zero';
  END IF;

  IF p_commission_rate IS NULL OR p_commission_rate < 0 THEN
    RAISE EXCEPTION 'Commission rate must be non-negative';
  END IF;

  INSERT INTO public.orders (title, amount, commission_rate, status)
  VALUES (p_title, p_amount, p_commission_rate, 'pending')
  RETURNING id INTO v_order_id;

  RETURN v_order_id;
END;
$$;

-- Admin: Assign Order
CREATE OR REPLACE FUNCTION public.admin_assign_order(
  p_order_id uuid,
  p_user_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order public.orders%rowtype;
BEGIN
  IF public.current_user_is_admin() = FALSE THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  IF v_order.status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending orders can be assigned';
  END IF;

  UPDATE public.orders
  SET assigned_to = p_user_id, status = 'assigned'
  WHERE id = p_order_id;
END;
$$;

-- User: Process Order (for legacy orders)
CREATE OR REPLACE FUNCTION public.process_order(p_order_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile public.users%rowtype;
  v_order public.orders%rowtype;
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

-- User: Request Withdrawal
CREATE OR REPLACE FUNCTION public.request_withdrawal(p_amount numeric)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_profile public.users%rowtype;
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

-- Admin: Review Withdrawal
CREATE OR REPLACE FUNCTION public.admin_review_withdrawal(p_withdrawal_id uuid, p_status text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_withdrawal public.withdrawals%rowtype;
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
-- 6. GRANT PERMISSIONS TO EXECUTE FUNCTIONS
-- ============================================================================

GRANT EXECUTE ON FUNCTION public.process_order(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.request_withdrawal(numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_withdrawal(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_order(text, numeric, numeric) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_assign_order(uuid, uuid) TO authenticated;

-- ============================================================================
-- 7. VERIFY EVERYTHING WORKS
-- ============================================================================

SELECT 'Functions Created Successfully:' AS status;

SELECT 
  p.proname as function_name,
  COUNT(*) as overloads
FROM pg_proc p
WHERE p.proname IN ('process_order', 'request_withdrawal', 'admin_review_withdrawal', 'current_user_is_admin')
AND p.pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
GROUP BY p.proname
ORDER BY p.proname;

SELECT 'Users Table Columns:' AS status;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- ============================================================================
-- ✅ COMPLETE - All functions have been created and configured!
-- ============================================================================
