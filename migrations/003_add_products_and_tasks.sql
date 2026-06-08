-- Add products table with image support
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  image_url text,
  image_data bytea,
  price numeric(14, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Add tasks table with image support
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete cascade,
  title text not null,
  description text,
  image_url text,
  image_data bytea,
  amount numeric(14, 2) not null check (amount > 0),
  commission_rate numeric(5, 2) not null default 1.2 check (commission_rate >= 0),
  assigned_to uuid references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'assigned', 'completed', 'cancelled')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high')),
  created_at timestamptz not null default now(),
  completed_at timestamptz,
  updated_at timestamptz not null default now()
);

-- Create index on tasks
create index if not exists idx_tasks_status on public.tasks(status);
create index if not exists idx_tasks_assigned_to on public.tasks(assigned_to);
create index if not exists idx_tasks_product_id on public.tasks(product_id);
create index if not exists idx_products_created_at on public.products(created_at);

-- Enable RLS
alter table public.products enable row level security;
alter table public.tasks enable row level security;

-- Product policies - admins can manage, only admins can read
drop policy if exists "admins can manage products" on public.products;
create policy "admins can manage products"
on public.products
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "everyone can read products" on public.products;
create policy "only admins can read products"
on public.products for select
using (public.current_user_is_admin());

-- Task policies
drop policy if exists "users can read assigned tasks" on public.tasks;
create policy "users can read assigned tasks"
on public.tasks for select
using (assigned_to = auth.uid() or public.current_user_is_admin());

drop policy if exists "admins can insert tasks" on public.tasks;
create policy "admins can insert tasks"
on public.tasks for insert
with check (public.current_user_is_admin());

drop policy if exists "admins can update tasks" on public.tasks;
create policy "admins can update tasks"
on public.tasks for update
using (public.current_user_is_admin())
with check (public.current_user_is_admin());

drop policy if exists "users can complete assigned tasks" on public.tasks;
create policy "users can complete assigned tasks"
on public.tasks for update
using (assigned_to = auth.uid() and status = 'assigned')
with check (assigned_to = auth.uid() and (status = 'completed' or status = 'assigned'));

-- Admin functions for products and tasks
create or replace function public.admin_create_product(
  p_title text,
  p_description text,
  p_image_url text default null,
  p_price numeric default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_product_id uuid;
begin
  if public.current_user_is_admin() = false then
    raise exception 'Admin access required';
  end if;

  if p_title is null or p_title = '' then
    raise exception 'Product title is required';
  end if;

  insert into public.products (title, description, image_url, price)
  values (p_title, p_description, p_image_url, p_price)
  returning id into v_product_id;

  return v_product_id;
end;
$$;

create or replace function public.admin_create_task(
  p_product_id uuid,
  p_title text,
  p_description text,
  p_image_url text,
  p_amount numeric,
  p_commission_rate numeric default 1.2,
  p_priority text default 'medium'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task_id uuid;
begin
  if public.current_user_is_admin() = false then
    raise exception 'Admin access required';
  end if;

  if p_title is null or p_title = '' then
    raise exception 'Task title is required';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'Task amount must be greater than zero';
  end if;

  insert into public.tasks (
    product_id, title, description, image_url, 
    amount, commission_rate, status, priority
  )
  values (
    p_product_id, p_title, p_description, p_image_url,
    p_amount, p_commission_rate, 'pending', p_priority
  )
  returning id into v_task_id;

  return v_task_id;
end;
$$;

create or replace function public.admin_assign_task(
  p_task_id uuid,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_task public.tasks%rowtype;
begin
  if public.current_user_is_admin() = false then
    raise exception 'Admin access required';
  end if;

  select * into v_task from public.tasks where id = p_task_id for update;

  if not found then
    raise exception 'Task not found';
  end if;

  if v_task.status <> 'pending' then
    raise exception 'Only pending tasks can be assigned';
  end if;

  update public.tasks
  set assigned_to = p_user_id, status = 'assigned', updated_at = now()
  where id = p_task_id;
end;
$$;

create or replace function public.admin_activate_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_is_admin() = false then
    raise exception 'Admin access required';
  end if;

  update public.users
  set is_activated = true, updated_at = now()
  where id = p_user_id;
end;
$$;

create or replace function public.admin_deactivate_user(p_user_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if public.current_user_is_admin() = false then
    raise exception 'Admin access required';
  end if;

  update public.users
  set is_activated = false, updated_at = now()
  where id = p_user_id;
end;
$$;

-- Grant permissions
grant execute on function public.admin_create_product(text, text, text, numeric) to authenticated;
grant execute on function public.admin_create_task(uuid, text, text, text, numeric, numeric, text) to authenticated;
grant execute on function public.admin_assign_task(uuid, uuid) to authenticated;
grant execute on function public.admin_activate_user(uuid) to authenticated;
grant execute on function public.admin_deactivate_user(uuid) to authenticated;
