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

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { agentType } = await req.json();
    if (!(agentType in DOCS_MAP)) {
      return new Response("Invalid agentType", { status: 400, headers: corsHeaders });
    }

    const docRes = await fetch(
      `https://docs.google.com/document/d/${DOCS_MAP[agentType as AgentType]}/export?format=txt`
    );
    if (!docRes.ok) {
      throw new Error(`Failed to fetch doc: ${docRes.status}`);
    }

    const text = await docRes.text();

    await supabase
      .from("agents_prompts")
      .update({ prompt: text.trim() })
      .eq("agent_type", agentType);

    return new Response(
      JSON.stringify({ success: true }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("sync_agent_prompt:", err);
    return new Response("Internal error", { status: 500, headers: corsHeaders });
  }
});
