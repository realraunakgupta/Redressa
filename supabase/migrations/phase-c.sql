-- Phase C: Inbound Reply Ingestion Schema
-- Connects replies to communication threads and stores AI classification.

create table if not exists public.inbound_messages (
  id              uuid primary key default gen_random_uuid(),
  thread_id       uuid not null references public.communication_threads(id) on delete cascade,
  case_id         uuid not null references public.cases(id) on delete cascade,
  user_id         uuid not null references auth.users(id) on delete cascade,
  gmail_message_id text not null unique,
  
  subject         text not null,
  body            text not null,
  from_address    text not null,
  to_address      text not null,
  
  classification_category text check (classification_category in (
    'resolved', 'partial_resolution', 'stalling', 'asking_for_info',
    'rejecting_liability', 'escalating_internally', 'unclear'
  )),
  classification_reason text,
  
  parent_message_id text, -- ID of the specific email being replied to (if any)
  received_at     timestamptz not null,
  created_at      timestamptz not null default now()
);

create index if not exists idx_inbound_thread on public.inbound_messages(thread_id);
create index if not exists idx_inbound_case on public.inbound_messages(case_id);

alter table public.inbound_messages enable row level security;
create policy "Users can view their own inbound messages" on public.inbound_messages for select using (auth.uid() = user_id);
create policy "Users can update their own inbound messages" on public.inbound_messages for update using (auth.uid() = user_id);
