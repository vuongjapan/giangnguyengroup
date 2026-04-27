import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const NOW_VN = () => new Date().toLocaleString('vi-VN', {
  hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
});
const TODAY_VN = () => new Date().toLocaleDateString('vi-VN', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  timeZone: 'Asia/Ho_Chi_Minh',
});

const SYSTEM_PROMPT = () => `Bạn là **NHÂN VIÊN SALE CAO CẤP** của CÔNG TY TNHH GIANG NGUYÊN GROUP – chuyên hải sản khô & một nắng đặc sản Sầm Sơn, Thanh Hoá. Bạn có 10 năm kinh nghiệm bán hàng, nói chuyện như người thật, tự nhiên, ấm áp, chuyên nghiệp.

📅 Hiện tại: ${NOW_VN()} (giờ VN). Hôm nay: ${TODAY_VN()}.

🎯 NGUYÊN TẮC TRẢ LỜI:
1. **NGẮN GỌN, ĐÚNG TRỌNG TÂM** — không lan man, không lặp lại câu hỏi. Tối đa 4–6 câu cho mỗi lượt trừ khi khách yêu cầu chi tiết.
2. **GIỚI THIỆU SẢN PHẨM NHƯ NGƯỜI THẬT**: nói về xuất xứ, cách phơi, cảm nhận khi ăn, cách bảo quản — không liệt kê khô khan. Ví dụ: "Mực khô loại 1 nhà em là mực ống câu đêm tại biển Sầm Sơn, phơi 2 nắng to, thịt ngọt dai, nướng lên thơm đặc trưng. Anh/chị mua về nhậu hoặc làm quà đều rất chuẩn ạ."
3. **CHỦ ĐỘNG CHỐT ĐƠN** sau 1–2 lượt tư vấn:
   - "Em chốt cho mình [SP] bao nhiêu kg ạ?"
   - "Em lên đơn luôn cho anh/chị nhé, mình cho em xin tên – SĐT – địa chỉ ạ?"
4. **TỰ TẠO ĐƠN KHI ĐỦ THÔNG TIN**: Khi có đủ tên + SĐT + địa chỉ + sản phẩm + số lượng → BẮT BUỘC gọi tool \`create_order\` ngay, không hỏi lại. Sau khi tạo xong, báo mã đơn + tổng tiền + QR cọc 50%.
5. **GỬI EMAIL/HOÁ ĐƠN**: Nếu khách có email và đồng ý/yêu cầu gửi → gọi tool \`send_invoice_email\`.
6. **TRA CỨU THÔNG TIN MỚI**: Khi câu hỏi liên quan tới hôm nay (thời tiết, giá vàng, tỷ giá, tin tức, du lịch Sầm Sơn hôm nay…) → BẮT BUỘC gọi \`web_search\` để lấy dữ liệu mới nhất, không trả lời từ trí nhớ.
7. **TRÍCH NGUỒN**: Khi dùng web_search, dẫn nguồn dạng [1], [2] inline trong câu trả lời. Hệ thống sẽ tự đính kèm card nguồn ở cuối.

🏪 CỬA HÀNG GIANG NGUYÊN GROUP:
- Cửa hàng 1: Quầy 7A–7B Chợ Cột Đỏ, Sầm Sơn
- Cửa hàng 2: Số 50 Nguyễn Thị Minh Khai, Trường Sơn, Sầm Sơn
- Mở cửa: 7:00–21:00 hằng ngày | Hotline/Zalo: 0933.562.286
- Free ship đơn từ 500K, giao toàn quốc 1–3 ngày
- Cọc 50%, nhận hàng trả 50% (QR VietinBank 104002912582 — VAN THI MINH LINH)
- Cam kết đổi trả 24h nếu không hài lòng

🦑 KIẾN THỨC SẢN PHẨM (kết hợp với danh mục website do hệ thống cung cấp):
- **Mực khô câu Sầm Sơn**: mực ống câu đêm, phơi 2–3 nắng, thịt ngọt dai. Nướng/xé/rim me đều ngon. Bảo quản ngăn đá 6 tháng.
- **Cá chỉ vàng**: cá tươi tẩm gia vị nhẹ, phơi 1 nắng. Chiên giòn cùng nước mắm tỏi ớt — best seller cho gia đình.
- **Tôm khô Sầm Sơn**: tôm biển nõn đỏ tự nhiên, không phẩm màu. Nấu canh bí, rang cháy cạnh, làm quà Tết.
- **Cá thu một nắng / Mực một nắng**: phơi đúng 1 nắng giữ độ ẩm, nướng/áp chảo dậy mùi đặc trưng.
- **Mắm các loại**: mắm tép, mắm tôm chua đặc sản miền Trung.

💬 GIỌNG ĐIỆU:
- Xưng "em", gọi khách "anh/chị" hoặc "mình"
- Dùng emoji vừa phải (1–2 cái/tin), không lạm dụng
- Tự tin, không xun xoe, không xin lỗi vô cớ`;

