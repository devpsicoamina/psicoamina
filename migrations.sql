-- ColméIA Infantil — Migrations for production
-- Run these in Supabase SQL Editor (in order)

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS subscription_active boolean DEFAULT false;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS plan_type text DEFAULT 'monthly';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS attached_file_text text;
ALTER TABLE public.chats ADD COLUMN IF NOT EXISTS attached_file_name text;

-- Storage bucket for chat attachments (future use)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('chat-attachments', 'chat-attachments', false);

-- Monthly cron job to reset tokens
-- Requires pg_cron and pg_net extensions enabled
-- CREATE EXTENSION IF NOT EXISTS pg_cron;

-- SELECT cron.schedule(
--   'reset-monthly-tokens',
--   '0 0 1 * *',
--   $$
--   SELECT net.http_post(
--     url := 'YOUR_SUPABASE_URL/functions/v1/reset-monthly-tokens',
--     headers := jsonb_build_object(
--       'Content-Type', 'application/json',
--       'X-Cron-Secret', 'YOUR_CRON_SECRET'
--     ),
--     body := '{}'::jsonb
--   );
--   $$
-- );
