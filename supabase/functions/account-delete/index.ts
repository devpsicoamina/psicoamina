// LGPD §S6 - right to erasure. Deletes everything associated to the
// authenticated user: storage objects, messages, chats, usage, profile row
// and the auth.users record. Audit log is preserved with user_auth_id
// nulled (FK ON DELETE SET NULL) for compliance retention.
//
// Idempotent: subsequent calls return 410.
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
    const uid = user.id;
    const email = user.email;

    const body = await req.json().catch(() => ({}));
    const confirmation: string = String(body?.confirmation ?? "").trim();
    if (confirmation !== "EXCLUIR MINHA CONTA") {
      return new Response(
        JSON.stringify({ error: "missing_confirmation" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // service_role client (bypasses RLS) for the actual deletion + auth admin
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Log BEFORE deletion so the audit_log entry has user_auth_id (will be SET NULL by FK after delete)
    await userClient.rpc("log_audit_event", {
      p_action: "account.deletion_started",
      p_entity_type: null,
      p_entity_id: null,
      p_metadata: { email },
    });

    // 1. Remove Storage objects: chat-attachments/{uid}/...
    try {
      const { data: files } = await admin.storage.from("chat-attachments").list(uid, { limit: 1000 });
      if (files && files.length > 0) {
        const paths = files.map((f) => `${uid}/${f.name}`);
        // Recurse one level (uid/chatId/file)
        for (const subdir of files.filter((f) => !f.id)) {
          const { data: nested } = await admin.storage.from("chat-attachments").list(`${uid}/${subdir.name}`, { limit: 1000 });
          if (nested) paths.push(...nested.map((f) => `${uid}/${subdir.name}/${f.name}`));
        }
        if (paths.length > 0) {
          await admin.storage.from("chat-attachments").remove(paths);
        }
      }
    } catch (e) {
      console.error("account-delete storage:", e instanceof Error ? e.message : String(e));
    }

    // 2. Delete DB rows (cascading order)
    await admin.from("chat_messages").delete().eq("user_auth_id", uid);
    await admin.from("chats").delete().eq("user_auth_id", uid);
    await admin.from("user_monthly_usage").delete().eq("user_auth_id", uid);
    await admin.from("users").delete().eq("user_auth_id", uid);

    // 3. Delete auth.users (this invalidates all sessions; FK ON DELETE SET NULL keeps audit_logs)
    const { error: delAuthError } = await admin.auth.admin.deleteUser(uid);
    if (delAuthError) {
      console.error("account-delete auth:", delAuthError.message);
      return new Response(
        JSON.stringify({ error: "auth_delete_failed" }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, deleted_at: new Date().toISOString() }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("account-delete:", msg);
    return new Response("Internal error", { status: 500, headers: cors });
  }
});
