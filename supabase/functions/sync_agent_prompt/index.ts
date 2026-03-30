import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

type AgentType = "marketing" | "customerAcquisition" | "psico";

const DOCS_MAP: Record<AgentType, string> = {
  psico: "1i_1XpLyvpU0N4VuNgha_PpWhH0MgGynC44AhhU-qXCA",
  marketing: "1i8CX1xkzw7jwlAM41Ne7HdzqCfHB9XXUPZiHJwscQxk",
  customerAcquisition: "1PGPXtEJUxhIx3tcjklxS1nmXvITLeNDr996nc5zHolU",
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function getGoogleAccessToken(sa: any) {
  const jwt = await crypto.subtle.importKey(
    "pkcs8",
    new TextEncoder().encode(sa.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const header = btoa(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);

  const claim = btoa(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/documents.readonly",
      aud: "https://oauth2.googleapis.com/token",
      exp: now + 3600,
      iat: now,
    })
  );

  const data = `${header}.${claim}`;
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    jwt,
    new TextEncoder().encode(data)
  );

  const signedJwt = `${data}.${btoa(
    String.fromCharCode(...new Uint8Array(signature))
  )}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: signedJwt,
    }),
  });

  const json = await res.json();
  return json.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response("Unauthorized", { status: 401, headers: corsHeaders });
    }

    const jwt = authHeader.replace("Bearer ", "");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data } = await supabase.auth.getUser(jwt);
    if (!data?.user) throw new Error("Invalid JWT");

    const { agentType } = await req.json();
    if (!(agentType in DOCS_MAP)) {
      return new Response("Invalid agentType", { status: 400, headers: corsHeaders });
    }

    const sa = JSON.parse(Deno.env.get("GOOGLE_SERVICE_ACCOUNT_JSON")!);
    const token = await getGoogleAccessToken(sa);

    const docRes = await fetch(
      `https://docs.googleapis.com/v1/documents/${DOCS_MAP[agentType]}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const doc = await docRes.json();

    const text =
      doc.body?.content
        ?.map((c: any) =>
          c.paragraph?.elements
            ?.map((e: any) => e.textRun?.content || "")
            .join("")
        )
        .join("") ?? "";

    await supabase
      .from("agents_prompts")
      .update({ prompt: text.trim() })
      .eq("agent_type", agentType);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("SYNC ERROR:", err);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
