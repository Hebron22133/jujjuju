create extension if not exists pgcrypto;

create or replace function public.calculate_tier_level(balance numeric)
returns integer
language sql
immutable
as $$
  select case
    when balance >= 20000 then 5
    when balance >= 10000 then 4
    when balance >= 5000 then 3
    when balance >= 4000 then 2
    when balance >= 2000 then 1
    else 0
  end;
$$;

create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  balance numeric(14, 2) not null default 2000 check (balance >= 0),
  is_activated boolean not null default false,
  is_admin boolean not null default false,
  tier_level integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('signup_bonus', 'order_commission', 'withdrawal', 'withdrawal_refund')),
  amount numeric(14, 2) not null,
  status text not null default 'completed' check (status in ('pending', 'completed', 'rejected')),
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  title text,
  amount numeric(14, 2) not null check (amount > 0),
  commission_rate numeric(5, 2) not null default 1.2 check (commission_rate >= 0),
  assigned_to uuid references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'assigned', 'completed', 'cancelled')),
  created_at timestamptz not null default now(),
  completed_at timestamptz
);

create table if not exists public.withdrawals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  transaction_id uuid references public.transactions(id) on delete set null,
  amount numeric(14, 2) not null check (amount > 0),
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create or replace function public.touch_user_row()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  new.tier_level = public.calculate_tier_level(new.balance);
  return new;
end;
$$;

drop trigger if exists set_user_tier on public.users;
create trigger set_user_tier
before insert or update of balance, is_activated, is_admin on public.users
for each row execute function public.touch_user_row();

create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.users (id, balance, is_activated, tier_level)
  values (new.id, 2000, false, public.calculate_tier_level(2000))
  on conflict (id) do nothing;

  insert into public.transactions (user_id, type, amount, status)
  values (new.id, 'signup_bonus', 2000, 'completed')
  on conflict do nothing;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_auth_user();

create or replace function public.current_user_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.users
    where id = auth.uid() and is_admin = true
  );
$$;

create or replace function public.admin_create_order(
  p_title text,
  p_amount numeric,
  p_commission_rate numeric default 1.2
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id uuid;
begin
  if public.current_user_is_admin() = false then
    raise exception 'Admin access required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Order amount must be greater than zero';
  end if;

  if p_commission_rate is null or p_commission_rate < 0 then
    raise exception 'Commission rate must be non-negative';
  end if;

  insert into public.orders (title, amount, commission_rate, status)
  values (p_title, p_amount, p_commission_rate, 'pending')
  returning id into v_order_id;

  return v_order_id;
end;
$$;

create or replace function public.admin_assign_order(
  p_order_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order public.orders%rowtype;
begin
  if public.current_user_is_admin() = false then
    raise exception 'Admin access required';
  end if;

  select * into v_order from public.orders where id = p_order_id for update;

  if not found then
    raise exception 'Order not found';
  end if;

  if v_order.status <> 'pending' then
    raise exception 'Only pending orders can be assigned';
  end if;

  update public.orders
  set assigned_to = p_user_id, status = 'assigned'
  where id = p_order_id;
end;
$$;

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

create or replace function public.request_withdrawal(p_amount numeric)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_id uuid := auth.uid();
  v_profile public.users%rowtype;
  v_transaction_id uuid;
  v_withdrawal_id uuid;
begin
  if v_user_id is null then
    raise exception 'Authentication required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Withdrawal amount must be greater than zero';
  end if;

  select * into v_profile from public.users where id = v_user_id for update;

  if not found then
    raise exception 'User profile not found';
  end if;

  if v_profile.is_activated = false then
    raise exception 'Account must be activated before requesting withdrawals';
  end if;

  if v_profile.balance < p_amount then
    raise exception 'Insufficient wallet balance';
  end if;

  update public.users
  set balance = balance - p_amount
  where id = v_user_id;

  insert into public.transactions (user_id, type, amount, status)
  values (v_user_id, 'withdrawal', -p_amount, 'pending')
  returning id into v_transaction_id;

  insert into public.withdrawals (user_id, transaction_id, amount, status)
  values (v_user_id, v_transaction_id, p_amount, 'pending')
  returning id into v_withdrawal_id;

  return v_withdrawal_id;
end;
$$;

create or replace function public.admin_review_withdrawal(p_withdrawal_id uuid, p_status text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_withdrawal public.withdrawals%rowtype;
begin
  if public.current_user_is_admin() = false then
    raise exception 'Admin access required';
  end if;

  if p_status not in ('approved', 'rejected') then
    raise exception 'Invalid withdrawal decision';
  end if;

  select * into v_withdrawal
  from public.withdrawals
  where id = p_withdrawal_id
  for update;

  if not found then
    raise exception 'Withdrawal not found';
  end if;

  if v_withdrawal.status <> 'pending' then
    raise exception 'Withdrawal has already been reviewed';
  end if;

  update public.withdrawals
  set status = p_status, reviewed_at = now()
  where id = p_withdrawal_id;

  update public.transactions
  set status = case when p_status = 'approved' then 'completed' else 'rejected' end
  where id = v_withdrawal.transaction_id;

  if p_status = 'rejected' then
    update public.users
    set balance = balance + v_withdrawal.amount
    where id = v_withdrawal.user_id;

    insert into public.transactions (user_id, type, amount, status)
    values (v_withdrawal.user_id, 'withdrawal_refund', v_withdrawal.amount, 'completed');
  end if;
end;
$$;

alter table public.users enable row level security;
alter table public.transactions enable row level security;
alter table public.orders enable row level security;
alter table public.withdrawals enable row level security;

drop policy if exists "users can read own profile" on public.users;
create policy "users can read own profile"
on public.users for select
using (id = auth.uid());

drop policy if exists "admins can update users" on public.users;
create policy "admins can update users"
on public.users for update
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "users can read own transactions" on public.transactions;
create policy "users can read own transactions"
on public.transactions for select
using (user_id = auth.uid() or public.current_user_is_admin());

drop policy if exists "users can read own orders" on public.orders;
create policy "users can read own orders"
on public.orders for select
using (assigned_to = auth.uid() or public.current_user_is_admin() or status = 'completed');

drop policy if exists "admins can insert orders" on public.orders;
create policy "admins can insert orders"
on public.orders for insert
with check (public.current_user_is_admin());

drop policy if exists "admins can update orders" on public.orders;
create policy "admins can update orders"
on public.orders for update
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "users can update own assigned orders" on public.orders;
create policy "users can update own assigned orders"
on public.orders for update
using (assigned_to = auth.uid() and status = 'assigned')
with check (assigned_to = auth.uid() and status = 'completed');

drop policy if exists "users can read own withdrawals" on public.withdrawals;
create policy "users can read own withdrawals"
on public.withdrawals for select
using (user_id = auth.uid() or public.current_user_is_admin());

grant execute on function public.process_order(uuid) to authenticated;
grant execute on function public.request_withdrawal(numeric) to authenticated;
grant execute on function public.admin_review_withdrawal(uuid, text) to authenticated;
grant execute on function public.admin_create_order(text, numeric, numeric) to authenticated;
grant execute on function public.admin_assign_order(uuid, uuid) to authenticated;
