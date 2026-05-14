-- Granular LGPD consents. The user accepts ALL items at once via the modal;
-- the timestamp + version are persisted. Bump CONSENTS_VERSION (frontend constant)
-- to force re-acceptance after a material change.

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS lgpd_consents_version text,
  ADD COLUMN IF NOT EXISTS lgpd_consents_accepted_at timestamptz;

-- Allow user to UPDATE its own consent fields (just these two).
-- Table-level UPDATE was revoked in migration 006; we need column grants here.
GRANT UPDATE (lgpd_consents_version, lgpd_consents_accepted_at)
  ON public.users TO authenticated;
