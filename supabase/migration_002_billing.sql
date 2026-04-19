-- Add billing columns to profiles
alter table public.profiles
  add column if not exists plan text not null default 'free',
  add column if not exists stripe_customer_id text unique,
  add column if not exists stripe_subscription_id text unique;

-- Update free tier default credits from 10 → 15
alter table public.profiles alter column credits set default 15;

-- Backfill existing free users to 15 credits
update public.profiles set credits = 15 where plan = 'free' and credits = 10;
