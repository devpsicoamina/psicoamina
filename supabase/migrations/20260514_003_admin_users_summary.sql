-- RPC pro admin listar usuários cadastrados com informações chave.
-- Retorna: email, fullname, plan_type, subscription_active, current_period_end,
-- last_sign_in_at, created_at, role, whatsapp (não temos no banco — placeholder NULL).

CREATE OR REPLACE FUNCTION public.admin_users_list(
  p_limit int DEFAULT 100,
  p_offset int DEFAULT 0
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  v_role text;
  v_rows jsonb;
  v_total int;
BEGIN
  SELECT role INTO v_role FROM public.users WHERE user_auth_id = auth.uid();
  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;

  SELECT count(*) INTO v_total FROM auth.users;

  SELECT COALESCE(jsonb_agg(u ORDER BY (u->>'created_at') DESC), '[]'::jsonb)
    INTO v_rows
    FROM (
      SELECT jsonb_build_object(
               'user_auth_id', a.id,
               'email', a.email,
               'email_confirmed_at', a.email_confirmed_at,
               'last_sign_in_at', a.last_sign_in_at,
               'created_at', a.created_at,
               'fullname', up.fullname,
               'role', COALESCE(up.role, 'user'),
               'plan_type', up.plan_type,
               'subscription_active', COALESCE(up.subscription_active, false),
               'current_period_end', up.current_period_end,
               'lgpd_accepted_at', up.lgpd_consents_accepted_at,
               'profile_pic_url', up.profile_pic_url
             ) AS u
        FROM auth.users a
        LEFT JOIN public.users up ON up.user_auth_id = a.id
       ORDER BY a.created_at DESC
       LIMIT p_limit OFFSET p_offset
    ) sub;

  RETURN jsonb_build_object(
    'total', v_total,
    'limit', p_limit,
    'offset', p_offset,
    'rows', v_rows
  );
END;
$$;

REVOKE ALL ON FUNCTION public.admin_users_list(int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_users_list(int, int) TO authenticated, service_role;
