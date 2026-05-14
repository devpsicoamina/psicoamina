// Recebe feedback do usuário, salva no banco via RPC e dispara email
// de notificação pro admin (Renan) via Brevo HTTP API.
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = new Set([
  "https://colmeiainfantil.com.br",
  "https://www.colmeiainfantil.com.br",
  "http://localhost:3006",
]);

const ADMIN_NOTIFICATION_EMAIL = "resultadosninja@gmail.com";
const SENDER_EMAIL = "nao-responda@colmeiainfantil.com.br";
const SENDER_NAME = "ColméIA Infantil";

function corsFor(req: Request): Record<string, string> {
  const origin = req.headers.get("origin") ?? "";
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.has(origin) ? origin : "null",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const TYPE_LABEL: Record<string, string> = {
  geral: "Geral",
  bug: "Bug",
  sugestao: "Sugestão",
  elogio: "Elogio",
};

const TYPE_COLOR: Record<string, string> = {
  geral: "#249689",
  bug: "#FF5963",
  sugestao: "#d7a53c",
  elogio: "#69080b",
};

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function buildEmailHtml(args: {
  type: string;
  message: string;
  source: string;
  userEmail: string | null;
  userName: string | null;
  rating: number | null;
}): string {
  const label = TYPE_LABEL[args.type] ?? args.type;
  const color = TYPE_COLOR[args.type] ?? "#69080b";
  const safeMessage = escapeHtml(args.message).replace(/\n/g, "<br>");
  const ratingHtml = args.rating
    ? `<p style="margin:0 0 12px;color:#4a3520;font-size:14px;"><strong>Nota:</strong> ${args.rating}/5</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fef9e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9e7;padding:24px 12px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(105,8,11,0.06);">
        <tr><td style="height:4px;background:linear-gradient(90deg,#69080b 0%,#d7a53c 100%);"></td></tr>
        <tr><td style="padding:28px 32px 8px;">
          <span style="display:inline-block;padding:4px 10px;border-radius:6px;background:${color}22;color:${color};font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.06em;">${label}</span>
          <h1 style="margin:12px 0 16px;color:#69080b;font-size:20px;font-weight:800;">Novo feedback recebido</h1>
          ${ratingHtml}
          <div style="background:#fef9e7;border-left:3px solid ${color};padding:16px 18px;border-radius:6px;margin:8px 0 20px;">
            <p style="margin:0;color:#4a3520;font-size:15px;line-height:1.6;white-space:pre-wrap;">${safeMessage}</p>
          </div>
          <table cellpadding="0" cellspacing="0" style="width:100%;font-size:13px;color:#8a7560;">
            <tr><td style="padding:4px 0;width:80px;"><strong>De:</strong></td><td style="color:#4a3520;">${escapeHtml(args.userName ?? "—")}</td></tr>
            <tr><td style="padding:4px 0;"><strong>E-mail:</strong></td><td style="color:#4a3520;">${escapeHtml(args.userEmail ?? "—")}</td></tr>
            <tr><td style="padding:4px 0;"><strong>Origem:</strong></td><td style="color:#4a3520;font-family:monospace;">${escapeHtml(args.source)}</td></tr>
          </table>
          <p style="margin:24px 0 8px;color:#8a7560;font-size:12px;">Para gerenciar feedbacks, acesse a plataforma → Plataforma → Feedbacks.</p>
        </td></tr>
        <tr><td style="padding:16px 32px;background:#fffdf0;border-top:1px solid #f5e6b8;color:#8a7560;font-size:11px;" align="center">
          Notificação automática · ColméIA Infantil
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendBrevoEmail(args: {
  apiKey: string;
  to: string;
  subject: string;
  htmlContent: string;
  replyToEmail?: string;
  replyToName?: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "api-key": args.apiKey,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email: args.to }],
        replyTo: args.replyToEmail
          ? { email: args.replyToEmail, name: args.replyToName ?? undefined }
          : undefined,
        subject: args.subject,
        htmlContent: args.htmlContent,
      }),
    });
    if (!res.ok) {
      const errBody = await res.text();
      return { ok: false, error: `brevo_${res.status}_${errBody.slice(0, 120)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
}

Deno.serve(async (req: Request) => {
  const cors = corsFor(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405, headers: cors });
  }

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

    const payload = await req.json();
    const type: string = String(payload?.type ?? "geral");
    const message: string = String(payload?.message ?? "").trim();
    const source: string = String(payload?.source ?? "manual");
    const rating: number | null = typeof payload?.rating === "number" ? payload.rating : null;

    if (message.length < 3 || message.length > 5000) {
      return new Response(
        JSON.stringify({ error: "invalid_message" }),
        { status: 400, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    const { data: feedbackId, error: rpcError } = await userClient.rpc("submit_feedback", {
      p_type: type,
      p_message: message,
      p_source: source,
      p_rating: rating,
    });

    if (rpcError) {
      console.error("feedback-submit rpc:", rpcError.message);
      return new Response(
        JSON.stringify({ error: rpcError.message }),
        { status: 500, headers: { ...cors, "Content-Type": "application/json" } }
      );
    }

    // Buscar nome do user pra incluir no email (best-effort)
    let userName: string | null = null;
    try {
      const { data: profile } = await userClient
        .from("users")
        .select("fullname")
        .eq("user_auth_id", user.id)
        .maybeSingle();
      userName = profile?.fullname ?? null;
    } catch (_) { /* ignora */ }

    // Disparar email Brevo (best-effort — não bloqueia retorno)
    const brevoKey = Deno.env.get("BREVO_API_KEY");
    if (brevoKey) {
      const html = buildEmailHtml({
        type,
        message,
        source,
        userEmail: user.email ?? null,
        userName,
        rating,
      });
      const label = TYPE_LABEL[type] ?? type;
      const send = await sendBrevoEmail({
        apiKey: brevoKey,
        to: ADMIN_NOTIFICATION_EMAIL,
        subject: `[Feedback ColméIA] ${label}: ${message.slice(0, 60)}${message.length > 60 ? "..." : ""}`,
        htmlContent: html,
        replyToEmail: user.email ?? undefined,
        replyToName: userName ?? undefined,
      });
      if (!send.ok) {
        console.error("feedback-submit brevo:", send.error);
      }
    } else {
      console.warn("feedback-submit: BREVO_API_KEY missing, skipping notification");
    }

    return new Response(
      JSON.stringify({ ok: true, feedback_id: feedbackId }),
      { headers: { ...cors, "Content-Type": "application/json" } }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("feedback-submit:", msg);
    return new Response("Internal error", { status: 500, headers: cors });
  }
});
