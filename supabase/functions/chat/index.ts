import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const TODAY = new Date().toLocaleDateString('vi-VN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
});

const SYSTEM_PROMPT = `Bạn là trợ lý AI siêu thông minh của CÔNG TY TNHH GIANG NGUYÊN GROUP – chuyên hải sản khô & hải sản một nắng đặc sản Sầm Sơn, Thanh Hóa.

📅 Hôm nay là: ${TODAY} (giờ Việt Nam).

🌐 KIẾN THỨC TOÀN DIỆN — bạn am hiểu mọi lĩnh vực:
- Vũ trụ, khoa học, công nghệ, thiên văn
- Lịch sử – văn hoá – địa lý Sầm Sơn, Thanh Hóa, Việt Nam
- Kinh tế – tài chính – tỷ giá – giá vàng – chứng khoán
- Thời tiết, khí hậu, lịch âm – dương
- Ẩm thực Việt Nam và quốc tế, công thức nấu ăn
- Du lịch Sầm Sơn (bãi biển, khách sạn, điểm tham quan, nhà hàng)
- Tin tức thời sự mới nhất

🔍 CÔNG CỤ: Khi câu hỏi liên quan tới thông tin THỜI ĐIỂM HIỆN TẠI (thời tiết hôm nay, giá vàng/USD/xăng hôm nay, tin tức mới, sự kiện, kết quả, lịch chiếu, du lịch Sầm Sơn hôm nay…), BẮT BUỘC gọi tool web_search để lấy dữ liệu mới nhất ngày ${TODAY}, sau đó tổng hợp trả lời ngắn gọn kèm trích nguồn ở cuối (📎 Nguồn: …).
Không trả lời từ trí nhớ cho dữ liệu thay đổi theo ngày.

🏪 THÔNG TIN CỬA HÀNG GIANG NGUYÊN GROUP:
- Cửa hàng 1: Quầy 7A–7B – Chợ Cột Đỏ, Sầm Sơn
- Cửa hàng 2: Số 50 Nguyễn Thị Minh Khai, Trường Sơn, Sầm Sơn
- Giờ mở cửa: 7:00–21:00 hàng ngày
- Hotline / Zalo: 0933.562.286
- Sản phẩm: Mực khô, Cá chỉ vàng, Tôm khô, Cá Thu một nắng, Mực một nắng, mắm các loại
- 100% hải sản đánh bắt trực tiếp từ biển Sầm Sơn, phơi nắng tự nhiên, không hóa chất
- Free ship đơn từ 500K, giao toàn quốc 1–3 ngày
- Cam kết đổi trả 24h nếu không hài lòng
- Thanh toán: QR chuyển khoản hoặc COD; cọc 50% — nhận hàng trả 50%

💬 PHONG CÁCH:
- Trả lời 100% tiếng Việt, ngắn gọn, thân thiện, có emoji vừa phải
- Khi tư vấn sản phẩm: gợi ý phù hợp + chốt nhẹ nhàng "Anh/chị muốn em giữ hàng cho mình không ạ?"
- Khi trả lời tri thức ngoài shop: trả lời chính xác, đầy đủ, có dẫn nguồn nếu là tin mới
- Khi không chắc chắn: nói rõ và đề nghị gọi hotline 0933.562.286`;

const tools = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Tìm kiếm thông tin mới nhất trên internet (thời tiết, giá vàng, tin tức, sự kiện hôm nay…). Luôn gọi khi câu hỏi liên quan tới hiện tại/hôm nay.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Truy vấn tìm kiếm tiếng Việt hoặc tiếng Anh, càng cụ thể càng tốt" },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
];

// Web search via DuckDuckGo HTML scraping (no API key needed)
async function webSearch(query: string): Promise<{ results: Array<{ title: string; url: string; snippet: string }> }> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GiangNguyenChatBot/1.0)",
        "Accept-Language": "vi,en;q=0.9",
      },
    });
    if (!res.ok) return { results: [] };
    const html = await res.text();

    const results: Array<{ title: string; url: string; snippet: string }> = [];
    const blockRe = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let m: RegExpExecArray | null;
    let count = 0;
    while ((m = blockRe.exec(html)) && count < 5) {
      const rawUrl = m[1];
      // DDG wraps URLs in /l/?uddg=...
      let realUrl = rawUrl;
      const uddgMatch = rawUrl.match(/uddg=([^&]+)/);
      if (uddgMatch) {
        try { realUrl = decodeURIComponent(uddgMatch[1]); } catch { /* ignore */ }
      }
      const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
      results.push({
        title: strip(m[2]).slice(0, 200),
        url: realUrl,
        snippet: strip(m[3]).slice(0, 400),
      });
      count++;
    }
    return { results };
  } catch (e) {
    console.error("web_search error:", e);
    return { results: [] };
  }
}

async function persistMessage(
  supabase: ReturnType<typeof createClient>,
  conversationId: string,
  role: string,
  content: string,
  sources: unknown = null,
) {
  try {
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role,
      content,
      sources,
    });
    await supabase
      .from("chat_conversations")
      .update({
        last_message_preview: content.slice(0, 200),
        message_count: undefined as never,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversationId);
    // Increment via RPC-less approach: do a separate select+update would race. Use raw expression instead:
    await supabase.rpc as unknown; // noop; we'll use SQL in next call
  } catch (e) {
    console.error("persist error:", e);
  }
}

