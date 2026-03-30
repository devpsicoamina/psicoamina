import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Hotmart webhook handler for ColméIA Infantil
// Configure in Hotmart: Produto → Configurações → Webhooks
// URL: https://nwgnhuesqdnedupykthj.supabase.co/functions/v1/payment-webhook

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

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    // Validate Hotmart hottok
    const hottok = req.headers.get("x-hotmart-hottok") ?? "";
    const expectedHottok = Deno.env.get("HOTMART_HOTTOK") ?? "";
    if (expectedHottok && hottok !== expectedHottok) {
      console.error("payment-webhook: invalid hottok");
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const event = body.event as string;
    const buyerEmail = body.data?.buyer?.email?.toLowerCase()?.trim();
    const offerCode = body.data?.purchase?.offer?.code;
    const transactionId = body.data?.purchase?.transaction ?? "unknown";

    console.info(`payment-webhook: event=${event} email=${buyerEmail} offer=${offerCode} tx=${transactionId}`);

    if (!buyerEmail) {
      console.error("payment-webhook: no buyer email in payload");
      return new Response(JSON.stringify({ received: true, warning: "no email" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find user by email via auth.users
    const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
    if (authError) {
      console.error("payment-webhook: error listing users:", authError.message);
      return new Response("Internal error", { status: 500 });
    }

    const authUser = authUsers.users.find(
      (u: any) => u.email?.toLowerCase() === buyerEmail
    );

    if (!authUser) {
      console.info(`payment-webhook: email ${buyerEmail} not found in auth.users — user hasn't signed up yet`);
      return new Response(
        JSON.stringify({ received: true, pending: "user not registered yet" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    const userAuthId = authUser.id;

    // Activate subscription
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
        console.error("payment-webhook: activate error:", error.message);
        return new Response("DB update failed", { status: 500 });
      }

      console.info(`payment-webhook: activated ${planType} for ${buyerEmail} (${userAuthId})`);
    }

    // Deactivate subscription
    if (DEACTIVATE_EVENTS.includes(event)) {
      const { error } = await supabase
        .from("users")
        .update({ subscription_active: false })
        .eq("user_auth_id", userAuthId);

      if (error) {
        console.error("payment-webhook: deactivate error:", error.message);
        return new Response("DB update failed", { status: 500 });
      }

      console.info(`payment-webhook: deactivated subscription for ${buyerEmail} (${userAuthId})`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("payment-webhook error:", err.message);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
