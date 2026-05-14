import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OFFER_PLANS: Record<string, string> = {
  rc99wnbh: "monthly",
  "87uk731h": "yearly",
};

const ACTIVATE_EVENTS = ["PURCHASE_APPROVED"];
const DEACTIVATE_EVENTS = [
  "PURCHASE_CANCELED",
  "PURCHASE_REFUNDED",
  "SUBSCRIPTION_CANCELLATION",
];

const REPLAY_WINDOW_MS = 10 * 60 * 1000;
const SENDER_EMAIL = "nao-responda@colmeiainfantil.com.br";
const SENDER_NAME = "ColméIA Infantil";
const SITE_URL = "https://www.colmeiainfantil.com.br";

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function buildWelcomeEmail(args: { fullname: string; magicLink: string; planLabel: string }): string {
  return `<!DOCTYPE html>
<html lang="pt-BR"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#fef9e7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fef9e7;padding:24px 12px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(105,8,11,0.06);">
        <tr><td align="center" style="padding:32px 24px 16px;">
          <img src="${SITE_URL}/logo-dark.png" alt="ColméIA Infantil" width="200" style="display:block;height:auto;">
        </td></tr>
        <tr><td style="height:4px;background:linear-gradient(90deg,#69080b 0%,#d7a53c 100%);"></td></tr>
        <tr><td style="padding:36px 32px 8px;">
          <h1 style="margin:0 0 16px;color:#69080b;font-size:24px;font-weight:800;">Bem-vinda à ColméIA, ${escapeHtml(args.fullname || "psicóloga")}! 🐝</h1>
          <p style="margin:0 0 16px;color:#4a3520;font-size:16px;line-height:1.6;">
            Seu pagamento foi confirmado e sua conta já tá ativa no plano <strong>${args.planLabel}</strong>. Pra entrar pela primeira vez, é só clicar no botão abaixo — não precisa criar senha agora.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:0 32px;">
          <table cellpadding="0" cellspacing="0" style="margin:24px auto;">
            <tr><td align="center" style="border-radius:12px;background:#69080b;">
              <a href="${args.magicLink}" style="display:inline-block;padding:14px 36px;color:#fff;text-decoration:none;font-weight:700;font-size:15px;border-radius:12px;min-width:220px;text-align:center;">Acessar minha conta</a>
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:0 32px 24px;">
          <p style="margin:0 0 8px;color:#8a7560;font-size:13px;line-height:1.5;">Se o botão não funcionar, copia esse link no navegador:</p>
          <p style="margin:0 0 16px;word-break:break-all;font-size:12px;">
            <a href="${args.magicLink}" style="color:#69080b;text-decoration:underline;">${args.magicLink}</a>
          </p>
          <p style="margin:0;color:#8a7560;font-size:13px;line-height:1.5;">
            Esse link expira em 1 hora. Depois de entrar, você pode definir uma senha em Configurações → Segurança, ou continuar usando email magic link.
          </p>
        </td></tr>
        <tr><td style="padding:20px 32px;background:#fffdf0;border-top:1px solid #f5e6b8;color:#8a7560;font-size:11px;" align="center">
          Dúvidas? Responde esse email ou chama no WhatsApp <a href="https://wa.me/5541999192683" style="color:#69080b;text-decoration:none;">+55 41 99919-2683</a>.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

async function sendBrevoEmail(args: {
  apiKey: string; to: string; subject: string; htmlContent: string;
}): Promise<{ ok: boolean; error?: string }> {
  try {
    const res = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": args.apiKey, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: [{ email: args.to }],
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

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function logSafe(scope: string, err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  console.error(`${scope}:`, msg);
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  try {
    const expectedHottok = Deno.env.get("HOTMART_HOTTOK");
    if (!expectedHottok || expectedHottok.length < 16) {
      console.error("payment-webhook: HOTMART_HOTTOK missing or too short");
      return new Response("Server misconfigured", { status: 500 });
    }
    const hottok = req.headers.get("x-hotmart-hottok") ?? "";
    if (!constantTimeEqual(hottok, expectedHottok)) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const event = body.event as string;
    const creationDate = Number(body.creation_date ?? body.data?.purchase?.creation_date ?? 0);
    const buyerEmail = body.data?.buyer?.email?.toLowerCase()?.trim();
    const offerCode = body.data?.purchase?.offer?.code;
    const transactionId = body.data?.purchase?.transaction;

    if (creationDate > 0) {
      const ageMs = Date.now() - creationDate;
      if (ageMs > REPLAY_WINDOW_MS || ageMs < -REPLAY_WINDOW_MS) {
        return new Response("Stale or future-dated webhook", { status: 400 });
      }
    }

    if (!transactionId) {
      return new Response(JSON.stringify({ received: true, warning: "no transaction id" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!buyerEmail) {
      return new Response(JSON.stringify({ received: true, warning: "no email" }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existing, error: idemError } = await supabase
      .from("payment_events")
      .insert({
        transaction_id: transactionId,
        event,
        buyer_email: buyerEmail,
      })
      .select("transaction_id")
      .maybeSingle();

    if (idemError && idemError.code !== "23505") {
      logSafe("payment-webhook idempotency", idemError);
      return new Response("Internal error", { status: 500 });
    }
    if (idemError?.code === "23505" || !existing) {
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }

    const buyerName: string = body.data?.buyer?.name ?? "";
    const buyerPhone: string = body.data?.buyer?.checkout_phone ?? body.data?.buyer?.phone ?? "";

    const { data: userRow, error: userLookupError } = await supabase
      .rpc("find_user_id_by_email", { p_email: buyerEmail });

    if (userLookupError) {
      logSafe("payment-webhook user lookup", userLookupError);
      return new Response("Internal error", { status: 500 });
    }

    let userAuthId = userRow as string | null;
    let createdNewUser = false;

    // Se evento é ativação e o user NÃO existe → criar conta automaticamente
    if (!userAuthId && ACTIVATE_EVENTS.includes(event)) {
      const { data: created, error: createError } = await supabase.auth.admin.createUser({
        email: buyerEmail,
        email_confirm: true,
        user_metadata: { fullname: buyerName },
      });
      if (createError) {
        logSafe("payment-webhook auth.createUser", createError);
        return new Response("User creation failed", { status: 500 });
      }
      userAuthId = created.user?.id ?? null;
      createdNewUser = true;

      // Cria perfil em public.users
      if (userAuthId) {
        await supabase.from("users").insert({
          user_auth_id: userAuthId,
          fullname: buyerName || null,
          phone: buyerPhone || null,
        });
      }
    } else if (!userAuthId) {
      // Evento de cancelamento sem user existente — nada a fazer
      return new Response(
        JSON.stringify({ received: true, pending: "user_not_found_for_cancel" }),
        { headers: { "Content-Type": "application/json" } }
      );
    }

    if (ACTIVATE_EVENTS.includes(event) && userAuthId) {
      const planType = OFFER_PLANS[offerCode] ?? "monthly";

      const periodEnd = new Date();
      if (planType === "yearly") {
        periodEnd.setFullYear(periodEnd.getFullYear() + 1);
      } else {
        periodEnd.setMonth(periodEnd.getMonth() + 1);
      }

      const { error } = await supabase
        .from("users")
        .update({
          subscription_active: true,
          plan_type: planType,
          current_period_end: periodEnd.toISOString(),
        })
        .eq("user_auth_id", userAuthId);

      if (error) {
        logSafe("payment-webhook activate", error);
        return new Response("DB update failed", { status: 500 });
      }

      // Se criou conta agora, gera magic link e envia email de boas-vindas
      if (createdNewUser) {
        const { data: linkData, error: linkErr } = await supabase.auth.admin.generateLink({
          type: "magiclink",
          email: buyerEmail,
        });
        if (linkErr) {
          logSafe("payment-webhook generateLink", linkErr);
        }
        const magicLink = linkData?.properties?.action_link ?? `${SITE_URL}/`;

        const brevoKey = Deno.env.get("BREVO_API_KEY");
        if (brevoKey) {
          const planLabel = planType === "yearly" ? "Anual" : "Mensal";
          const html = buildWelcomeEmail({ fullname: buyerName, magicLink, planLabel });
          const sent = await sendBrevoEmail({
            apiKey: brevoKey,
            to: buyerEmail,
            subject: `Bem-vinda à ColméIA Infantil — seu acesso liberado 🐝`,
            htmlContent: html,
          });
          if (!sent.ok) logSafe("payment-webhook brevo", new Error(sent.error ?? "unknown"));
        }
      }
    }

    if (DEACTIVATE_EVENTS.includes(event)) {
      const { error } = await supabase
        .from("users")
        .update({ subscription_active: false })
        .eq("user_auth_id", userAuthId);

      if (error) {
        logSafe("payment-webhook deactivate", error);
        return new Response("DB update failed", { status: 500 });
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    logSafe("payment-webhook", err);
    return new Response("Internal error", { status: 500 });
  }
});
