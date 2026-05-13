// Storage retention enforcement.
// Deletes chat-attachments objects older than 30 days. Called by pg_cron via
// X-Cron-Secret. Idempotent — safe to run any number of times.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RETENTION_DAYS = 30;

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

Deno.serve(async (req: Request) => {
  try {
    const cronSecret = Deno.env.get("CRON_SECRET");
    const provided = req.headers.get("X-Cron-Secret") ?? "";
    if (!cronSecret || cronSecret.length < 16 || !constantTimeEqual(provided, cronSecret)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const cutoff = Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000;
    let deleted = 0;

    // List top-level folders (one per user_auth_id)
    const { data: users, error: usersError } = await supabase
      .storage.from("chat-attachments")
      .list("", { limit: 1000 });
    if (usersError) {
      console.error("retention-storage list users:", usersError.message);
      return new Response("List failed", { status: 500 });
    }

    for (const userFolder of users ?? []) {
      if (userFolder.id) continue; // file at root, skip (shouldn't happen)
      const { data: chats } = await supabase.storage.from("chat-attachments").list(userFolder.name, { limit: 1000 });
      for (const chatFolder of chats ?? []) {
        if (chatFolder.id) continue;
        const prefix = `${userFolder.name}/${chatFolder.name}`;
        const { data: files } = await supabase.storage.from("chat-attachments").list(prefix, { limit: 1000 });
        const toDelete: string[] = [];
        for (const f of files ?? []) {
          if (!f.id) continue;
          const created = new Date(f.created_at ?? f.updated_at ?? Date.now()).getTime();
          if (created < cutoff) toDelete.push(`${prefix}/${f.name}`);
        }
        if (toDelete.length > 0) {
          const { error } = await supabase.storage.from("chat-attachments").remove(toDelete);
          if (!error) deleted += toDelete.length;
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, deleted_files: deleted, retention_days: RETENTION_DAYS }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("retention-storage:", msg);
    return new Response("Internal error", { status: 500 });
  }
});
