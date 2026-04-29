import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// 💸 Model rẻ nhất + đủ dùng cho chatbot config-driven
const CHEAP_MODEL = "google/gemini-2.5-flash-lite";
const MAX_TOKENS = 300;

async function persistChat(
  supabase: ReturnType<typeof createClient>,
  sessionId: string | null,
  userId: string | null,
  userAgent: string | null,
  userMessage: string,
  assistantReply: string,
) {
  if (!sessionId) return;
  try {
    const { data: existing } = await supabase
      .from("chat_conversations").select("id")
      .eq("session_id", sessionId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    let conversationId = existing?.id as string | undefined;
    if (!conversationId) {
      const { data: created } = await supabase
        .from("chat_conversations")
        .insert({ session_id: sessionId, user_id: userId, user_agent: userAgent })
        .select("id").single();
      conversationId = created?.id as string | undefined;
    }
    if (!conversationId) return;
    await supabase.from("chat_messages").insert([
      { conversation_id: conversationId, role: "user", content: userMessage },
      { conversation_id: conversationId, role: "assistant", content: assistantReply },
    ]);
    await supabase.from("chat_conversations").update({
      last_message_preview: assistantReply.slice(0, 200),
      updated_at: new Date().toISOString(),
    }).eq("id", conversationId);
  } catch (e) {
    console.error("persist error:", e);
  }
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, systemPrompt, sessionId, userId } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "Messages required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "AI not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 💸 Chỉ giữ tối đa 3 tin nhắn gần nhất từ client
    const recent = messages.slice(-3).map((m: { role: string; content: string }) => ({
      role: m.role === "user" ? "user" : "assistant",
      content: String(m.content || "").slice(0, 1000),
    }));

    const sys = String(systemPrompt || "Bạn là trợ lý Giang Nguyên Seafood. Trả lời ngắn gọn, thân thiện, xưng 'em'.");

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: CHEAP_MODEL,
        max_tokens: MAX_TOKENS,
        messages: [
          { role: "system", content: sys },
          ...recent,
        ],
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "Hệ thống đang bận, vui lòng thử lại sau." }), {
        status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "Đã hết credits AI." }), {
        status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!aiResp.ok) {
      const t = await aiResp.text();
      console.error("AI error", aiResp.status, t);
      return new Response(JSON.stringify({ error: "Lỗi AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiData = await aiResp.json();
    const reply: string = aiData.choices?.[0]?.message?.content
      || "Em chưa rõ ý mình, anh/chị nói rõ hơn giúp em ạ!";

    // Lưu lịch sử cho admin xem (không chặn response)
    if (SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY) {
      const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
      const lastUser = [...recent].reverse().find((m) => m.role === "user");
      persistChat(
        supabase,
        typeof sessionId === "string" ? sessionId : null,
        typeof userId === "string" ? userId : null,
        req.headers.get("user-agent"),
        lastUser?.content || "",
        reply,
      ).catch((e) => console.error("persist bg error:", e));
    }

    return new Response(JSON.stringify({ reply }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
