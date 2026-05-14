-- Granular AI cost tracking. Every chat-ai call inserts one row here.
-- Admin dashboard reads aggregated data via admin_cost_summary RPC.

CREATE TABLE IF NOT EXISTS public.ai_usage_events (
  id BIGSERIAL PRIMARY KEY,
  user_auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  agent_type text,
  model text NOT NULL,
  prompt_tokens int NOT NULL DEFAULT 0,
  cached_prompt_tokens int NOT NULL DEFAULT 0,
  completion_tokens int NOT NULL DEFAULT 0,
  cost_usd numeric(12, 8) NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS ai_usage_events_user_created_idx
  ON public.ai_usage_events(user_auth_id, created_at DESC);
CREATE INDEX IF NOT EXISTS ai_usage_events_created_idx
  ON public.ai_usage_events(created_at DESC);

ALTER TABLE public.ai_usage_events ENABLE ROW LEVEL SECURITY;
-- No client policies — only service_role (Edge Function) writes, admin reads via RPC.

REVOKE INSERT, UPDATE, DELETE, TRUNCATE, SELECT ON public.ai_usage_events FROM authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, SELECT ON public.ai_usage_events FROM anon;

-- Admin-only aggregated summary. Returns:
--   { total_usd, total_brl, total_tokens, by_day: [...], top_users: [...] }
-- Caller must have role='admin' in public.users (enforced inside).
CREATE OR REPLACE FUNCTION public.admin_cost_summary(
  p_days int DEFAULT 30,
  p_usd_brl numeric DEFAULT 5.20
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
  v_result jsonb;
  v_total_usd numeric;
  v_total_tokens bigint;
  v_by_day jsonb;
  v_top_users jsonb;
  v_since timestamptz;
BEGIN
  SELECT role INTO v_role FROM public.users WHERE user_auth_id = auth.uid();
  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  v_since := now() - make_interval(days => p_days);

  SELECT COALESCE(sum(cost_usd), 0),
         COALESCE(sum(prompt_tokens + completion_tokens), 0)
    INTO v_total_usd, v_total_tokens
    FROM public.ai_usage_events
   WHERE created_at >= v_since;

  SELECT COALESCE(jsonb_agg(d ORDER BY (d->>'day') DESC), '[]'::jsonb)
    INTO v_by_day
    FROM (
      SELECT jsonb_build_object(
               'day', to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD'),
               'cost_usd', sum(cost_usd),
               'tokens', sum(prompt_tokens + completion_tokens),
               'requests', count(*)
             ) AS d
        FROM public.ai_usage_events
       WHERE created_at >= v_since
    GROUP BY to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD')
    ) sub;

  SELECT COALESCE(jsonb_agg(u ORDER BY (u->>'cost_usd')::numeric DESC), '[]'::jsonb)
    INTO v_top_users
    FROM (
      SELECT jsonb_build_object(
               'user_auth_id', e.user_auth_id,
               'email', a.email,
               'fullname', up.fullname,
               'cost_usd', sum(e.cost_usd),
               'tokens', sum(e.prompt_tokens + e.completion_tokens),
               'requests', count(*)
             ) AS u
        FROM public.ai_usage_events e
        LEFT JOIN auth.users a ON a.id = e.user_auth_id
        LEFT JOIN public.users up ON up.user_auth_id = e.user_auth_id
       WHERE e.created_at >= v_since
         AND e.user_auth_id IS NOT NULL
    GROUP BY e.user_auth_id, a.email, up.fullname
       LIMIT 20
    ) sub;

  v_result := jsonb_build_object(
    'since', v_since,
    'usd_brl', p_usd_brl,
    'total_usd', v_total_usd,
    'total_brl', v_total_usd * p_usd_brl,
    'total_tokens', v_total_tokens,
    'by_day', v_by_day,
    'top_users', v_top_users
  );
  RETURN v_result;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_cost_summary(int, numeric) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_cost_summary(int, numeric) TO authenticated, service_role;

-- Admin-only settings (budget alert threshold etc).
CREATE TABLE IF NOT EXISTS public.admin_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_settings FROM authenticated, anon;
-- Only service_role + the admin_cost_summary RPC touch this.

INSERT INTO public.admin_settings (key, value) VALUES
  ('budget_monthly_brl', '300'::jsonb),
  ('alert_threshold_pct', '80'::jsonb),
  ('usd_brl_rate', '5.20'::jsonb)
ON CONFLICT (key) DO NOTHING;
