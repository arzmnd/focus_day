-- ============================================================
-- Focus Day — Supabase Schema
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- ============================================================

-- 1. Tasks table
create table public.tasks (
  id text primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  category text not null check (category in ('thing', 'important', 'maintenance')),
  date date not null,
  notes text not null default '',
  project text not null default '',
  recurrence jsonb not null default '{"type":"none"}'::jsonb,
  created_at bigint not null default (extract(epoch from now()) * 1000)::bigint
);

-- 2. Completions table (composite key: one completion per task per date per user)
create table public.completions (
  user_id uuid not null references auth.users(id) on delete cascade,
  task_id text not null references public.tasks(id) on delete cascade,
  date date not null,
  completed_at timestamptz not null default now(),
  primary key (user_id, task_id, date)
);

-- 3. User settings table
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  limits jsonb not null default '{"thing":1,"important":3,"maintenance":99}'::jsonb,
  updated_at timestamptz not null default now()
);

-- ============================================================
-- Indexes
-- ============================================================
create index idx_tasks_user_id on public.tasks(user_id);
create index idx_tasks_user_date on public.tasks(user_id, date);
create index idx_completions_user_id on public.completions(user_id);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

-- Tasks
alter table public.tasks enable row level security;

create policy "Users can view own tasks"
  on public.tasks for select using (auth.uid() = user_id);

create policy "Users can insert own tasks"
  on public.tasks for insert with check (auth.uid() = user_id);

create policy "Users can update own tasks"
  on public.tasks for update using (auth.uid() = user_id);

create policy "Users can delete own tasks"
  on public.tasks for delete using (auth.uid() = user_id);

-- Completions
alter table public.completions enable row level security;

create policy "Users can view own completions"
  on public.completions for select using (auth.uid() = user_id);

create policy "Users can insert own completions"
  on public.completions for insert with check (auth.uid() = user_id);

create policy "Users can delete own completions"
  on public.completions for delete using (auth.uid() = user_id);

-- User settings
alter table public.user_settings enable row level security;

create policy "Users can view own settings"
  on public.user_settings for select using (auth.uid() = user_id);

create policy "Users can insert own settings"
  on public.user_settings for insert with check (auth.uid() = user_id);

create policy "Users can update own settings"
  on public.user_settings for update using (auth.uid() = user_id);

-- ============================================================
-- Function: auto-create user_settings on first sign-in
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_settings (user_id)
  values (new.id)
  on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
