-- Fix for rate_limit_check: now() returns the same value for every call within
-- the same transaction/statement, which made the (key, ts) PK collide on rapid
-- consecutive calls. Switch to clock_timestamp() (always advances) and add a
-- BIGSERIAL surrogate id so the table no longer relies on ts being unique.

DROP FUNCTION IF EXISTS public.rate_limit_check(text, int, int);

-- Rebuild the table with a surrogate id; ts becomes a regular indexed column.
DROP TABLE IF EXISTS public.rate_limits;

CREATE TABLE public.rate_limits (
  id BIGSERIAL PRIMARY KEY,
  key text NOT NULL,
  ts timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE INDEX rate_limits_key_ts_idx ON public.rate_limits(key, ts DESC);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies — only service_role can read/write.

CREATE OR REPLACE FUNCTION public.rate_limit_check(
  p_key text,
  p_max int,
  p_window_sec int
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_count int;
BEGIN
  DELETE FROM public.rate_limits
   WHERE key = p_key
     AND ts < clock_timestamp() - make_interval(secs => p_window_sec);

  SELECT count(*) INTO v_count
    FROM public.rate_limits
   WHERE key = p_key
     AND ts >= clock_timestamp() - make_interval(secs => p_window_sec);

  IF v_count >= p_max THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limits(key, ts) VALUES (p_key, clock_timestamp());
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_check(text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rate_limit_check(text, int, int) TO service_role;
