import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Called monthly via pg_cron (see migrations.sql)
// Resets all users' token usage to 0

Deno.serve(async (req: Request) => {
  try {
    // Verify this is called with service role key (from pg_cron or admin)
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Reset all monthly usage
    const { data, error } = await supabase
      .from("user_monthly_usage")
      .update({
        tokens_used: 0,
        progress_bar_value: 0,
      })
      .neq("tokens_used", 0) // Only update rows that actually have usage
      .select("user_auth_id");

    if (error) {
      throw new Error("Failed to reset tokens: " + error.message);
    }

    const resetCount = data?.length || 0;
    console.info(`reset-monthly-tokens: reset ${resetCount} users`);

    // Deactivate expired subscriptions
    const now = new Date().toISOString();
    const { data: expired, error: expError } = await supabase
      .from("users")
      .update({ subscription_active: false })
      .eq("subscription_active", true)
      .lt("current_period_end", now)
      .select("user_auth_id");

    if (expError) {
      console.error("reset-monthly-tokens: error deactivating expired:", expError.message);
    } else {
      const expiredCount = expired?.length || 0;
      if (expiredCount > 0) {
        console.info(`reset-monthly-tokens: deactivated ${expiredCount} expired subscriptions`);
      }
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
    console.error("reset-monthly-tokens error:", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500 }
    );
  }
});
