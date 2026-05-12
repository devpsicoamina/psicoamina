import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OFFER_PLANS: Record<string, string> = {
  rc99wnbh: "monthly",
  "87uk731h": "yearly",
};

const ACTIVATE_EVENTS = ["PURCHASE_APPROVED"];
const DEACTIVATE_EVENTS = [
  "PURCHASE_CANCELED",
  "PURCHASE_REFUNDED",
  "SUBSCRIPTION_CANCELLATION",
];

const REPLAY_WINDOW_MS = 10 * 60 * 1000;

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function logSafe(scope: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`${scope}:`, msg);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const expectedHottok = Deno.env.get("HOTMART_HOTTOK");
    if (!expectedHottok || expectedHottok.length < 16) {
      console.error("payment-webhook: HOTMART_HOTTOK missing or too short");
      return new Response("Server misconfigured", { status: 500 });
    }
    const hottok = req.headers.get("x-hotmart-hottok") ?? "";
    if (!constantTimeEqual(hottok, expectedHottok)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const event = body.event as string;
    const creationDate = Number(body.creation_date ?? body.data?.purchase?.creation_date ?? 0);
    const buyerEmail = body.data?.buyer?.email?.toLowerCase()?.trim();
    const offerCode = body.data?.purchase?.offer?.code;
    const transactionId = body.data?.purchase?.transaction;

    if (creationDate > 0) {
      const ageMs = Date.now() - creationDate;
      if (ageMs > REPLAY_WINDOW_MS || ageMs < -REPLAY_WINDOW_MS) {
        return new Response("Stale or future-dated webhook", { status: 400 });
      }
    }

    if (!transactionId) {
      return new Response(JSON.stringify({ received: true, warning: "no transaction id" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!buyerEmail) {
      return new Response(JSON.stringify({ received: true, warning: "no email" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing, error: idemError } = await supabase
      .from("payment_events")
      .insert({
        transaction_id: transactionId,
        event,
        buyer_email: buyerEmail,
      })
      .select("transaction_id")
      .maybeSingle();

    if (idemError && idemError.code !== "23505") {
      logSafe("payment-webhook idempotency", idemError);
      return new Response("Internal error", { status: 500 });
    }
    if (idemError?.code === "23505" || !existing) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const { data: userRow, error: userLookupError } = await supabase
      .rpc("find_user_id_by_email", { p_email: buyerEmail });

    if (userLookupError) {
      logSafe("payment-webhook user lookup", userLookupError);
      return new Response("Internal error", { status: 500 });
    }

    const userAuthId = userRow as string | null;
    if (!userAuthId) {
      return new Response(
        JSON.stringify({ received: true, pending: "user not registered yet" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (ACTIVATE_EVENTS.includes(event)) {
      const planType = OFFER_PLANS[offerCode] ?? "monthly";

      const periodEnd = new Date();
      if (planType === "yearly") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const { error } = await supabase
        .from("users")
        .update({
          subscription_active: true,
          plan_type: planType,
          current_period_end: periodEnd.toISOString(),
        })
        .eq("user_auth_id", userAuthId);

      if (error) {
        logSafe("payment-webhook activate", error);
        return new Response("DB update failed", { status: 500 });
      }
    }

    if (DEACTIVATE_EVENTS.includes(event)) {
      const { error } = await supabase
        .from("users")
        .update({ subscription_active: false })
        .eq("user_auth_id", userAuthId);

      if (error) {
        logSafe("payment-webhook deactivate", error);
        return new Response("DB update failed", { status: 500 });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    logSafe("payment-webhook", err);
    return new Response("Internal error", { status: 500 });
  }
});
