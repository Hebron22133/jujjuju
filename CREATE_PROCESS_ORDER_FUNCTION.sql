-- Create process_order function for order processing
-- Run this in Supabase SQL Editor

create or replace function public.process_order(p_order_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.users%rowtype;
  v_order public.orders%rowtype;
  v_commission numeric(14, 2);
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  select * into v_profile from public.users where id = v_user_id for update;

  if not found then
    raise exception 'User profile not found';
  end if;

  if v_profile.is_activated = false then
    raise exception 'Account must be activated before processing orders';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.assigned_to <> v_user_id then
    raise exception 'This order is not assigned to you';
  end if;

  if v_order.status <> 'assigned' then
    raise exception 'Order cannot be processed in its current status';
  end if;

  v_commission := round(v_order.amount * v_order.commission_rate / 100, 2);

  update public.orders
  set status = 'completed', completed_at = now()
  where id = p_order_id;

  update public.users
  set balance = balance + v_commission
  where id = v_user_id;

  insert into public.transactions (user_id, type, amount, status)
  values (v_user_id, 'order_commission', v_commission, 'completed');

  return p_order_id;
end;
$$;

grant execute on function public.process_order(uuid) to authenticated;
