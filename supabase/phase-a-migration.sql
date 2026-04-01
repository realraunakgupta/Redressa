-- ============================================
-- Redressa AI - Phase A Migration
-- Supervised Escalation Agent: Auth Foundation
-- ============================================
-- Run this in the Supabase SQL Editor AFTER the base schema.sql
-- Safe to run multiple times (uses IF NOT EXISTS / ON CONFLICT).
-- ============================================

-- ============================================
-- 1. user_profiles
-- ============================================
-- One row per authenticated user (created on first sign-in).

create table if not exists user_profiles (
  id              uuid primary key references auth.users(id) on delete cascade,
  email           text not null,
  display_name    text,
  avatar_url      text,
  default_mode    text not null default 'assisted'
                  check (default_mode in ('manual','assisted','autopilot')),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-update updated_at
create or replace function update_user_profiles_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists user_profiles_updated_at on user_profiles;
create trigger user_profiles_updated_at
  before update on user_profiles
  for each row execute function update_user_profiles_updated_at();

-- ============================================
-- 2. Add user_id to cases (nullable for existing rows)
-- ============================================

alter table cases
  add column if not exists user_id uuid references auth.users(id) on delete set null,
  add column if not exists automation_mode text not null default 'assisted'
    check (automation_mode in ('manual','assisted','autopilot'));

create index if not exists idx_cases_user_id on cases(user_id);

-- ============================================
-- 3. Row Level Security — user_profiles
-- ============================================

alter table user_profiles enable row level security;

-- Users can read and update only their own profile
drop policy if exists "user_read_own_profile" on user_profiles;
create policy "user_read_own_profile"
  on user_profiles for select
  using (auth.uid() = id);

drop policy if exists "user_update_own_profile" on user_profiles;
create policy "user_update_own_profile"
  on user_profiles for update
  using (auth.uid() = id);

-- Service role can insert new profiles (on first sign-in via API route)
drop policy if exists "service_insert_profile" on user_profiles;
create policy "service_insert_profile"
  on user_profiles for insert
  with check (true);  -- service role bypasses RLS anyway; anon insert blocked by auth

-- ============================================
-- 4. Update cases RLS — scope to user_id
-- ============================================

-- Drop the old permissive anon read policy
drop policy if exists "anon_read_cases" on cases;

-- Authenticated users see only their own cases
-- Unauthenticated users see only demo cases (is_demo = true)
drop policy if exists "scoped_read_cases" on cases;
create policy "scoped_read_cases"
  on cases for select
  using (
    (auth.uid() is not null and (user_id = auth.uid() or user_id is null))
    or is_demo = true
  );

-- Only authenticated users can insert new cases
drop policy if exists "anon_insert_cases" on cases;
drop policy if exists "auth_insert_cases" on cases;
create policy "auth_insert_cases"
  on cases for insert
  with check (auth.uid() is not null);

-- ============================================
-- 5. Auto-create user_profile on first sign-in
-- ============================================
-- Supabase fires this trigger when a new auth.users row is created.

create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
