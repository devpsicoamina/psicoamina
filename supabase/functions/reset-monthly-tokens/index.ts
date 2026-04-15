import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

Deno.serve(async (req: Request) => {
  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedSecret = req.headers.get("X-Cron-Secret");
    if (!cronSecret || providedSecret !== cronSecret) {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data, error } = await supabase
      .from("user_monthly_usage")
      .update({
        tokens_used: 0,
        progress_bar_value: 0,
      })
      .neq("tokens_used", 0)
      .select("user_auth_id");

    if (error) {
      throw new Error("Failed to reset tokens: " + error.message);
    }

    const resetCount = data?.length || 0;

    const now = new Date().toISOString();
    const { data: expired, error: expError } = await supabase
      .from("users")
      .update({ subscription_active: false })
      .eq("subscription_active", true)
      .lt("current_period_end", now)
      .select("user_auth_id");

    if (expError) {
      console.error("reset-monthly-tokens: error deactivating expired:", expError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        tokens_reset: resetCount,
        subscriptions_expired: expired?.length || 0,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err: any) {
    console.error("reset-monthly-tokens:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});
