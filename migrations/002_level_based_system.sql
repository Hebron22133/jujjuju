-- Migration: Level-based Task and Commission System
-- Creates all necessary tables for the new business logic

-- 1. Levels table
CREATE TABLE IF NOT EXISTS public.levels (
  id integer primary key,
  name text not null,
  entry_amount numeric(14, 2) not null,
  task_access_amount numeric(14, 2) not null,
  daily_commission numeric(14, 2) not null,
  duration_days integer not null,
  created_at timestamptz default now()
);

-- Insert level data
INSERT INTO public.levels (id, name, entry_amount, task_access_amount, daily_commission, duration_days) 
VALUES 
  (1, 'Level 1', 2000, 4000, 500, 2),
  (2, 'Level 2', 5000, 10000, 2000, 7),
  (3, 'Level 3', 10000, 50000, 4000, 10),
  (4, 'Level 4', 20000, 100000, 8000, 15),
  (5, 'Level 5', 40000, 200000, 16000, 20)
ON CONFLICT DO NOTHING;

-- 2. Update users table with new fields
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS level_id integer references public.levels(id),
ADD COLUMN IF NOT EXISTS main_balance numeric(14, 2) default 0,
ADD COLUMN IF NOT EXISTS commission_balance numeric(14, 2) default 0;

-- 3. User progress table (tracks completion of level duration)
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  level_id integer not null references public.levels(id),
  start_date timestamptz not null default now(),
  days_completed integer not null default 0,
  total_earned numeric(14, 2) not null default 0,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, level_id)
);

-- 4. Update withdrawals table with more fields
ALTER TABLE public.withdrawals
ADD COLUMN IF NOT EXISTS level_id integer references public.levels(id),
ADD COLUMN IF NOT EXISTS days_completed_at_withdrawal integer;

-- 5. Daily task completion table
CREATE TABLE IF NOT EXISTS public.daily_completions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  level_id integer not null references public.levels(id),
  completion_date date not null,
  commission_earned numeric(14, 2) not null,
  created_at timestamptz default now(),
  unique(user_id, level_id, completion_date)
);

-- 6. Tasks table
CREATE TABLE IF NOT EXISTS public.tasks (
  id uuid primary key default gen_random_uuid(),
  level_id integer not null references public.levels(id),
  title text not null,
  description text,
  status text not null default 'active' check (status in ('active', 'inactive')),
  created_at timestamptz default now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_level_id ON public.user_progress(level_id);
CREATE INDEX IF NOT EXISTS idx_daily_completions_user_level ON public.daily_completions(user_id, level_id);
CREATE INDEX IF NOT EXISTS idx_daily_completions_date ON public.daily_completions(completion_date);
CREATE INDEX IF NOT EXISTS idx_tasks_level_id ON public.tasks(level_id);
