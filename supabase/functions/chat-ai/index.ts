import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

console.info("chat-ai: boot");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const TOKEN_LIMITS: Record<string, number> = {
  monthly: 80000,
  yearly: 100000,
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  console.info("chat-ai: request received");

  try {
    // 1. JWT obrigatorio
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.info("chat-ai: missing authorization header");
      return new Response("Missing Authorization header", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const jwt = authHeader.replace("Bearer ", "");
    console.info("chat-ai: jwt received, length:", jwt.length);

    // 2. Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      {
        global: {
          headers: { Authorization: `Bearer ${jwt}` },
        },
      }
    );

    // 3. Valida usuario
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.info("chat-ai: unauthorized -", userError?.message);
      return new Response("Unauthorized", {
        status: 401,
        headers: corsHeaders,
      });
    }

    const user_auth_id = user.id;
    console.info("chat-ai: user validated -", user_auth_id);

    // 4. Verifica assinatura ativa
    const { data: userData, error: userDataError } = await supabase
      .from("users")
      .select("subscription_active, plan_type")
      .eq("user_auth_id", user_auth_id)
      .single();

    if (userDataError || !userData) {
      console.info("chat-ai: user not found in users table -", userDataError?.message);
      return new Response(
        JSON.stringify({ error: "user_not_found" }),
        { status: 403, headers: corsHeaders }
      );
    }

    if (!userData.subscription_active) {
      console.info("chat-ai: subscription not active");
      return new Response(
        JSON.stringify({ error: "subscription_required" }),
        { status: 403, headers: corsHeaders }
      );
    }

    console.info("chat-ai: subscription active, plan:", userData.plan_type);

    // 5. Verifica limite de tokens
    const plan = userData.plan_type ?? "monthly";
    const tokenLimit = TOKEN_LIMITS[plan] ?? TOKEN_LIMITS.monthly;

    const { data: usageData, error: usageError } = await supabase
      .from("user_monthly_usage")
      .select("id, tokens_used")
      .eq("user_auth_id", user_auth_id)
      .single();

    if (usageError && usageError.code !== "PGRST116") {
      throw new Error("Failed to fetch usage data: " + usageError.message);
    }

    const currentTokens = usageData?.tokens_used ?? 0;
    console.info("chat-ai: tokens used:", currentTokens, "/", tokenLimit);

    if (currentTokens >= tokenLimit) {
      console.info("chat-ai: token limit reached");
      return new Response(
        JSON.stringify({ error: "token_limit_reached" }),
        { status: 403, headers: corsHeaders }
      );
    }

    // 6. Body
    const { chat_id, user_message, prompt, agent_id, createTitle, file_context } =
      await req.json();

    console.info("chat-ai: body received, chat_id:", chat_id, "has file_context:", !!file_context);

    if (!chat_id || !user_message) {
      console.info("chat-ai: invalid payload");
      return new Response("Invalid payload", {
        status: 400,
        headers: corsHeaders,
      });
    }

    // 7. Busca prompt do agente ou usa fallback
    let systemPrompt = prompt ?? "Voce e um assistente util.";

    if (agent_id) {
      const { data: agentData } = await supabase
        .from("agents_prompts")
        .select("prompt")
        .eq("agent_id", agent_id)
        .single();

      if (agentData?.prompt) {
        systemPrompt = agentData.prompt;
        console.info("chat-ai: prompt loaded for agent:", agent_id);
      }
    }

    // 8. Build system messages (prompt + optional file context)
    const systemMessages: Array<{ role: string; content: string }> = [];

    if (systemPrompt) {
      systemMessages.push({ role: "system", content: systemPrompt });
    }

    if (file_context) {
      systemMessages.push({
        role: "system",
        content: `O usuário anexou o seguinte documento para análise:\n\n${file_context}\n\nUse essas informações como contexto para responder às perguntas.`,
      });
      console.info("chat-ai: file_context injected, length:", file_context.length);
    }

    // 9. Busca historico de mensagens
    const { data: history, error: historyError } = await supabase
      .from("chat_messages")
      .select("sender, message")
      .eq("chat_id", chat_id)
      .order("created_at", { ascending: false })
      .limit(30);

    if (historyError) {
      throw new Error("Failed to load chat history: " + historyError.message);
    }

    const historyMessages = (history ?? [])
      .reverse()
      .map((msg) => ({
        role: msg.sender === "agent" ? "assistant" : "user",
        content: msg.message,
      }));

    // 10. Chamada OpenAI
    console.info("chat-ai: calling openai");
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
      }
    );

    if (!openaiRes.ok) {
      const err = await openaiRes.text();
      throw new Error("OpenAI error: " + err);
    }

    const openaiData = await openaiRes.json();
    const agentMessage = openaiData.choices[0].message.content;
    console.info("chat-ai: openai response received");

    // 11. Atualiza tokens_used
    const tokensUsed = openaiData.usage?.total_tokens ?? 0;
    const newTotal = currentTokens + tokensUsed;
    const newProgress = Math.min(newTotal / tokenLimit, 1);

    console.info("chat-ai: updating tokens:", newTotal, "/", tokenLimit);

    if (usageData?.id) {
      await supabase
        .from("user_monthly_usage")
        .update({
          tokens_used: newTotal,
          progress_bar_value: newProgress,
        })
        .eq("id", usageData.id);
    } else {
      await supabase.from("user_monthly_usage").insert({
        user_auth_id,
        tokens_used: newTotal,
        progress_bar_value: newProgress,
      });
    }

    console.info("chat-ai: tokens updated");

    // 12. Salva mensagem do agente
    await supabase.from("chat_messages").insert({
      chat_id,
      user_auth_id,
      sender: "agent",
      message: agentMessage,
    });

    // 13. Geracao de titulo (opcional)
    if (createTitle === true) {
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
        const title = titleData.choices[0].message.content;
        await supabase
          .from("chats")
          .update({ title })
          .eq("id", chat_id);
        console.info("chat-ai: title generated:", title);
      }
    }

    // 14. Retorno
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
  } catch (err: any) {
    console.error("chat-ai: error -", err.message);
    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
});
