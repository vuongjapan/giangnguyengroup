import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Bạn là nhân viên tư vấn bán hàng của GIANG NGUYEN SEAFOOD – chuyên hải sản khô đặc sản Sầm Sơn, Thanh Hóa.

THÔNG TIN CỬA HÀNG:
- Cửa hàng 1: Quầy 7A7B – Chợ Cột Đỏ, Sầm Sơn
- Cửa hàng 2: LK29 – FLC Sầm Sơn
- Cửa hàng 3: 50 Nguyễn Thị Minh Khai, Trường Sơn, Sầm Sơn
- Giờ mở cửa: 7:00–21:00 hàng ngày
- Hotline: 0123.456.789

SẢN PHẨM & GIÁ:
1. Mực Khô Loại 1: 1.450.000₫/kg – Loại cao cấp, thịt dày, phơi 3 nắng
2. Mực Khô Loại 2: 1.250.000₫/kg – Chất lượng tốt, giá hợp lý
3. Mực 1 Nắng: 450.000₫/kg – Mềm ngọt, nướng trực tiếp
4. Mực Trứng Sầm Sơn: 500.000₫/kg – Đặc sản hiếm, trứng béo ngậy
5. Cá Thu 1 Nắng: 380.000₫/kg – Thịt chắc, chiên vàng giòn
6. Cá Chỉ Vàng Khô: 280.000₫/kg – Nhắm bia tuyệt vời
7. Nem Chua Thanh Hóa: 5.000₫/cái – Chua ngọt, dai giòn

COMBO QUÀ BIẾU:
- Combo VIP: Mực khô L1 + Mực trứng – Hộp sang trọng
- Combo Gia đình: Cá thu + Nem chua – Giá tiết kiệm
- Combo Du lịch: 3 loại hải sản mini – Gọn nhẹ

CHÍNH SÁCH:
- Free ship đơn từ 500K
- Đổi trả trong 24h
- Thanh toán: QR/COD
- Cam kết 100% hải sản sạch, không hóa chất

PHONG CÁCH TRẢ LỜI:
- Ngắn gọn, thân thiện miền Bắc, tự nhiên như người bán thật
- Luôn hướng chốt đơn
- Gợi ý combo khi phù hợp
- Cuối mỗi tin nhắn tư vấn sản phẩm: "Anh/chị muốn em giữ hàng cho mình không ạ?"
- Có thể hỗ trợ thêm: thời tiết, lịch ngày, thông tin cơ bản
- Trả lời bằng tiếng Việt`;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages } = await req.json();
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

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Hệ thống đang bận, vui lòng thử lại sau." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Đã hết credits AI, vui lòng liên hệ quản trị." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "Lỗi hệ thống AI" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
