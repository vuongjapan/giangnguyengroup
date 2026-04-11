import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Bạn là nhân viên tư vấn bán hàng chuyên nghiệp của GIANG NGUYEN SEAFOOD – chuyên hải sản khô đặc sản Sầm Sơn, Thanh Hóa.

THÔNG TIN CỬA HÀNG:
- Cửa hàng 1: Quầy 7A7B – Chợ Cột Đỏ, Sầm Sơn
- Cửa hàng 2: LK29 – FLC Sầm Sơn
- Cửa hàng 3: 50 Nguyễn Thị Minh Khai, Trường Sơn, Sầm Sơn
- Giờ mở cửa: 7:00–21:00 hàng ngày
- Hotline: 098.661.7939

VỀ GIANG NGUYEN SEAFOOD:
- Thương hiệu hải sản khô uy tín số 1 Sầm Sơn
- Hơn 10 năm kinh nghiệm chế biến hải sản truyền thống
- 100% hải sản đánh bắt trực tiếp từ biển Sầm Sơn
- Phơi nắng tự nhiên, không sấy công nghiệp, không hóa chất
- Cam kết đổi trả trong 24h nếu không hài lòng
- Free ship đơn từ 500K, giao toàn quốc

7 LÝ DO CHỌN GIANG NGUYEN:
1. Hải sản 100% chính gốc Sầm Sơn
2. Phơi nắng tự nhiên – không hóa chất
3. Đóng gói hút chân không cao cấp
4. Free ship đơn từ 500K
5. Đổi trả trong 24h
6. Hỗ trợ 24/7
7. Giá gốc từ ngư dân

CHÍNH SÁCH:
- Thanh toán: QR chuyển khoản / COD
- Cọc 50% qua QR, nhận hàng thanh toán 50% còn lại

PHONG CÁCH TƯ VẤN:
- Ngắn gọn, thân thiện, chuyên nghiệp
- Luôn hướng tới chốt đơn một cách tự nhiên
- Gợi ý sản phẩm phù hợp với nhu cầu khách
- Tư vấn cách chế biến khi được hỏi
- Cuối tin nhắn tư vấn: "Anh/chị muốn em giữ hàng cho mình không ạ?"
- Trả lời bằng tiếng Việt
- Khi khách hỏi về sản phẩm cụ thể, dùng thông tin từ danh sách sản phẩm được cung cấp`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, productContext } = await req.json();
    if (!messages || !Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: "Messages array required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: "LOVABLE_API_KEY not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const systemContent = SYSTEM_PROMPT + (productContext || '');

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-lite",
        messages: [
          { role: "system", content: systemContent },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Hệ thống đang bận, vui lòng thử lại sau." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Đã hết credits AI." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Lỗi hệ thống AI" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
