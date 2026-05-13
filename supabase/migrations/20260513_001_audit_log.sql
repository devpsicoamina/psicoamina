-- Append-only audit log for sensitive user actions (Manual §S9 + LGPD).
-- Filled via the log_audit_event RPC. Service_role writes, users read only own rows.

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id BIGSERIAL PRIMARY KEY,
  user_auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  entity_type text,
  entity_id text,
  metadata jsonb DEFAULT '{}'::jsonb,
  ip text,
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS audit_logs_user_created_idx
  ON public.audit_logs(user_auth_id, created_at DESC);
CREATE INDEX IF NOT EXISTS audit_logs_action_created_idx
  ON public.audit_logs(action, created_at DESC);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Users can read only their own audit trail.
DROP POLICY IF EXISTS "users_read_own_audit" ON public.audit_logs;
CREATE POLICY "users_read_own_audit" ON public.audit_logs
  FOR SELECT USING (user_auth_id = auth.uid());

-- Never updateable / deletable from clients. service_role bypasses RLS for writes.
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.audit_logs FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE ON public.audit_logs FROM anon;

-- RPC for the client to log its own events (login, etc).
-- SECURITY DEFINER so it can INSERT bypassing the REVOKE above, but always
-- forces user_auth_id = auth.uid() to prevent impersonation.
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action text,
  p_entity_type text DEFAULT NULL,
  p_entity_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501';
  END IF;
  INSERT INTO public.audit_logs (user_auth_id, action, entity_type, entity_id, metadata)
  VALUES (v_uid, p_action, p_entity_type, p_entity_id, COALESCE(p_metadata, '{}'::jsonb));
END;
$$;

REVOKE ALL ON FUNCTION public.log_audit_event(text, text, text, jsonb) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.log_audit_event(text, text, text, jsonb) TO authenticated, service_role;
