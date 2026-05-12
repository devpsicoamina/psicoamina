-- Idempotency table for Hotmart payment webhooks.
-- The payment-webhook function inserts the transaction_id BEFORE updating the user.
-- A duplicate Hotmart delivery (same transaction_id) hits the PK conflict and is rejected.

CREATE TABLE IF NOT EXISTS public.payment_events (
  transaction_id text PRIMARY KEY,
  event text NOT NULL,
  buyer_email text,
  processed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;

-- No anon/authenticated access. Only service_role (used by Edge Function) bypasses RLS.
-- Intentionally no policies = locked down.
