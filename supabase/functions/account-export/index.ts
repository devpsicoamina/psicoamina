// LGPD §S6 - data portability. Returns a JSON dump of everything we have
// associated to the authenticated user. Caller must hold a valid JWT.
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
    "Access-Control-Allow-Methods": "POST, GET, OPTIONS",
    "Vary": "Origin",
  };
}

Deno.serve(async (req: Request) => {
  const cors = corsFor(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response("Unauthorized", { status: 401, headers: cors });
    const jwt = auth.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { global: { headers: { Authorization: `Bearer ${jwt}` } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response("Unauthorized", { status: 401, headers: cors });
    }
    const uid = user.id;

    const [profile, chats, messages, usage, audit] = await Promise.all([
      supabase.from("users").select("*").eq("user_auth_id", uid).maybeSingle(),
      supabase.from("chats").select("*").eq("user_auth_id", uid),
      supabase.from("chat_messages").select("*").eq("user_auth_id", uid),
      supabase.from("user_monthly_usage").select("*").eq("user_auth_id", uid),
      supabase.from("audit_logs").select("*").eq("user_auth_id", uid),
    ]);

    const dump = {
      exported_at: new Date().toISOString(),
      auth: {
        id: user.id,
        email: user.email,
        created_at: user.created_at,
        last_sign_in_at: user.last_sign_in_at,
        user_metadata: user.user_metadata,
      },
      profile: profile.data,
      chats: chats.data ?? [],
      messages: messages.data ?? [],
      monthly_usage: usage.data ?? [],
      audit_logs: audit.data ?? [],
    };

    await supabase.rpc("log_audit_event", {
      p_action: "account.exported",
      p_entity_type: null,
      p_entity_id: null,
      p_metadata: { rows: { chats: chats.data?.length ?? 0, messages: messages.data?.length ?? 0 } },
    });

    const filename = `colmeia-export-${uid}-${new Date().toISOString().slice(0, 10)}.json`;
    return new Response(JSON.stringify(dump, null, 2), {
      headers: {
        ...cors,
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("account-export:", msg);
    return new Response("Internal error", { status: 500, headers: cors });
  }
});
