-- Atomic token-usage increment used by chat-ai after the OpenAI call.
-- Replaces the previous read-modify-write pattern that allowed N concurrent
-- requests to each pass the pre-check, exceeding the monthly limit.

-- 1) Safety dedupe BEFORE the UNIQUE constraint — keeps the highest tokens_used
-- per user_auth_id and discards the rest. Without this, the ALTER TABLE below
-- would abort if any duplicates exist (same pattern as 20260415_unique_user_auth_id).
DELETE FROM public.user_monthly_usage a
USING public.user_monthly_usage b
WHERE a.user_auth_id = b.user_auth_id
  AND (
    a.tokens_used < b.tokens_used
    OR (a.tokens_used = b.tokens_used AND a.id > b.id)
  );

-- 2) Required for the ON CONFLICT clause in the function below. Safe to re-run.
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'user_monthly_usage_user_auth_id_unique'
  ) THEN
    ALTER TABLE public.user_monthly_usage
      ADD CONSTRAINT user_monthly_usage_user_auth_id_unique UNIQUE (user_auth_id);
  END IF;
END $$;

-- 3) The actual atomic increment function.
CREATE OR REPLACE FUNCTION public.increment_token_usage(
  p_user_auth_id uuid,
  p_amount int,
  p_token_limit int
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total int;
BEGIN
  INSERT INTO public.user_monthly_usage (user_auth_id, tokens_used, progress_bar_value)
  VALUES (p_user_auth_id, p_amount, LEAST(p_amount::float / NULLIF(p_token_limit, 0), 1.0))
  ON CONFLICT (user_auth_id) DO UPDATE
    SET tokens_used = public.user_monthly_usage.tokens_used + EXCLUDED.tokens_used,
        progress_bar_value = LEAST(
          (public.user_monthly_usage.tokens_used + EXCLUDED.tokens_used)::float / NULLIF(p_token_limit, 0),
          1.0
        )
  RETURNING tokens_used INTO v_total;
  RETURN v_total;
END;
$$;

REVOKE ALL ON FUNCTION public.increment_token_usage(uuid, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.increment_token_usage(uuid, int, int) TO service_role;
