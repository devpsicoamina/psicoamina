-- ============================================================
-- PsicoAmina — Migrations for production
-- Run these in Supabase SQL Editor (in order)
-- ============================================================

-- 1. Add subscription columns to users table (if not exist)
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_active boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'monthly';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- 2. Add file attachment columns to chats (for future PDF upload feature)
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS attached_file_text text;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS attached_file_name text;

-- 3. Create storage bucket for chat attachments (future use)
-- Run in SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', false);

-- 4. Monthly cron job to reset tokens
-- NOTE: Requires pg_cron extension enabled (Supabase Dashboard → Database → Extensions → pg_cron)
-- NOTE: Replace YOUR_SUPABASE_URL and YOUR_SERVICE_ROLE_KEY with actual values

-- Enable pg_cron if not already
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Schedule reset for 1st of every month at midnight UTC
-- SELECT cron.schedule(
--   'reset-monthly-tokens',
--   '0 0 1 * *',
--   $$
--   SELECT net.http_post(
--     url := 'YOUR_SUPABASE_URL/functions/v1/reset-monthly-tokens',
--     headers := '{"Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'::jsonb
--   ) AS request_id
--   $$
-- );

-- 5. Verify RLS policies exist for new columns
-- The existing "Enable users to view their own data only" policy on users table
-- already covers the new columns since it uses ALL command.
-- No additional policies needed.