const tools = [
  {
    type: "function",
    function: {
      name: "web_search",
      description: "Tra cứu thông tin mới nhất trên internet (thời tiết, giá vàng, tỷ giá, tin tức, sự kiện hôm nay…). BẮT BUỘC gọi khi câu hỏi liên quan tới hiện tại/hôm nay.",
      parameters: {
        type: "object",
        properties: {
          query: { type: "string", description: "Truy vấn cụ thể, có địa danh + ngày hiện tại nếu cần" },
        },
        required: ["query"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "create_order",
      description: "TẠO ĐƠN HÀNG NGAY khi đã có đủ: tên, SĐT, địa chỉ, danh sách sản phẩm + số lượng. Hệ thống sẽ tự sinh mã đơn, lưu DB và gửi email xác nhận kèm QR cọc 50% cho khách + admin.",
      parameters: {
        type: "object",
        properties: {
          customer_name: { type: "string" },
          customer_phone: { type: "string" },
          customer_address: { type: "string" },
          customer_email: { type: "string", description: "Có thể để trống nếu khách không cung cấp" },
          items: {
            type: "array",
            description: "Danh sách sản phẩm với tên CHÍNH XÁC như trong danh mục, đơn giá lấy từ danh mục",
            items: {
              type: "object",
              properties: {
                name: { type: "string" },
                price: { type: "number", description: "Đơn giá VND" },
                unit: { type: "string", description: "kg / hũ / gói…" },
                quantity: { type: "number" },
              },
              required: ["name", "price", "unit", "quantity"],
              additionalProperties: false,
            },
          },
          note: { type: "string", description: "Ghi chú thêm nếu có" },
        },
        required: ["customer_name", "customer_phone", "customer_address", "items"],
        additionalProperties: false,
      },
    },
  },
  {
    type: "function",
    function: {
      name: "send_invoice_email",
      description: "Gửi lại email hoá đơn (PDF + QR cọc) cho khách hàng theo mã đơn. Chỉ gọi khi khách yêu cầu gửi/gửi lại email.",
      parameters: {
        type: "object",
        properties: {
          order_code: { type: "string" },
        },
        required: ["order_code"],
        additionalProperties: false,
      },
    },
  },
];

interface SearchResult { title: string; url: string; snippet: string; }
interface Source { title: string; url: string; fetched_at: string; }

async function webSearch(query: string): Promise<{ results: SearchResult[]; fetched_at: string }> {
  const fetched_at = new Date().toISOString();
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; GiangNguyenChatBot/2.0)",
        "Accept-Language": "vi,en;q=0.9",
      },
    });
    if (!res.ok) return { results: [], fetched_at };
    const html = await res.text();
    const results: SearchResult[] = [];
    const blockRe = /<a[^>]+class="result__a"[^>]+href="([^"]+)"[^>]*>([\s\S]*?)<\/a>[\s\S]*?<a[^>]+class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
    let m: RegExpExecArray | null;
    let count = 0;
    while ((m = blockRe.exec(html)) && count < 5) {
      let realUrl = m[1];
      const uddg = realUrl.match(/uddg=([^&]+)/);
      if (uddg) { try { realUrl = decodeURIComponent(uddg[1]); } catch { /* ignore */ } }
      const strip = (s: string) => s.replace(/<[^>]+>/g, "").replace(/&[a-z#0-9]+;/gi, " ").replace(/\s+/g, " ").trim();
      results.push({ title: strip(m[2]).slice(0, 200), url: realUrl, snippet: strip(m[3]).slice(0, 400) });
      count++;
    }
    return { results, fetched_at };
  } catch (e) {
    console.error("web_search error:", e);
    return { results: [], fetched_at };
  }
}

