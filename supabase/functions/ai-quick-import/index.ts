import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function slugify(s: string): string {
  return s.toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim().replace(/\s+/g, "-").substring(0, 80);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const { raw_list } = await req.json();
    if (!raw_list || typeof raw_list !== "string") {
      return new Response(JSON.stringify({ error: "raw_list required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const lines = raw_list.split("\n").map((l: string) => l.trim()).filter((l: string) => l.length > 3).slice(0, 25);
    if (lines.length === 0) {
      return new Response(JSON.stringify({ error: "No valid lines" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Verify admin
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: auth } },
    });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: corsHeaders });

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: roleCheck } = await admin.from("user_roles").select("role").eq("user_id", userData.user.id).eq("role", "admin").maybeSingle();
    if (!roleCheck) return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: corsHeaders });

    const sysPrompt = `Bạn là chuyên gia ngành hải sản khô Việt Nam. Chuẩn hóa danh sách sản phẩm thô thành dữ liệu sản phẩm chuẩn cho website Giang Nguyên Group.
Phân loại category vào MỘT trong: "Mực khô", "Tôm khô", "Cá khô", "Hải sản 1 nắng", "Ăn liền", "Combo quà biếu".
Với mỗi sản phẩm thiếu thông tin chắc chắn (giá, trọng lượng), đặt status="needs_review".`;

    const userPrompt = `Chuẩn hóa ${lines.length} sản phẩm sau:\n${lines.map((l: string, i: number) => `${i + 1}. ${l}`).join("\n")}`;

    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: sysPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [{
          type: "function",
          function: {
            name: "import_products",
            parameters: {
              type: "object",
              properties: {
                products: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      name: { type: "string", description: "Tên chuẩn hóa, viết hoa đầu" },
                      category: { type: "string", enum: ["Mực khô", "Tôm khô", "Cá khô", "Hải sản 1 nắng", "Ăn liền", "Combo quà biếu"] },
                      price: { type: "number", description: "Giá VNĐ, ước lượng theo trọng lượng nếu không rõ" },
                      unit: { type: "string", description: "kg, 500g, 300g, hộp..." },
                      short_description: { type: "string" },
                      meta_seo: { type: "string", description: "Meta description 140-160 ký tự" },
                      tags: { type: "array", items: { type: "string" } },
                      grade: { type: "string", enum: ["Cao cấp", "Phổ thông", "Quà biếu"] },
                      needs_review: { type: "boolean" },
                    },
                    required: ["name", "category", "price", "unit", "short_description", "meta_seo", "tags", "grade", "needs_review"],
                  },
                },
              },
              required: ["products"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "import_products" } },
      }),
    });

    if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: corsHeaders });
    if (aiResp.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: corsHeaders });
    if (!aiResp.ok) throw new Error("AI error " + aiResp.status);

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call");
    const { products } = JSON.parse(toolCall.function.arguments);

    const inserts = products.map((p: any) => ({
      name: p.name,
      slug: slugify(p.name) + "-" + Math.random().toString(36).substring(2, 6),
      category: p.category,
      price: p.price,
      unit: p.unit,
      grade: p.grade,
      badges: p.tags || [],
      needs: p.tags || [],
      description: { short: p.short_description, meta: p.meta_seo },
      images: [],
      stock: 50,
      rating: 5,
      sort_order: 0,
      is_active: !p.needs_review,
      status: p.needs_review ? "needs_review" : "active",
    }));

    const { data: created, error: insErr } = await admin.from("products").insert(inserts).select("id, name, status");
    if (insErr) throw insErr;

    return new Response(JSON.stringify({ created: created?.length || 0, products: created }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("ai-quick-import error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
