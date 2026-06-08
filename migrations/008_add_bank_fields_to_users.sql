-- Migration: Add bank account fields to users table
-- This allows users to store their bank info for withdrawals

alter table public.users 
add column if not exists bank_name text,
add column if not exists bank_code text,
add column if not exists account_number text,
add column if not exists account_holder_name text,
add column if not exists bank_updated_at timestamptz;

create index if not exists idx_users_bank_code on public.users(bank_code);
