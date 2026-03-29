-- ============================================
-- Redressa AI - Supabase Schema (Phase 1 MVP)
-- ============================================
-- Run this entire file in the Supabase SQL Editor.
-- Order matters: tables are created in dependency order.
-- ============================================

-- Enable UUID generation
create extension if not exists "uuid-ossp";

-- ============================================
-- 1. cases
-- ============================================
-- One row per complaint. Central table.

create table cases (
  id            uuid primary key default uuid_generate_v4(),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  status        text not null default 'intake'
                check (status in ('intake','processing','evaluated','complete','error')),
  category      text check (category in ('aviation','ecommerce')),
  subcategory   text,
  description   text not null default '',
  merchant_name text,
  order_reference text,
  amount        numeric(12,2),
  currency      text not null default 'INR',
  is_demo       boolean not null default false
);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger cases_updated_at
  before update on cases
  for each row execute function update_updated_at();

-- ============================================
-- 2. case_files
-- ============================================
-- Evidence files uploaded for a case.

create table case_files (
  id          uuid primary key default uuid_generate_v4(),
  case_id     uuid not null references cases(id) on delete cascade,
  file_name   text not null,
  file_type   text not null default 'pdf'
              check (file_type in ('pdf','image','text','email','screenshot')),
  storage_path text not null,
  file_url    text,
  mime_type   text,
  file_size   integer,
  parsed_text text,
  created_at  timestamptz not null default now()
);

create index idx_case_files_case_id on case_files(case_id);

-- ============================================
-- 3. case_events
-- ============================================
-- Agent Activity log. One row per pipeline step event.

create table case_events (
  id          uuid primary key default uuid_generate_v4(),
  case_id     uuid not null references cases(id) on delete cascade,
  event_type  text not null
              check (event_type in (
                'intake_received','parsing_started','parsing_complete',
                'extraction_complete','timeline_assembled',
                'classification_complete','policy_retrieved',
                'regulation_retrieved','evaluation_complete',
                'route_recommended','outputs_generated','error'
              )),
  title       text not null,
  detail      text,
  metadata    jsonb default '{}',
  created_at  timestamptz not null default now()
);

create index idx_case_events_case_id on case_events(case_id);
create index idx_case_events_created on case_events(case_id, created_at);

-- ============================================
-- 4. policy_documents
-- ============================================
-- Top-level policy or regulation source.

create table policy_documents (
  id            uuid primary key default uuid_generate_v4(),
  title         text not null,
  source_type   text not null
                check (source_type in ('company_policy','regulation')),
  company_name  text,
  category      text not null
                check (category in ('aviation','ecommerce')),
  source_url    text,
  last_updated  timestamptz not null default now(),
  created_at    timestamptz not null default now()
);

-- ============================================
-- 5. policy_chunks
-- ============================================
-- Chunked sections of a policy document for retrieval.

create table policy_chunks (
  id            uuid primary key default uuid_generate_v4(),
  document_id   uuid not null references policy_documents(id) on delete cascade,
  section_label text not null,
  content       text not null,
  chunk_index   integer not null default 0,
  keywords      text[] default '{}',
  created_at    timestamptz not null default now()
);

create index idx_policy_chunks_doc on policy_chunks(document_id);
create index idx_policy_chunks_section on policy_chunks(document_id, chunk_index);

-- ============================================
-- 6. generated_outputs
-- ============================================
-- Pipeline-generated outputs for a case.

create table generated_outputs (
  id          uuid primary key default uuid_generate_v4(),
  case_id     uuid not null references cases(id) on delete cascade,
  output_type text not null
              check (output_type in (
                'case_summary','grievance_email','escalation_note',
                'evidence_checklist','evidence_pack_preview'
              )),
  title       text not null,
  content     text not null default '',
  citations   jsonb not null default '[]',
  created_at  timestamptz not null default now()
);

create index idx_generated_outputs_case on generated_outputs(case_id);

-- ============================================
-- Storage bucket for evidence files
-- ============================================
-- Run this separately if needed, or create via Supabase dashboard:
-- insert into storage.buckets (id, name, public)
-- values ('evidence', 'evidence', false);

-- ============================================
-- Row Level Security (minimal, no auth)
-- ============================================
-- For the hackathon MVP without auth, we allow all operations
-- via the service role key (server-side only).
-- The anon key gets read access for the UI.

alter table cases enable row level security;
alter table case_files enable row level security;
alter table case_events enable row level security;
alter table policy_documents enable row level security;
alter table policy_chunks enable row level security;
alter table generated_outputs enable row level security;

-- Anon can read everything (no auth needed for hackathon)
create policy "anon_read_cases" on cases for select using (true);
create policy "anon_read_case_files" on case_files for select using (true);
create policy "anon_read_case_events" on case_events for select using (true);
create policy "anon_read_policy_documents" on policy_documents for select using (true);
create policy "anon_read_policy_chunks" on policy_chunks for select using (true);
create policy "anon_read_generated_outputs" on generated_outputs for select using (true);

-- Anon can also insert cases (intake form, no auth)
create policy "anon_insert_cases" on cases for insert with check (true);
create policy "anon_insert_case_files" on case_files for insert with check (true);

-- Service role bypasses RLS automatically, so server-side
-- operations (pipeline writes) work without extra policies.
