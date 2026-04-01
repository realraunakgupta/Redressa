-- Phase B: Assisted Outbound Sending Schema
-- Adds OAuth accounts, communication threads, outbound messages,
-- and approval events for Gmail-assisted escalation workflows.

-- 1. oauth_accounts
create table if not exists public.oauth_accounts (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references auth.users(id) on delete cascade,
  provider         text not null default 'google' check (provider in ('google')),
  gmail_address    text not null,
  access_token     text not null,
  refresh_token    text not null,
  token_expires_at timestamptz not null,
  scopes           text[] not null default '{}',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.oauth_accounts enable row level security;

drop policy if exists "Users can view their own oauth accounts" on public.oauth_accounts;
create policy "Users can view their own oauth accounts"
  on public.oauth_accounts for select
  using (auth.uid() = user_id);

-- No insert/update policy from client; OAuth account writes remain server-side only.

-- 2. communication_threads
create table if not exists public.communication_threads (
  id                uuid primary key default gen_random_uuid(),
  case_id           uuid not null references public.cases(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  escalation_target text not null,
  target_email      text not null,
  target_name       text not null,
  channel           text not null default 'email' check (channel in ('email')),
  state             text not null default 'draft'
                     check (state in (
                       'draft','ready_to_send','sent','awaiting_reply',
                       'reply_received','needs_user_input','ready_to_follow_up',
                       'paused','escalated','resolved','closed'
                     )),
  gmail_thread_id   text,
  automation_mode   text not null default 'manual'
                     check (automation_mode in ('manual','assisted','autopilot')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_threads_case on public.communication_threads(case_id);
create index if not exists idx_threads_user on public.communication_threads(user_id);
create index if not exists idx_threads_state on public.communication_threads(state);

alter table public.communication_threads enable row level security;

drop policy if exists "Users can view their own threads" on public.communication_threads;
create policy "Users can view their own threads"
  on public.communication_threads for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own threads" on public.communication_threads;
create policy "Users can update their own threads"
  on public.communication_threads for update
  using (auth.uid() = user_id);

-- 3. outbound_messages
create table if not exists public.outbound_messages (
  id                uuid primary key default gen_random_uuid(),
  thread_id         uuid not null references public.communication_threads(id) on delete cascade,
  case_id           uuid not null references public.cases(id) on delete cascade,
  user_id           uuid not null references auth.users(id) on delete cascade,
  subject           text not null,
  body              text not null,
  from_address      text not null,
  to_address        text not null,
  status            text not null default 'draft'
                     check (status in ('draft','approved','sending','sent','failed')),
  gmail_message_id  text,
  sent_at           timestamptz,
  approval_required boolean not null default true,
  approved_at       timestamptz,
  approved_by       uuid references auth.users(id),
  generation_source text not null default 'pipeline'
                     check (generation_source in ('pipeline','user_edit','ai_followup')),
  created_at        timestamptz not null default now()
);

create index if not exists idx_outbound_thread on public.outbound_messages(thread_id);
create index if not exists idx_outbound_status on public.outbound_messages(status);

alter table public.outbound_messages enable row level security;

drop policy if exists "Users can view their own outbound messages" on public.outbound_messages;
create policy "Users can view their own outbound messages"
  on public.outbound_messages for select
  using (auth.uid() = user_id);

drop policy if exists "Users can update their own outbound messages" on public.outbound_messages;
create policy "Users can update their own outbound messages"
  on public.outbound_messages for update
  using (auth.uid() = user_id);

-- 4. approval_events
create table if not exists public.approval_events (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid not null references public.outbound_messages(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  action      text not null check (action in ('approved','rejected','edited_and_approved')),
  edited_body text,
  reason      text,
  created_at  timestamptz not null default now()
);

alter table public.approval_events enable row level security;

drop policy if exists "Users can view their own approval events" on public.approval_events;
create policy "Users can view their own approval events"
  on public.approval_events for select
  using (auth.uid() = user_id);

drop policy if exists "Users can insert their own approval events" on public.approval_events;
create policy "Users can insert their own approval events"
  on public.approval_events for insert
  with check (auth.uid() = user_id);
