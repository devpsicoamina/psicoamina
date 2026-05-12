import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedSecret = req.headers.get("X-Cron-Secret") ?? "";
    if (!cronSecret || cronSecret.length < 16) {
      console.error("reset-monthly-tokens: CRON_SECRET missing or too short");
      return new Response("Server misconfigured", { status: 500 });
    }
    if (!constantTimeEqual(providedSecret, cronSecret)) {
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
      console.error("reset-monthly-tokens: reset error:", error.message);
      return new Response("Reset failed", { status: 500 });
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
      console.error("reset-monthly-tokens: deactivate error:", expError.message);
    }

    return new Response(
      JSON.stringify({
        success: true,
        tokens_reset: resetCount,
        subscriptions_expired: expired?.length || 0,
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("reset-monthly-tokens:", msg);
    return new Response("Internal error", { status: 500 });
  }
});
