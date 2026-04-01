-- Phase E: Consumer Profile / Contact Info Capture
-- Adds fields to the cases table to capture the consumer's identity and
-- contact information permanently for outbound drafts and communications,
-- distinct from the backend auth.users profile.

alter table public.cases
  add column if not exists consumer_name text,
  add column if not exists consumer_email text,
  add column if not exists consumer_phone text;
