-- Retention policy enforcement (LGPD §S6).
-- Monthly cron deletes data past its retention window.
-- Chats: 12 months without activity.
-- chat_messages: cascade with chat deletion.
-- audit_logs: 12 months (still retains anonymized rows for compliance).
-- PDFs in Storage: deleted by the retention-cleanup Edge Function (Storage isn't accessible from SQL).

CREATE OR REPLACE FUNCTION public.apply_retention_policy()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chats_deleted int := 0;
  v_messages_deleted int := 0;
  v_audit_deleted int := 0;
  v_chat_ids uuid[];
BEGIN
  -- Identify chats with no activity in the last 12 months.
  SELECT array_agg(c.id) INTO v_chat_ids
    FROM public.chats c
    LEFT JOIN public.chat_messages m ON m.chat_id = c.id
   WHERE COALESCE(c.updated_at, c.created_at) < now() - interval '12 months'
   GROUP BY c.id
  HAVING max(COALESCE(m.created_at, '1970-01-01'::timestamptz)) < now() - interval '12 months';

  IF v_chat_ids IS NOT NULL THEN
    -- Delete messages first
    DELETE FROM public.chat_messages WHERE chat_id = ANY(v_chat_ids);
    GET DIAGNOSTICS v_messages_deleted = ROW_COUNT;
    -- Then chats
    DELETE FROM public.chats WHERE id = ANY(v_chat_ids);
    GET DIAGNOSTICS v_chats_deleted = ROW_COUNT;
  END IF;

  -- Audit log retention: 12 months
  DELETE FROM public.audit_logs WHERE created_at < now() - interval '12 months';
  GET DIAGNOSTICS v_audit_deleted = ROW_COUNT;

  -- Old rate_limit rows (housekeeping; rate_limit_check also GCs)
  DELETE FROM public.rate_limits WHERE ts < now() - interval '1 day';

  RETURN jsonb_build_object(
    'chats_deleted', v_chats_deleted,
    'messages_deleted', v_messages_deleted,
    'audit_logs_deleted', v_audit_deleted,
    'ran_at', now()
  );
END;
$$;

REVOKE ALL ON FUNCTION public.apply_retention_policy() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.apply_retention_policy() TO service_role;

-- Monthly cron on day 2 at 03:00 UTC (00:00 BRT). Day 2 avoids overlap with reset-monthly-tokens on day 1.
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM cron.job WHERE jobname = 'apply-retention-policy') THEN
    PERFORM cron.unschedule('apply-retention-policy');
  END IF;
END $$;

SELECT cron.schedule(
  'apply-retention-policy',
  '0 3 2 * *',
  $$SELECT public.apply_retention_policy()$$
);
