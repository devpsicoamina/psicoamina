import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// This edge function handles payment webhook callbacks from your payment gateway.
// Configure the webhook URL in your payment provider dashboard:
// POST ${SUPABASE_URL}/functions/v1/payment-webhook

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const body = await req.json();
    console.info("payment-webhook: received", JSON.stringify(body).substring(0, 200));

    // ─────────────────────────────────────────────────────────
    // TODO: Validate webhook signature from your payment provider
    //
    // For InfinitePay:
    // const signature = req.headers.get("x-infinitepay-signature");
    // if (!verifySignature(signature, body)) { return new Response("Invalid signature", { status: 401 }); }
    //
    // For Stripe:
    // const signature = req.headers.get("stripe-signature");
    // const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
    // ─────────────────────────────────────────────────────────

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // TODO: Extract these from your payment provider's webhook payload
    const user_auth_id = body.metadata?.user_auth_id;
    const plan_type = body.metadata?.plan_type || "monthly";
    const payment_status = body.status; // e.g., "approved", "paid", "succeeded"

    if (!user_auth_id) {
      console.error("payment-webhook: missing user_auth_id in metadata");
      return new Response("Missing user_auth_id", { status: 400 });
    }

    // Only activate on successful payment
    if (payment_status === "approved" || payment_status === "paid" || payment_status === "succeeded") {
      const periodEnd = new Date();
      if (plan_type === "yearly") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const { error } = await supabase
        .from("users")
        .update({
          subscription_active: true,
          plan_type,
          current_period_end: periodEnd.toISOString(),
        })
        .eq("user_auth_id", user_auth_id);

      if (error) {
        console.error("payment-webhook: update error", error.message);
        return new Response("DB update failed", { status: 500 });
      }

      console.info(`payment-webhook: activated ${plan_type} for ${user_auth_id}`);
    }

    // Handle cancellation/failure
    if (payment_status === "cancelled" || payment_status === "failed" || payment_status === "refunded") {
      await supabase
        .from("users")
        .update({ subscription_active: false })
        .eq("user_auth_id", user_auth_id);

      console.info(`payment-webhook: deactivated subscription for ${user_auth_id}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("payment-webhook error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
