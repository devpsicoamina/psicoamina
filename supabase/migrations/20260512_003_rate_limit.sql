-- Rate limiting table + check function used by chat-ai (and reusable).
-- Pattern: per-(key, minute_window) counter. Window rolls forward; old rows are GC'd at check time.

CREATE TABLE IF NOT EXISTS public.rate_limits (
  key text NOT NULL,
  ts timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (key, ts)
);

CREATE INDEX IF NOT EXISTS rate_limits_key_ts_idx ON public.rate_limits(key, ts DESC);

ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;
-- No policies — only service_role can read/write.

-- Returns true if the request is allowed, false if it would exceed the limit.
-- Side effect: records the current request (only when allowed).
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
     AND ts < now() - make_interval(secs => p_window_sec);

  SELECT count(*) INTO v_count
    FROM public.rate_limits
   WHERE key = p_key
     AND ts >= now() - make_interval(secs => p_window_sec);

  IF v_count >= p_max THEN
    RETURN false;
  END IF;

  INSERT INTO public.rate_limits(key, ts) VALUES (p_key, now());
  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.rate_limit_check(text, int, int) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.rate_limit_check(text, int, int) TO service_role;
