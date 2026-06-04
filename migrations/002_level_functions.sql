-- Level-based System Backend Functions

-- 1. Activate user and assign level (admin only)
CREATE OR REPLACE FUNCTION public.admin_activate_user(
  p_user_id uuid,
  p_level_id integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_level public.levels%rowtype;
  v_result json;
BEGIN
  -- Check admin
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Get level
  SELECT * INTO v_level FROM public.levels WHERE id = p_level_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Level not found';
  END IF;

  -- Activate user
  UPDATE public.users
  SET 
    is_activated = true,
    level_id = p_level_id,
    main_balance = v_level.task_access_amount,
    commission_balance = 0
  WHERE id = p_user_id;

  -- Create progress record
  INSERT INTO public.user_progress (user_id, level_id, start_date, days_completed, total_earned)
  VALUES (p_user_id, p_level_id, now(), 0, 0)
  ON CONFLICT (user_id, level_id) DO NOTHING;

  RETURN json_build_object(
    'success', true,
    'message', 'User activated at level ' || p_level_id,
    'main_balance', v_level.task_access_amount,
    'level', p_level_id
  );
END;
$$;

-- 2. Complete daily task (add daily commission)
CREATE OR REPLACE FUNCTION public.complete_daily_task(
  p_user_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user public.users%rowtype;
  v_level public.levels%rowtype;
  v_progress public.user_progress%rowtype;
  v_already_completed boolean;
BEGIN
  -- Get user
  SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  IF NOT v_user.is_activated THEN
    RAISE EXCEPTION 'User not activated';
  END IF;

  -- Get level
  SELECT * INTO v_level FROM public.levels WHERE id = v_user.level_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Level not found';
  END IF;

  -- Check if already completed today
  SELECT EXISTS(
    SELECT 1 FROM public.daily_completions 
    WHERE user_id = p_user_id 
      AND level_id = v_user.level_id 
      AND completion_date = current_date
  ) INTO v_already_completed;

  IF v_already_completed THEN
    RAISE EXCEPTION 'Already completed task for today';
  END IF;

  -- Get progress
  SELECT * INTO v_progress FROM public.user_progress 
  WHERE user_id = p_user_id AND level_id = v_user.level_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Progress record not found';
  END IF;

  -- Add daily commission
  UPDATE public.users
  SET commission_balance = commission_balance + v_level.daily_commission
  WHERE id = p_user_id;

  -- Record completion
  INSERT INTO public.daily_completions (user_id, level_id, completion_date, commission_earned)
  VALUES (p_user_id, v_user.level_id, current_date, v_level.daily_commission);

  -- Update progress
  UPDATE public.user_progress
  SET 
    days_completed = days_completed + 1,
    total_earned = total_earned + v_level.daily_commission
  WHERE user_id = p_user_id AND level_id = v_user.level_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Daily task completed',
    'commission_earned', v_level.daily_commission,
    'new_commission_balance', (SELECT commission_balance FROM public.users WHERE id = p_user_id)
  );
END;
$$;

-- 3. Request withdrawal (check if eligible)
CREATE OR REPLACE FUNCTION public.request_withdrawal_leveled(
  p_user_id uuid,
  p_amount numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user public.users%rowtype;
  v_level public.levels%rowtype;
  v_progress public.user_progress%rowtype;
BEGIN
  -- Get user
  SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Check commission balance
  IF v_user.commission_balance < p_amount THEN
    RAISE EXCEPTION 'Insufficient commission balance';
  END IF;

  -- Get level
  SELECT * INTO v_level FROM public.levels WHERE id = v_user.level_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Level not found';
  END IF;

  -- Get progress
  SELECT * INTO v_progress FROM public.user_progress 
  WHERE user_id = p_user_id AND level_id = v_user.level_id;

  -- Check if completed required days
  IF v_progress.days_completed < v_level.duration_days THEN
    RAISE EXCEPTION 'Must complete % days before withdrawal', v_level.duration_days;
  END IF;

  -- Create withdrawal request
  INSERT INTO public.withdrawals (user_id, amount, status, level_id, days_completed_at_withdrawal)
  VALUES (p_user_id, p_amount, 'pending', v_user.level_id, v_progress.days_completed)
  RETURNING id;

  RETURN json_build_object(
    'success', true,
    'message', 'Withdrawal request submitted'
  );
END;
$$;

-- 4. Approve withdrawal (admin)
CREATE OR REPLACE FUNCTION public.admin_approve_withdrawal(
  p_withdrawal_id uuid
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_withdrawal public.withdrawals%rowtype;
  v_user public.users%rowtype;
BEGIN
  -- Check admin
  IF NOT public.current_user_is_admin() THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  -- Get withdrawal
  SELECT * INTO v_withdrawal FROM public.withdrawals WHERE id = p_withdrawal_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Withdrawal not found';
  END IF;

  -- Get user
  SELECT * INTO v_user FROM public.users WHERE id = v_withdrawal.user_id;

  -- Deduct from commission balance
  UPDATE public.users
  SET commission_balance = commission_balance - v_withdrawal.amount
  WHERE id = v_withdrawal.user_id;

  -- Update withdrawal status
  UPDATE public.withdrawals
  SET status = 'approved', reviewed_at = now()
  WHERE id = p_withdrawal_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Withdrawal approved'
  );
END;
$$;

-- 5. Upgrade to next level
CREATE OR REPLACE FUNCTION public.upgrade_level(
  p_user_id uuid,
  p_new_level_id integer
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user public.users%rowtype;
  v_current_level public.levels%rowtype;
  v_new_level public.levels%rowtype;
BEGIN
  -- Get user
  SELECT * INTO v_user FROM public.users WHERE id = p_user_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'User not found';
  END IF;

  -- Get current level
  SELECT * INTO v_current_level FROM public.levels WHERE id = v_user.level_id;

  -- Get new level
  SELECT * INTO v_new_level FROM public.levels WHERE id = p_new_level_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'New level not found';
  END IF;

  -- Check if new level is actually higher
  IF p_new_level_id <= v_user.level_id THEN
    RAISE EXCEPTION 'Can only upgrade to higher levels';
  END IF;

  -- Check if main balance is enough for upgrade
  IF v_user.main_balance < v_new_level.entry_amount THEN
    RAISE EXCEPTION 'Insufficient main balance for upgrade';
  END IF;

  -- Deduct entry amount from main balance
  UPDATE public.users
  SET 
    level_id = p_new_level_id,
    main_balance = v_user.main_balance - v_new_level.entry_amount + v_new_level.task_access_amount,
    commission_balance = 0
  WHERE id = p_user_id;

  -- Create new progress record
  INSERT INTO public.user_progress (user_id, level_id, start_date, days_completed, total_earned)
  VALUES (p_user_id, p_new_level_id, now(), 0, 0)
  ON CONFLICT (user_id, level_id) DO NOTHING;

  RETURN json_build_object(
    'success', true,
    'message', 'Upgraded to level ' || p_new_level_id,
    'new_main_balance', v_user.main_balance - v_new_level.entry_amount + v_new_level.task_access_amount
  );
END;
$$;
