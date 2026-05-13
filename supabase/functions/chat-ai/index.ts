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
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const TOKEN_LIMITS: Record<string, number> = {
  monthly: 80000,
  yearly: 100000,
};

const MAX_USER_MESSAGE_CHARS = 8000;
const MAX_FILE_CONTEXT_CHARS = 60000;
const RATE_LIMIT_PER_MIN = 10;
const OPENAI_TIMEOUT_MS = 60_000;

function jsonError(status: number, code: string, cors: Record<string, string>) {
  return new Response(
    JSON.stringify({ error: code }),
    { status, headers: { ...cors, "Content-Type": "application/json" } }
  );
}

Deno.serve(async (req: Request) => {
  const corsHeaders = corsFor(req);

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonError(401, "missing_authorization", corsHeaders);
    }
    const jwt = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        global: {
          headers: { Authorization: `Bearer ${jwt}` },
        },
      }
    );

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return jsonError(401, "unauthorized", corsHeaders);
    }

    const user_auth_id = user.id;

    const { data: allowed, error: rlError } = await supabase
      .rpc("rate_limit_check", {
        p_key: `chat-ai:${user_auth_id}`,
        p_max: RATE_LIMIT_PER_MIN,
        p_window_sec: 60,
      });

    if (rlError) {
      console.error("chat-ai rate_limit:", rlError.message);
    } else if (allowed === false) {
      return jsonError(429, "rate_limit_exceeded", corsHeaders);
    }

    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("subscription_active, plan_type, role")
      .eq("user_auth_id", user_auth_id)
      .single();

    if (userDataError || !userData) {
      return jsonError(403, "user_not_found", corsHeaders);
    }

    const isAdmin = userData.role === "admin";
    if (!isAdmin && !userData.subscription_active) {
      return jsonError(403, "subscription_required", corsHeaders);
    }

    const plan = userData.plan_type ?? "monthly";
    const tokenLimit = TOKEN_LIMITS[plan] ?? TOKEN_LIMITS.monthly;

    const { data: usageData, error: usageError } = await supabase
      .from("user_monthly_usage")
      .select("id, tokens_used")
      .eq("user_auth_id", user_auth_id)
      .maybeSingle();

    if (usageError) {
      console.error("chat-ai usage fetch:", usageError.message);
      return jsonError(500, "internal_error", corsHeaders);
    }

    const currentTokens = usageData?.tokens_used ?? 0;

    if (currentTokens >= tokenLimit) {
      return jsonError(403, "token_limit_reached", corsHeaders);
    }

    const payload = await req.json();
    const { chat_id, user_message, agent_id, createTitle, file_context } = payload ?? {};

    if (typeof chat_id !== "string" || typeof user_message !== "string") {
      return jsonError(400, "invalid_payload", corsHeaders);
    }
    if (user_message.length === 0 || user_message.length > MAX_USER_MESSAGE_CHARS) {
      return jsonError(400, "invalid_user_message", corsHeaders);
    }
    let fileContextSafe: string | null = null;
    if (file_context != null) {
      if (typeof file_context !== "string" || file_context.length > MAX_FILE_CONTEXT_CHARS) {
        return jsonError(400, "invalid_file_context", corsHeaders);
      }
      fileContextSafe = file_context;
    }

    // Validate chat belongs to user before accessing messages
    const { data: chatData, error: chatError } = await supabase
      .from("chats")
      .select("id, agent_type")
      .eq("id", chat_id)
      .eq("user_auth_id", user_auth_id)
      .single();

    if (chatError || !chatData) {
      return jsonError(403, "chat_not_found", corsHeaders);
    }

    const agentType = (typeof agent_id === "string" && agent_id) || chatData.agent_type;

    let systemPrompt = "Voce e um assistente util.";
    if (agentType) {
      const { data: agentData } = await supabase
        .from("agents_prompts")
        .select("prompt")
        .eq("agent_type", agentType)
        .maybeSingle();
      if (agentData?.prompt) {
        systemPrompt = agentData.prompt;
      }
    }

    const systemMessages: Array<{ role: string; content: string }> = [
      { role: "system", content: systemPrompt },
    ];

    if (fileContextSafe) {
      systemMessages.push({
        role: "system",
        content: `O usuário anexou o seguinte documento para análise:\n\n${fileContextSafe}\n\nUse essas informações como contexto para responder às perguntas.`,
      });
    }

    const { data: history, error: historyError } = await supabase
      .from("chat_messages")
      .select("sender, message")
      .eq("chat_id", chat_id)
      .eq("user_auth_id", user_auth_id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (historyError) {
      console.error("chat-ai history:", historyError.message);
      return jsonError(500, "internal_error", corsHeaders);
    }

    const historyMessages = (history ?? [])
      .reverse()
      .map((msg) => ({
        role: msg.sender === "agent" ? "assistant" : "user",
        content: msg.message,
      }));

    const openaiController = new AbortController();
    const openaiTimeout = setTimeout(() => openaiController.abort(), OPENAI_TIMEOUT_MS);

    let openaiData;
    try {
      const openaiRes = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "gpt-4.1-mini",
            messages: [
              ...systemMessages,
              ...historyMessages,
              { role: "user", content: user_message },
            ],
          }),
          signal: openaiController.signal,
        }
      );

      if (!openaiRes.ok) {
        const errText = await openaiRes.text();
        console.error("chat-ai openai:", openaiRes.status, errText.slice(0, 200));
        return jsonError(502, "ai_upstream_error", corsHeaders);
      }
      openaiData = await openaiRes.json();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("chat-ai openai fetch:", msg);
      return jsonError(504, "ai_timeout", corsHeaders);
    } finally {
      clearTimeout(openaiTimeout);
    }

    const agentMessage = openaiData.choices?.[0]?.message?.content;
    if (typeof agentMessage !== "string") {
      return jsonError(502, "ai_invalid_response", corsHeaders);
    }

    const tokensUsed = openaiData.usage?.total_tokens ?? 0;

    const { data: usageAfter, error: incError } = await supabase
      .rpc("increment_token_usage", {
        p_user_auth_id: user_auth_id,
        p_amount: tokensUsed,
        p_token_limit: tokenLimit,
      });

    let newTotal = currentTokens + tokensUsed;
    if (incError) {
      console.error("chat-ai increment_tokens:", incError.message);
    } else if (typeof usageAfter === "number") {
      newTotal = usageAfter;
    }
    const newProgress = Math.min(newTotal / tokenLimit, 1);

    await supabase.from("chat_messages").insert({
      chat_id,
      user_auth_id,
      sender: "agent",
      message: agentMessage,
    });

    if (createTitle === true) {
      try {
        const titleRes = await fetch(
          "https://api.openai.com/v1/chat/completions",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${Deno.env.get("OPENAI_API_KEY")}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model: "gpt-4.1-mini",
              messages: [
                {
                  role: "system",
                  content:
                    "Gere um titulo curto (max 6 palavras) para um chat com base na mensagem do usuario. Retorne apenas o titulo, sem aspas.",
                },
                { role: "user", content: user_message },
              ],
            }),
          }
        );

        if (titleRes.ok) {
          const titleData = await titleRes.json();
          const title = titleData.choices?.[0]?.message?.content;
          if (typeof title === "string") {
            await supabase
              .from("chats")
              .update({ title: title.slice(0, 100) })
              .eq("id", chat_id)
              .eq("user_auth_id", user_auth_id);
          }
        }
      } catch (e) {
        console.error("chat-ai title gen:", e instanceof Error ? e.message : String(e));
      }
    }

    return new Response(
      JSON.stringify({
        reply: agentMessage,
        tokens_used: newTotal,
        tokens_remaining: tokenLimit - newTotal,
        progress: newProgress,
      }),
      {
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("chat-ai:", msg);
    return jsonError(500, "internal_error", corsFor(req));
  }
});
