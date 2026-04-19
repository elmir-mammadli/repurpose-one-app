-- ── profiles ──────────────────────────────────────────────────────────────────
-- One row per user, auto-created on sign-up via trigger below.
create table public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  full_name   text,
  credits     integer not null default 10,
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create a profile row whenever a new user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1))
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- ── generations ───────────────────────────────────────────────────────────────
-- One row per repurpose run.
create table public.generations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles (id) on delete cascade,
  input_text    text not null,
  tone          text not null,
  platforms     text[] not null,
  results       jsonb not null,
  word_count    integer not null default 0,
  created_at    timestamptz not null default now()
);

alter table public.generations enable row level security;

create policy "Users can read own generations"
  on public.generations for select
  using (auth.uid() = user_id);

create policy "Users can insert own generations"
  on public.generations for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own generations"
  on public.generations for delete
  using (auth.uid() = user_id);

-- Index for fast per-user history queries
create index generations_user_id_created_at_idx
  on public.generations (user_id, created_at desc);
