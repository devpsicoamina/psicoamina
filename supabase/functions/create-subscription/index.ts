import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Missing Authorization", { status: 401, headers: corsHeaders });
    }

    const jwt = authHeader.replace("Bearer ", "");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const { plan_type } = await req.json();
    if (!plan_type || !["monthly", "yearly"].includes(plan_type)) {
      return new Response("Invalid plan_type", { status: 400, headers: corsHeaders });
    }

    // ─────────────────────────────────────────────────────────
    // TODO: Replace this section with your payment gateway integration
    // 
    // Example for InfinitePay:
    // const ipResponse = await fetch("https://api.infinitepay.io/invoices/public/checkout/links", {
    //   method: "POST",
    //   headers: {
    //     "Authorization": `Bearer ${Deno.env.get("INFINITEPAY_API_KEY")}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     amount: plan_type === "yearly" ? 47880 : 4990, // cents
    //     description: `PsicoAmina - Plano ${plan_type}`,
    //     customer_email: user.email,
    //     metadata: { user_auth_id: user.id, plan_type },
    //   }),
    // });
    // const { checkout_url } = await ipResponse.json();
    //
    // Example for Stripe:
    // const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!);
    // const session = await stripe.checkout.sessions.create({...});
    // const checkout_url = session.url;
    // ─────────────────────────────────────────────────────────

    // TEMPORARY: For testing, directly activate subscription
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const periodEnd = new Date();
    if (plan_type === "yearly") {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    await serviceClient
      .from("users")
      .update({
        subscription_active: true,
        plan_type,
        current_period_end: periodEnd.toISOString(),
      })
      .eq("user_auth_id", user.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subscription activated (test mode)",
        // checkout_url: checkout_url, // Uncomment when payment gateway is integrated
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("create-subscription error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: corsHeaders }
    );
  }
});
