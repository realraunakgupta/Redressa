-- ============================================
-- Phase D - Global Auth Fix
-- ============================================

-- Add user_id to the base cases table so we can track which user filed which claim.
alter table cases add column if not exists user_id uuid references auth.users(id);

-- Force PostgREST to reload the schema cache so the API recognizes the new column immediately
notify pgrst, 'reload schema';
