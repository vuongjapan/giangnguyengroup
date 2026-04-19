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
    const { keyword, related_product_ids } = await req.json();
    if (!keyword || typeof keyword !== "string") {
      return new Response(JSON.stringify({ error: "keyword required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch related products for context
    let productContext = "";
    if (Array.isArray(related_product_ids) && related_product_ids.length > 0) {
      const { data: prods } = await supabase
        .from("products")
        .select("name, price, unit, category")
        .in("id", related_product_ids);
      if (prods) productContext = prods.map((p: any) => `${p.name} (${p.category}, ${p.price.toLocaleString("vi-VN")}đ/${p.unit})`).join("; ");
    }

    const sysPrompt = `Bạn là chuyên gia SEO ngành hải sản khô Việt Nam, viết landing page SEO chuẩn Google cho thương hiệu Giang Nguyên Group (Sầm Sơn, Thanh Hóa). Trả về JSON đúng schema.`;

    const userPrompt = `Tạo landing page SEO cho từ khóa: "${keyword}".
Thương hiệu: Giang Nguyên Group – Hải sản khô Sầm Sơn, đặc sản Thanh Hóa.
${productContext ? `Sản phẩm liên quan: ${productContext}` : ""}

Yêu cầu:
- title: 50-60 ký tự, có từ khóa, hấp dẫn
- meta_description: 140-160 ký tự, có CTA
- h1: tiêu đề lớn, khác title
- intro: 2-3 câu mở bài lôi cuốn
- content_html: 600-1000 từ HTML (h2, h3, p, ul, strong), có 4-6 section: lý do chọn, cách phân biệt, cách dùng/bảo quản, gợi ý mua, ship/giao hàng. Dùng từ khóa tự nhiên 5-8 lần.
- faq: 4-6 câu hỏi - đáp thường gặp
- json_ld: schema.org Article hoặc Product schema phù hợp`;

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
            name: "create_landing",
            description: "Generate SEO landing page",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                meta_description: { type: "string" },
                h1: { type: "string" },
                intro: { type: "string" },
                content_html: { type: "string" },
                faq: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { q: { type: "string" }, a: { type: "string" } },
                    required: ["q", "a"],
                  },
                },
              },
              required: ["title", "meta_description", "h1", "intro", "content_html", "faq"],
            },
          },
        }],
        tool_choice: { type: "function", function: { name: "create_landing" } },
      }),
    });

    if (aiResp.status === 429) {
      return new Response(JSON.stringify({ error: "AI rate limited, try later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (aiResp.status === 402) {
      return new Response(JSON.stringify({ error: "AI credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!aiResp.ok) throw new Error("AI gateway error " + aiResp.status);

    const aiJson = await aiResp.json();
    const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call returned");
    const generated = JSON.parse(toolCall.function.arguments);

    const slug = slugify(keyword);
    const json_ld = {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: generated.title,
      description: generated.meta_description,
      author: { "@type": "Organization", name: "Giang Nguyên Group" },
      publisher: { "@type": "Organization", name: "Giang Nguyên Group", url: "https://giangnguyengroup.lovable.app" },
      datePublished: new Date().toISOString(),
      mainEntityOfPage: `https://giangnguyengroup.lovable.app/lp/${slug}`,
    };

    const { data: inserted, error: insErr } = await supabase
      .from("seo_landing_pages")
      .insert({
        slug,
        keyword,
        title: generated.title,
        meta_description: generated.meta_description,
        h1: generated.h1,
        intro: generated.intro,
        content_html: generated.content_html,
        faq: generated.faq || [],
        json_ld,
        related_product_ids: related_product_ids || [],
        status: "draft",
      })
      .select()
      .single();

    if (insErr) throw insErr;

    return new Response(JSON.stringify({ landing: inserted }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seo-landing-generate error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
