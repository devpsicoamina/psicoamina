-- Fix: na migration anterior usei CTE com SELECT INTO em 2 statements,
-- o que não funciona em PL/pgSQL (o CTE só vive dentro de UM statement).
-- Refazendo com a base como subquery em cada SELECT INTO.

CREATE OR REPLACE FUNCTION public.admin_users_rich_list(p_limit int DEFAULT 200)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_role text;
  v_rows jsonb;
  v_counts jsonb;
BEGIN
  SELECT role INTO v_role FROM public.users WHERE user_auth_id = auth.uid();
  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT jsonb_build_object(
      'all', count(*),
      'active', count(*) FILTER (WHERE coalesce(up.subscription_active, false) AND coalesce(up.role, 'user') <> 'admin'),
      'inactive', count(*) FILTER (WHERE (NOT coalesce(up.subscription_active, false)) AND coalesce(up.role, 'user') <> 'admin'),
      'admin', count(*) FILTER (WHERE up.role = 'admin')
    ) INTO v_counts
    FROM auth.users a
    LEFT JOIN public.users up ON up.user_auth_id = a.id;

  SELECT COALESCE(jsonb_agg(u ORDER BY (u->>'auth_created') DESC), '[]'::jsonb)
    INTO v_rows
    FROM (
      SELECT jsonb_build_object(
        'user_auth_id', a.id,
        'email', a.email,
        'fullname', up.fullname,
        'phone', up.phone,
        'role', coalesce(up.role, 'user'),
        'plan_type', up.plan_type,
        'subscription_active', coalesce(up.subscription_active, false),
        'current_period_end', up.current_period_end,
        'last_sign_in_at', a.last_sign_in_at,
        'auth_created', a.created_at,
        'email_confirmed_at', a.email_confirmed_at,
        'lgpd_accepted_at', up.lgpd_consents_accepted_at,
        'msg_count', coalesce(ue.msg_count, 0),
        'login_count', coalesce(ue.login_count, 0)
      ) AS u
      FROM auth.users a
      LEFT JOIN public.users up ON up.user_auth_id = a.id
      LEFT JOIN public.user_engagement_state ue ON ue.user_auth_id = a.id
      ORDER BY a.created_at DESC
      LIMIT p_limit
    ) sub;

  RETURN jsonb_build_object('counts', v_counts, 'rows', v_rows);
END;
$$;
