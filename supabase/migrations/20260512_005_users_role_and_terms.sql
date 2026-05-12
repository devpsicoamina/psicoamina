-- 1. Add `role` column for admin gating on sync_agent_prompt.
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'user';

ALTER TABLE public.users
  ADD CONSTRAINT users_role_chk CHECK (role IN ('user', 'admin'));

-- 2. Terms acceptance tracking (LGPD §S11).
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS accepted_terms_at timestamptz,
  ADD COLUMN IF NOT EXISTS accepted_terms_version text;

-- 3. Lock down billing-controlled columns via column-level grants.
-- Mass-assignment defense: even with an over-broad UPDATE policy, clients can't write these.
REVOKE UPDATE (subscription_active, plan_type, current_period_end, role)
  ON public.users FROM authenticated;
REVOKE UPDATE (subscription_active, plan_type, current_period_end, role)
  ON public.users FROM anon;

-- 4. Bootstrap your own admin role. Replace EMAIL_HERE with your account email
-- after running the rest of the migrations.
--
-- UPDATE public.users
--    SET role = 'admin'
--  WHERE user_auth_id = (SELECT id FROM auth.users WHERE lower(email) = 'EMAIL_HERE');
