-- Sistema de feedback + tracking de engajamento + telefone do user.
-- Tabela feedbacks: armazena tudo que usuário envia (sugestão, bug, geral).
-- Tabela user_engagement_state: tracking de msg_count + login_count + triggers já mostrados.

-- ============================================================
-- 1. users.phone (opcional, pra contato WhatsApp do admin)
-- ============================================================
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS phone text;

-- Permitir o usuário atualizar o próprio telefone
GRANT UPDATE (phone) ON public.users TO authenticated;

-- ============================================================
-- 2. feedbacks
-- ============================================================
CREATE TABLE IF NOT EXISTS public.feedbacks (
  id BIGSERIAL PRIMARY KEY,
  user_auth_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- 'geral' | 'bug' | 'sugestao' | 'elogio'
  type text NOT NULL DEFAULT 'geral',
  -- rating opcional (1-5), nem todo feedback tem
  rating int,
  message text NOT NULL,
  -- onde foi enviado: 'modal-10msgs' | 'modal-3logins' | 'modal-10logins' | 'manual'
  source text NOT NULL DEFAULT 'manual',
  -- pra workflow do admin: 'new' | 'read' | 'resolved' | 'archived'
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feedbacks_status_created_idx ON public.feedbacks(status, created_at DESC);
CREATE INDEX IF NOT EXISTS feedbacks_user_created_idx ON public.feedbacks(user_auth_id, created_at DESC);
CREATE INDEX IF NOT EXISTS feedbacks_type_idx ON public.feedbacks(type);

ALTER TABLE public.feedbacks ENABLE ROW LEVEL SECURITY;

-- User lê só os próprios; admin lê todos via RPC
DROP POLICY IF EXISTS "users_read_own_feedback" ON public.feedbacks;
CREATE POLICY "users_read_own_feedback" ON public.feedbacks
  FOR SELECT USING (user_auth_id = auth.uid());

REVOKE INSERT, UPDATE, DELETE ON public.feedbacks FROM authenticated, anon;
-- INSERT só via RPC submit_feedback (SECURITY DEFINER)

-- ============================================================
-- 3. user_engagement_state (tracking pra disparar modais)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.user_engagement_state (
  user_auth_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  msg_count int NOT NULL DEFAULT 0,
  login_count int NOT NULL DEFAULT 0,
  feedback_submitted_at timestamptz,
  -- Quais triggers já mostraram modal (independente do user ter enviado ou fechado):
  --   {"10msgs": "shown" | "submitted" | "dismissed", "3logins": ..., "10logins": ...}
  triggers_state jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_engagement_state ENABLE ROW LEVEL SECURITY;
-- Sem políticas — só service_role acessa via RPCs.

-- ============================================================
-- 4. RPC: record_message_event
-- Chamado pelo chat-ai após cada mensagem enviada com sucesso.
-- Retorna { "trigger": "10msgs" | null } se algum modal deve disparar.
-- ============================================================
CREATE OR REPLACE FUNCTION public.record_message_event()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_count int;
  v_triggers jsonb;
  v_already_submitted boolean;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.user_engagement_state (user_auth_id, msg_count, login_count)
  VALUES (v_uid, 1, 0)
  ON CONFLICT (user_auth_id) DO UPDATE
    SET msg_count = public.user_engagement_state.msg_count + 1,
        updated_at = now()
  RETURNING msg_count, triggers_state, (feedback_submitted_at IS NOT NULL)
    INTO v_count, v_triggers, v_already_submitted;

  -- Se user já enviou feedback alguma vez, não dispara mais nada
  IF v_already_submitted THEN
    RETURN jsonb_build_object('trigger', null);
  END IF;

  -- Trigger ao atingir exatamente 10 mensagens, se ainda não mostramos
  IF v_count = 10 AND (v_triggers->>'10msgs') IS NULL THEN
    UPDATE public.user_engagement_state
       SET triggers_state = jsonb_set(triggers_state, '{10msgs}', '"shown"')
     WHERE user_auth_id = v_uid;
    RETURN jsonb_build_object('trigger', '10msgs');
  END IF;

  RETURN jsonb_build_object('trigger', null);
END;
$$;

REVOKE ALL ON FUNCTION public.record_message_event() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_message_event() TO authenticated, service_role;

-- ============================================================
-- 5. RPC: record_login_event
-- Chamado no SIGNED_IN do AuthContext (1x por sessão).
-- ============================================================
CREATE OR REPLACE FUNCTION public.record_login_event()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_count int;
  v_triggers jsonb;
  v_already_submitted boolean;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501';
  END IF;

  INSERT INTO public.user_engagement_state (user_auth_id, msg_count, login_count)
  VALUES (v_uid, 0, 1)
  ON CONFLICT (user_auth_id) DO UPDATE
    SET login_count = public.user_engagement_state.login_count + 1,
        updated_at = now()
  RETURNING login_count, triggers_state, (feedback_submitted_at IS NOT NULL)
    INTO v_count, v_triggers, v_already_submitted;

  IF v_already_submitted THEN
    RETURN jsonb_build_object('trigger', null);
  END IF;

  IF v_count = 10 AND (v_triggers->>'10logins') IS NULL THEN
    UPDATE public.user_engagement_state
       SET triggers_state = jsonb_set(triggers_state, '{10logins}', '"shown"')
     WHERE user_auth_id = v_uid;
    RETURN jsonb_build_object('trigger', '10logins');
  END IF;

  IF v_count = 3 AND (v_triggers->>'3logins') IS NULL THEN
    UPDATE public.user_engagement_state
       SET triggers_state = jsonb_set(triggers_state, '{3logins}', '"shown"')
     WHERE user_auth_id = v_uid;
    RETURN jsonb_build_object('trigger', '3logins');
  END IF;

  RETURN jsonb_build_object('trigger', null);
END;
$$;

REVOKE ALL ON FUNCTION public.record_login_event() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_login_event() TO authenticated, service_role;

-- ============================================================
-- 6. RPC: dismiss_feedback_trigger
-- Usuário fechou modal sem enviar — marca como dismissed pra esse trigger.
-- ============================================================
CREATE OR REPLACE FUNCTION public.dismiss_feedback_trigger(p_trigger text)
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
  IF p_trigger NOT IN ('10msgs', '3logins', '10logins') THEN
    RAISE EXCEPTION 'invalid_trigger';
  END IF;

  UPDATE public.user_engagement_state
     SET triggers_state = jsonb_set(triggers_state, ARRAY[p_trigger], '"dismissed"'),
         updated_at = now()
   WHERE user_auth_id = v_uid;
END;
$$;

REVOKE ALL ON FUNCTION public.dismiss_feedback_trigger(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.dismiss_feedback_trigger(text) TO authenticated, service_role;

-- ============================================================
-- 7. RPC: submit_feedback
-- Usuário enviou feedback. INSERT + marca todos os triggers como submitted.
-- ============================================================
CREATE OR REPLACE FUNCTION public.submit_feedback(
  p_type text,
  p_message text,
  p_source text DEFAULT 'manual',
  p_rating int DEFAULT NULL
)
RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_uid uuid;
  v_id bigint;
BEGIN
  v_uid := auth.uid();
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'unauthenticated' USING ERRCODE = '42501';
  END IF;
  IF length(coalesce(p_message, '')) < 3 THEN
    RAISE EXCEPTION 'message_too_short';
  END IF;
  IF length(p_message) > 5000 THEN
    RAISE EXCEPTION 'message_too_long';
  END IF;
  IF p_type NOT IN ('geral', 'bug', 'sugestao', 'elogio') THEN
    RAISE EXCEPTION 'invalid_type';
  END IF;

  INSERT INTO public.feedbacks (user_auth_id, type, message, source, rating)
  VALUES (v_uid, p_type, p_message, p_source, p_rating)
  RETURNING id INTO v_id;

  -- Marcar feedback como submitted (pra não disparar mais modais)
  INSERT INTO public.user_engagement_state (user_auth_id, feedback_submitted_at)
  VALUES (v_uid, now())
  ON CONFLICT (user_auth_id) DO UPDATE
    SET feedback_submitted_at = COALESCE(public.user_engagement_state.feedback_submitted_at, now()),
        updated_at = now();

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.submit_feedback(text, text, text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.submit_feedback(text, text, text, int) TO authenticated, service_role;

-- ============================================================
-- 8. RPC: admin_feedbacks_list
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_feedbacks_list(
  p_filter text DEFAULT 'all',
  p_limit int DEFAULT 100
)
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
    'total', count(*),
    'new', count(*) FILTER (WHERE status = 'new'),
    'bug', count(*) FILTER (WHERE type = 'bug'),
    'sugestao', count(*) FILTER (WHERE type = 'sugestao'),
    'geral', count(*) FILTER (WHERE type = 'geral'),
    'elogio', count(*) FILTER (WHERE type = 'elogio')
  ) INTO v_counts FROM public.feedbacks;

  SELECT COALESCE(jsonb_agg(row ORDER BY (row->>'created_at') DESC), '[]'::jsonb)
    INTO v_rows
    FROM (
      SELECT jsonb_build_object(
               'id', f.id,
               'type', f.type,
               'rating', f.rating,
               'message', f.message,
               'source', f.source,
               'status', f.status,
               'created_at', f.created_at,
               'user_auth_id', f.user_auth_id,
               'email', a.email,
               'fullname', up.fullname,
               'phone', up.phone
             ) AS row
        FROM public.feedbacks f
        LEFT JOIN auth.users a ON a.id = f.user_auth_id
        LEFT JOIN public.users up ON up.user_auth_id = f.user_auth_id
       WHERE (p_filter = 'all')
          OR (p_filter = 'new' AND f.status = 'new')
          OR (p_filter IN ('bug', 'sugestao', 'geral', 'elogio') AND f.type = p_filter)
       ORDER BY f.created_at DESC
       LIMIT p_limit
    ) sub;

  RETURN jsonb_build_object('counts', v_counts, 'rows', v_rows);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_feedbacks_list(text, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_feedbacks_list(text, int) TO authenticated, service_role;

-- ============================================================
-- 9. RPC: admin_mark_feedback_status
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_mark_feedback_status(
  p_feedback_id bigint,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  SELECT role INTO v_role FROM public.users WHERE user_auth_id = auth.uid();
  IF v_role IS DISTINCT FROM 'admin' THEN
    RAISE EXCEPTION 'forbidden' USING ERRCODE = '42501';
  END IF;
  IF p_status NOT IN ('new', 'read', 'resolved', 'archived') THEN
    RAISE EXCEPTION 'invalid_status';
  END IF;

  UPDATE public.feedbacks
     SET status = p_status, updated_at = now()
   WHERE id = p_feedback_id;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_mark_feedback_status(bigint, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_mark_feedback_status(bigint, text) TO authenticated, service_role;

-- ============================================================
-- 10. RPC: admin_users_rich_list (substitui admin_users_list anterior)
-- Inclui engajamento (msg_count, login_count), telefone, status calculado.
-- ============================================================
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

  WITH base AS (
    SELECT
      a.id AS user_auth_id,
      a.email,
      a.email_confirmed_at,
      a.last_sign_in_at,
      a.created_at AS auth_created,
      up.fullname,
      up.phone,
      up.role,
      up.plan_type,
      up.subscription_active,
      up.current_period_end,
      up.lgpd_consents_accepted_at,
      coalesce(ue.msg_count, 0) AS msg_count,
      coalesce(ue.login_count, 0) AS login_count
    FROM auth.users a
    LEFT JOIN public.users up ON up.user_auth_id = a.id
    LEFT JOIN public.user_engagement_state ue ON ue.user_auth_id = a.id
  )
  SELECT
    jsonb_build_object(
      'all', count(*),
      'active', count(*) FILTER (WHERE subscription_active AND role <> 'admin'),
      'inactive', count(*) FILTER (WHERE (NOT coalesce(subscription_active, false)) AND coalesce(role, 'user') <> 'admin'),
      'admin', count(*) FILTER (WHERE role = 'admin')
    ) INTO v_counts
    FROM base;

  SELECT COALESCE(jsonb_agg(u ORDER BY (u->>'auth_created') DESC), '[]'::jsonb)
    INTO v_rows
    FROM (
      SELECT jsonb_build_object(
        'user_auth_id', user_auth_id,
        'email', email,
        'fullname', fullname,
        'phone', phone,
        'role', coalesce(role, 'user'),
        'plan_type', plan_type,
        'subscription_active', coalesce(subscription_active, false),
        'current_period_end', current_period_end,
        'last_sign_in_at', last_sign_in_at,
        'auth_created', auth_created,
        'email_confirmed_at', email_confirmed_at,
        'lgpd_accepted_at', lgpd_consents_accepted_at,
        'msg_count', msg_count,
        'login_count', login_count
      ) AS u
      FROM base
      ORDER BY auth_created DESC
      LIMIT p_limit
    ) sub;

  RETURN jsonb_build_object('counts', v_counts, 'rows', v_rows);
END;
$$;

REVOKE ALL ON FUNCTION public.admin_users_rich_list(int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admin_users_rich_list(int) TO authenticated, service_role;