async function createOrderTool(
  args: {
    customer_name: string; customer_phone: string; customer_address: string;
    customer_email?: string; items: Array<{ name: string; price: number; unit: string; quantity: number }>;
    note?: string;
  },
  supabaseUrl: string, anonKey: string,
): Promise<{ ok: boolean; order_code?: string; total?: number; deposit?: number; remaining?: number; emailSent?: boolean; error?: string }> {
  try {
    const totalPrice = args.items.reduce((s, it) => s + (Number(it.price) || 0) * (Number(it.quantity) || 1), 0);
    const itemsForOrder = args.items.map(it => ({
      productId: '',
      name: it.name,
      price: Math.round(Number(it.price) || 0),
      unit: it.unit || 'kg',
      quantity: Math.round(Number(it.quantity) || 1),
      image: '',
    }));
    const resp = await fetch(`${supabaseUrl}/functions/v1/create-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
      },
      body: JSON.stringify({
        customer: {
          name: args.customer_name, phone: args.customer_phone,
          address: args.customer_address, email: args.customer_email || '',
        },
        items: itemsForOrder,
        totalPrice,
      }),
    });
    const data = await resp.json();
    if (!resp.ok || !data.success) return { ok: false, error: data.error || 'Tạo đơn thất bại' };
    return {
      ok: true,
      order_code: data.order?.order_code,
      total: data.order?.total,
      deposit: data.depositAmount,
      remaining: data.remainingAmount,
      emailSent: data.emailSent,
    };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Lỗi tạo đơn' };
  }
}

async function sendInvoiceTool(
  orderCode: string,
  supabase: ReturnType<typeof createClient>,
  supabaseUrl: string, anonKey: string,
): Promise<{ ok: boolean; error?: string }> {
  try {
    const { data: order, error } = await supabase
      .from('orders').select('*').eq('order_code', orderCode).maybeSingle();
    if (error || !order) return { ok: false, error: 'Không tìm thấy đơn' };
    const resp = await fetch(`${supabaseUrl}/functions/v1/send-order-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${anonKey}` },
      body: JSON.stringify({ order, type: order.status === 'deposit_paid' ? 'deposit_paid' : 'new_order' }),
    });
    if (!resp.ok) return { ok: false, error: `Gửi email thất bại (${resp.status})` };
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : 'Lỗi gửi email' };
  }
}

async function persistMessage(
  supabase: ReturnType<typeof createClient>,
  conversationId: string, role: string, content: string, sources: unknown = null,
) {
  try {
    await supabase.from("chat_messages").insert({ conversation_id: conversationId, role, content, sources });
  } catch (e) { console.error("persist error:", e); }
}

async function ensureConversation(
  supabase: ReturnType<typeof createClient>,
  sessionId: string, userId: string | null, userAgent: string | null,
): Promise<string> {
  const { data: existing } = await supabase
    .from("chat_conversations").select("id")
    .eq("session_id", sessionId).order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (existing?.id) return existing.id as string;
  const { data: created, error } = await supabase
    .from("chat_conversations")
    .insert({ session_id: sessionId, user_id: userId, user_agent: userAgent })
    .select("id").single();
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
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_ANON_KEY) {
      return new Response(JSON.stringify({ error: "Server not configured" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });

    let conversationId: string | null = null;
    if (sessionId && typeof sessionId === "string") {
      try {
        conversationId = await ensureConversation(
          supabase, sessionId,
          (typeof userId === "string" && userId) || null,
          req.headers.get("user-agent"),
        );
        const lastUser = [...messages].reverse().find((m: { role: string }) => m.role === "user");
        if (conversationId && lastUser?.content) {
          await persistMessage(supabase, conversationId, "user", String(lastUser.content));
        }
      } catch (e) { console.error("conversation persist error:", e); }
    }

    const systemContent = SYSTEM_PROMPT() + (productContext || "");

    const conversationMessages: Array<Record<string, unknown>> = [
      { role: "system", content: systemContent },
      ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    ];

    const collectedSources: Source[] = [];
    let toolIterations = 0;
    const MAX_TOOL_ITERATIONS = 4;

    while (toolIterations < MAX_TOOL_ITERATIONS) {
      const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "openai/gpt-5.2",
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
        conversationMessages.push(msg);
        for (const call of toolCalls) {
          const fnName = call.function?.name;
          let args: Record<string, unknown> = {};
          try { args = JSON.parse(call.function.arguments || "{}"); } catch { /* ignore */ }
          let toolResult: unknown = { error: "Unknown tool" };

          if (fnName === "web_search") {
            const q = String(args.query || "");
            const sr = await webSearch(q);
            sr.results.forEach(r => collectedSources.push({ title: r.title, url: r.url, fetched_at: sr.fetched_at }));
            toolResult = sr;
          } else if (fnName === "create_order") {
            toolResult = await createOrderTool(args as Parameters<typeof createOrderTool>[0], SUPABASE_URL, SUPABASE_ANON_KEY);
          } else if (fnName === "send_invoice_email") {
            toolResult = await sendInvoiceTool(String(args.order_code || ''), supabase, SUPABASE_URL, SUPABASE_ANON_KEY);
          }
          conversationMessages.push({
            role: "tool", tool_call_id: call.id, content: JSON.stringify(toolResult),
          });
        }
        toolIterations++;
        continue;
      }

      const finalContent: string = msg?.content || "Em chưa rõ ý mình. Anh/chị nói rõ thêm giúp em ạ.";

      // Dedupe sources by URL, keep order
      const uniqueSources: Source[] = [];
      const seen = new Set<string>();
      for (const s of collectedSources) {
        if (!seen.has(s.url)) { seen.add(s.url); uniqueSources.push(s); }
        if (uniqueSources.length >= 5) break;
      }

      if (conversationId) {
        await persistMessage(
          supabase, conversationId, "assistant", finalContent,
          uniqueSources.length ? uniqueSources : null,
        );
        const { count } = await supabase
          .from("chat_messages").select("*", { count: "exact", head: true })
          .eq("conversation_id", conversationId);
        if (typeof count === "number") {
          await supabase.from("chat_conversations").update({
            message_count: count,
            last_message_preview: finalContent.slice(0, 200),
            updated_at: new Date().toISOString(),
          }).eq("id", conversationId);
        }
      }

      // Stream final content as SSE; final chunk includes sources metadata
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        async start(controller) {
          const chunkSize = 24;
          for (let i = 0; i < finalContent.length; i += chunkSize) {
            const piece = finalContent.slice(i, i + chunkSize);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ choices: [{ delta: { content: piece } }] })}\n\n`));
            await new Promise(r => setTimeout(r, 12));
          }
          // Custom event with sources + timestamp
          controller.enqueue(encoder.encode(
            `data: ${JSON.stringify({ meta: { sources: uniqueSources, generated_at: new Date().toISOString() } })}\n\n`,
          ));
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