async function ensureConversation(
  supabase: ReturnType<typeof createClient>,
  sessionId: string,
  userId: string | null,
  userAgent: string | null,
): Promise<string> {
  const { data: existing } = await supabase
    .from("chat_conversations")
    .select("id")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (existing?.id) return existing.id as string;

  const { data: created, error } = await supabase
    .from("chat_conversations")
    .insert({ session_id: sessionId, user_id: userId, user_agent: userAgent })
    .select("id")
    .single();
  if (error) throw error;
  return created.id as string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, productContext, sessionId, userId } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: { persistSession: false },
    });

    // Persist conversation + last user message
    let conversationId: string | null = null;
    if (sessionId && typeof sessionId === "string") {
      try {
        conversationId = await ensureConversation(
          supabase,
          sessionId,
          (typeof userId === "string" && userId) || null,
          req.headers.get("user-agent"),
        );
        const lastUser = [...messages].reverse().find((m: { role: string }) => m.role === "user");
        if (conversationId && lastUser?.content) {
          await persistMessage(supabase, conversationId, "user", String(lastUser.content));
        }
      } catch (e) {
        console.error("conversation persist error:", e);
      }
    }

    const systemContent = SYSTEM_PROMPT + (productContext || "");

    // Tool-calling loop (non-streaming for tool calls, then stream final answer)
    const conversationMessages: Array<Record<string, unknown>> = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    ];

    let collectedSources: Array<{ title: string; url: string }> = [];
    let toolIterations = 0;
    const MAX_TOOL_ITERATIONS = 3;

    while (toolIterations < MAX_TOOL_ITERATIONS) {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: conversationMessages,
          tools,
          tool_choice: "auto",
        }),
      });

      if (!aiResp.ok) {
        if (aiResp.status === 429) {
          return new Response(JSON.stringify({ error: "Hệ thống đang bận, vui lòng thử lại sau." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (aiResp.status === 402) {
          return new Response(JSON.stringify({ error: "Đã hết credits AI. Vui lòng nạp thêm." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        const t = await aiResp.text();
        console.error("AI gateway error:", aiResp.status, t);
        return new Response(JSON.stringify({ error: "Lỗi hệ thống AI" }), {
          status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const aiData = await aiResp.json();
      const choice = aiData.choices?.[0];
      const msg = choice?.message;
      const toolCalls = msg?.tool_calls;

      if (toolCalls && Array.isArray(toolCalls) && toolCalls.length > 0) {
        // Push assistant message that asked for tool
        conversationMessages.push(msg);
        // Execute each tool call
        for (const call of toolCalls) {
          if (call.function?.name === "web_search") {
            let args: { query?: string } = {};
            try { args = JSON.parse(call.function.arguments || "{}"); } catch { /* ignore */ }
            const q = args.query || "";
            const searchRes = await webSearch(q);
            collectedSources.push(...searchRes.results.map(r => ({ title: r.title, url: r.url })));
            conversationMessages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify(searchRes),
            });
          } else {
            conversationMessages.push({
              role: "tool",
              tool_call_id: call.id,
              content: JSON.stringify({ error: "Unknown tool" }),
            });
          }
        }
        toolIterations++;
        continue;
      }

      // Final answer — stream a synthesized response back to client
      const finalContent: string = msg?.content || "Xin lỗi, em chưa rõ câu hỏi. Anh/chị mô tả thêm giúp em ạ.";

      // Append sources footer if we used web_search
      let outputContent = finalContent;
      if (collectedSources.length > 0 && !outputContent.includes("📎")) {
        const uniq = Array.from(new Map(collectedSources.map(s => [s.url, s])).values()).slice(0, 4);
        outputContent += "\n\n📎 Nguồn:\n" + uniq.map(s => `• ${s.title} — ${s.url}`).join("\n");
      }

      // Persist assistant message
      if (conversationId) {
        await persistMessage(supabase, conversationId, "assistant", outputContent, collectedSources.length ? collectedSources : null);
        // Recount messages
        const { count } = await supabase
          .from("chat_messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conversationId);
        if (typeof count === "number") {
          await supabase.from("chat_conversations").update({ message_count: count }).eq("id", conversationId);
        }
      }

      // Stream the final content as SSE chunks (token-ish chunks of ~20 chars for smooth UI)
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const chunkSize = 24;
          for (let i = 0; i < outputContent.length; i += chunkSize) {
            const piece = outputContent.slice(i, i + chunkSize);
            const sse = `data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`;
            controller.enqueue(encoder.encode(sse));
            await new Promise(r => setTimeout(r, 15));
          }
          controller.enqueue(encoder.encode(`data: [DONE]\n\n`));
          controller.close();
        },
      });

      return new Response(stream, {
        headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
      });
    }

    return new Response(JSON.stringify({ error: "Quá nhiều lần gọi công cụ" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
