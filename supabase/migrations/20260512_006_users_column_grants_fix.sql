-- Fix-up for 20260512_005: column-level REVOKE doesn't override a table-level GRANT.
-- The Supabase default GRANT UPDATE ON TABLE users TO authenticated covers every
-- column, including the billing-controlled ones. We have to drop the table-level
-- grant and re-grant column-by-column.

-- UPDATE: restrict to profile-editable columns only.
REVOKE UPDATE ON public.users FROM authenticated;
REVOKE UPDATE ON public.users FROM anon;

GRANT UPDATE (fullname, profile_pic_url) ON public.users TO authenticated;

-- INSERT: signup creates the row; restrict to non-billing columns.
-- subscription_active / plan_type / current_period_end / role are all populated
-- server-side (defaults or webhook). The client only seeds identity + terms.
REVOKE INSERT ON public.users FROM authenticated;
REVOKE INSERT ON public.users FROM anon;

GRANT INSERT (
  user_auth_id,
  fullname,
  profile_pic_url,
  accepted_terms_at,
  accepted_terms_version
) ON public.users TO authenticated;

-- service_role and postgres keep their full grants (not touched).
