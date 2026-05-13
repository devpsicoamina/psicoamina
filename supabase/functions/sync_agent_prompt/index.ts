import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type AgentType = "marketing" | "customerAcquisition" | "psico";

const DOCS_MAP: Record<AgentType, string> = {
  psico: "1i_1XpLyvpU0N4VuNgha_PpWhH0MgGynC44AhhU-qXCA",
  marketing: "1i8CX1xkzw7jwlAM41Ne7HdzqCfHB9XXUPZiHJwscQxk",
  customerAcquisition: "1PGPXtEJUxhIx3tcjklxS1nmXvITLeNDr996nc5zHolU",
};

const ALLOWED_ORIGINS = new Set([
  "https://colmeiainfantil.com.br",
  "https://www.colmeiainfantil.com.br",
  "http://localhost:5173",
]);

function corsFor(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

serve(async (req) => {
  const corsHeaders = corsFor(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const providedCronSecret = req.headers.get("X-Cron-Secret");
    const cronAuthorized = !!(cronSecret && cronSecret.length >= 16 &&
                              providedCronSecret &&
                              constantTimeEqual(providedCronSecret, cronSecret));

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (!cronAuthorized) {
      const authHeader = req.headers.get("Authorization");
      if (!authHeader) {
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }
      const jwt = authHeader.replace("Bearer ", "");

      const userSupabase = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
        { global: { headers: { Authorization: `Bearer ${jwt}` } } }
      );

      const { data: { user }, error: userError } = await userSupabase.auth.getUser();
      if (userError || !user) {
        return new Response("Unauthorized", { status: 401, headers: corsHeaders });
      }

      const { data: profile, error: profileError } = await userSupabase
        .from("users")
        .select("role")
        .eq("user_auth_id", user.id)
        .maybeSingle();

      if (profileError || profile?.role !== "admin") {
        return new Response("Forbidden", { status: 403, headers: corsHeaders });
      }
    }

    const { agentType } = await req.json();
    if (!(agentType in DOCS_MAP)) {
      return new Response("Invalid agentType", { status: 400, headers: corsHeaders });
    }

    const docRes = await fetch(
      `https://docs.google.com/document/d/${DOCS_MAP[agentType as AgentType]}/export?format=txt`
    );
    if (!docRes.ok) {
      console.error("sync_agent_prompt: fetch failed", docRes.status);
      return new Response("Failed to fetch doc", { status: 502, headers: corsHeaders });
    }

    const text = await docRes.text();

    const { error: updateError } = await supabase
      .from("agents_prompts")
      .update({ prompt: text.trim() })
      .eq("agent_type", agentType);

    if (updateError) {
      console.error("sync_agent_prompt update:", updateError.message);
      return new Response("DB update failed", { status: 500, headers: corsHeaders });
    }

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("sync_agent_prompt:", msg);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
