// Admin trigger: re-sync all 3 agent prompts from Google Docs immediately,
// without waiting for the hourly pg_cron. Caller must have users.role='admin'.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://colmeiainfantil.com.br",
  "https://www.colmeiainfantil.com.br",
  "http://localhost:3006",
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

type AgentType = "marketing" | "customerAcquisition" | "psico";
const DOCS_MAP: Record<AgentType, string> = {
  psico: "1i_1XpLyvpU0N4VuNgha_PpWhH0MgGynC44AhhU-qXCA",
  marketing: "1i8CX1xkzw7jwlAM41Ne7HdzqCfHB9XXUPZiHJwscQxk",
  customerAcquisition: "1PGPXtEJUxhIx3tcjklxS1nmXvITLeNDr996nc5zHolU",
};

Deno.serve(async (req: Request) => {
  const cors = corsFor(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: cors });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response("Unauthorized", { status: 401, headers: cors });
    const jwt = auth.replace("Bearer ", "");

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401, headers: cors });
    }

    const { data: profile, error: profileError } = await userClient
      .from("users")
      .select("role")
      .eq("user_auth_id", user.id)
      .maybeSingle();
    if (profileError || profile?.role !== "admin") {
      return new Response("Forbidden", { status: 403, headers: cors });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results: Record<string, { ok: boolean; chars?: number; error?: string }> = {};
    for (const [agentType, docId] of Object.entries(DOCS_MAP) as Array<[AgentType, string]>) {
      try {
        const docRes = await fetch(`https://docs.google.com/document/d/${docId}/export?format=txt`);
        if (!docRes.ok) {
          results[agentType] = { ok: false, error: `fetch_${docRes.status}` };
          continue;
        }
        const text = (await docRes.text()).trim();
        const { error: updError } = await admin
          .from("agents_prompts")
          .update({ prompt: text })
          .eq("agent_type", agentType);
        if (updError) {
          results[agentType] = { ok: false, error: updError.message };
        } else {
          results[agentType] = { ok: true, chars: text.length };
        }
      } catch (e) {
        results[agentType] = { ok: false, error: e instanceof Error ? e.message : String(e) };
      }
    }

    await userClient.rpc("log_audit_event", {
      p_action: "admin.prompts_synced",
      p_metadata: results,
    });

    return new Response(
      JSON.stringify({ ok: true, results, synced_at: new Date().toISOString() }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("admin-sync-prompts:", msg);
    return new Response("Internal error", { status: 500, headers: cors });
  }
});
