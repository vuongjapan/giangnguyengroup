// AI Search & Budget Planner - hiểu ngôn ngữ tự nhiên, gợi ý sản phẩm/combo
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ProductLite {
  id: string;
  name: string;
  slug: string;
  price: number;
  category: string;
  grade: string;
  badges: string[];
  needs: string[];
  unit: string;
  images: string[];
}

interface ComboLite {
  id: string;
  name: string;
  slug: string;
  category: string;
  combo_price: number;
  original_price: number;
  description: string;
  image: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { query, mode = "search", budget } = await req.json();

    if (!query || typeof query !== "string" || query.trim().length === 0) {
      return new Response(JSON.stringify({ error: "Query is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const cleanQuery = query.trim().slice(0, 500);

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY chưa cấu hình");

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    // Load products + combos (lite)
    const [{ data: products }, { data: combos }] = await Promise.all([
      supabase
        .from("products")
        .select("id, name, slug, price, category, grade, badges, needs, unit, images")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("combos")
        .select("id, name, slug, category, combo_price, original_price, description, image")
        .eq("is_active", true)
        .order("sort_order", { ascending: true }),
    ]);

    const productList: ProductLite[] = products || [];
    const comboList: ComboLite[] = combos || [];

    // Build catalog for AI
    const catalog = {
      products: productList.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        category: p.category,
        grade: p.grade,
        needs: p.needs,
        badges: p.badges,
      })),
      combos: comboList.map((c) => ({
        id: c.id,
        name: c.name,
        slug: c.slug,
        price: c.combo_price,
        category: c.category,
        description: c.description?.slice(0, 120),
      })),
    };

    const systemPrompt =
      mode === "budget"
        ? `Bạn là chuyên gia tư vấn quà biếu hải sản khô GIANG NGUYÊN GROUP. Khách cho ngân sách và nhu cầu, bạn lập kế hoạch chi tiêu thông minh: chọn 2-5 sản phẩm/combo phù hợp, tổng tiền không vượt ngân sách, ưu tiên combo nếu có. Trả về danh sách item từ catalog (dùng đúng id) + lý do ngắn gọn + tổng tiền dự kiến.`
        : `Bạn là AI tìm kiếm hải sản khô GIANG NGUYÊN GROUP. Khách hỏi tự nhiên (vd: 'mực ngon nhậu', 'quà biếu 1 triệu', 'đồ gửi Nhật'), bạn chọn 3-6 sản phẩm/combo phù hợp nhất từ catalog (dùng đúng id) + lý do ngắn gọn cho từng món + 1 câu gợi ý tổng.`;

    const userPrompt = `KHÁCH HỎI: "${cleanQuery}"
${budget ? `NGÂN SÁCH: ${budget.toLocaleString("vi-VN")}đ` : ""}

CATALOG (JSON):
${JSON.stringify(catalog, null, 0)}

Hãy chọn các item phù hợp nhất.`;

    const tools = [
      {
        type: "function",
        function: {
          name: "recommend_items",
          description: "Trả về danh sách sản phẩm/combo gợi ý",
          parameters: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description: "Câu tổng quan thân thiện (1-2 câu, tiếng Việt)",
              },
              items: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    id: { type: "string", description: "ID đúng từ catalog" },
                    type: { type: "string", enum: ["product", "combo"] },
                    reason: { type: "string", description: "Lý do gợi ý ngắn gọn (1 câu)" },
                  },
                  required: ["id", "type", "reason"],
                  additionalProperties: false,
                },
              },
              total_estimate: {
                type: "number",
                description: "Tổng tiền dự kiến (VND), chỉ dùng cho budget mode",
              },
            },
            required: ["summary", "items"],
            additionalProperties: false,
          },
        },
      },
    ];

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools,
        tool_choice: { type: "function", function: { name: "recommend_items" } },
      }),
    });

    if (!aiResp.ok) {
      if (aiResp.status === 429) {
        return new Response(
          JSON.stringify({ error: "AI đang quá tải, vui lòng thử lại sau ít phút." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiResp.status === 402) {
        return new Response(
          JSON.stringify({ error: "Hết credit AI, vui lòng nạp thêm." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      const errText = await aiResp.text();
      console.error("AI gateway error:", aiResp.status, errText);
      throw new Error("AI gateway error");
    }

    const aiData = await aiResp.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("AI không trả về kết quả");

    const result = JSON.parse(toolCall.function.arguments);

    // Map lại để có full info từ DB
    const productMap = new Map(productList.map((p) => [p.id, p]));
    const comboMap = new Map(comboList.map((c) => [c.id, c]));

    const enrichedItems = (result.items || [])
      .map((it: { id: string; type: string; reason: string }) => {
        if (it.type === "product") {
          const p = productMap.get(it.id);
          if (!p) return null;
          return {
            type: "product",
            id: p.id,
            name: p.name,
            slug: p.slug,
            price: p.price,
            unit: p.unit,
            image: p.images?.[0] || "",
            reason: it.reason,
          };
        } else {
          const c = comboMap.get(it.id);
          if (!c) return null;
          return {
            type: "combo",
            id: c.id,
            name: c.name,
            slug: c.slug,
            price: c.combo_price,
            original_price: c.original_price,
            image: c.image,
            reason: it.reason,
          };
        }
      })
      .filter(Boolean);

    // Log search
    await supabase.from("ai_logs").insert({
      session_id: req.headers.get("x-session-id") || "anon",
      event_type: "ai_search",
      payload: {
        query: cleanQuery,
        mode,
        budget,
        result_count: enrichedItems.length,
      },
    });

    return new Response(
      JSON.stringify({
        summary: result.summary,
        items: enrichedItems,
        total_estimate: result.total_estimate || enrichedItems.reduce((s: number, i: any) => s + (i.price || 0), 0),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("ai-search error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Lỗi không xác định" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
