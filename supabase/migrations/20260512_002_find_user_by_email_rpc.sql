-- RPC for the payment-webhook to look up a user by email without paginating auth.users.
-- SECURITY DEFINER so service_role can call without granting direct auth.users access.

CREATE OR REPLACE FUNCTION public.find_user_id_by_email(p_email text)
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
AS $$
  SELECT id FROM auth.users
  WHERE lower(email) = lower(p_email)
  LIMIT 1
$$;

REVOKE ALL ON FUNCTION public.find_user_id_by_email(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.find_user_id_by_email(text) TO service_role;
