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

async function generateOne(keyword: string, LOVABLE_API_KEY: string, supabase: any) {
  const slug = slugify(keyword);
  // Check cache first - never re-generate same slug
  const { data: existing } = await supabase.from("seo_landing_pages").select("id, slug").eq("slug", slug).maybeSingle();
  if (existing) return { slug, status: "exists" };

  const sysPrompt = `Bạn là chuyên gia SEO ngành hải sản khô Việt Nam. Viết landing page SEO chuẩn Google cho thương hiệu Giang Nguyên Group (Sầm Sơn, Thanh Hóa). Trả JSON đúng schema.`;
  const userPrompt = `Tạo landing page SEO cho từ khóa: "${keyword}".
Thương hiệu: Giang Nguyên Group – hải sản khô Sầm Sơn, đặc sản Thanh Hóa, ship toàn quốc.
Yêu cầu:
- title: 50-60 ký tự, có từ khóa
- meta_description: 140-160 ký tự, có CTA
- h1: tiêu đề lớn, khác title
- intro: 2-3 câu lôi cuốn
- content_html: 600-900 từ HTML (h2, h3, p, ul, strong), 4-6 section: lý do chọn, cách phân biệt thật/giả, cách dùng/bảo quản, gợi ý mua, ship/giao hàng. Dùng từ khóa tự nhiên 5-8 lần.
- faq: 4-6 câu hỏi-đáp`;

  const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [{ role: "system", content: sysPrompt }, { role: "user", content: userPrompt }],
      tools: [{
        type: "function",
        function: {
          name: "create_landing",
          parameters: {
            type: "object",
            properties: {
              title: { type: "string" },
              meta_description: { type: "string" },
              h1: { type: "string" },
              intro: { type: "string" },
              content_html: { type: "string" },
              faq: { type: "array", items: { type: "object", properties: { q: { type: "string" }, a: { type: "string" } }, required: ["q", "a"] } },
            },
            required: ["title", "meta_description", "h1", "intro", "content_html", "faq"],
          },
        },
      }],
      tool_choice: { type: "function", function: { name: "create_landing" } },
    }),
  });

  if (aiResp.status === 429) throw new Error("rate_limited");
  if (aiResp.status === 402) throw new Error("credits_exhausted");
  if (!aiResp.ok) throw new Error("ai_error_" + aiResp.status);

  const aiJson = await aiResp.json();
  const toolCall = aiJson.choices?.[0]?.message?.tool_calls?.[0];
  if (!toolCall) throw new Error("no_tool_call");
  const generated = JSON.parse(toolCall.function.arguments);

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

  const { error } = await supabase.from("seo_landing_pages").insert({
    slug, keyword,
    title: generated.title,
    meta_description: generated.meta_description,
    h1: generated.h1,
    intro: generated.intro,
    content_html: generated.content_html,
    faq: generated.faq || [],
    json_ld,
    status: "draft",
  });
  if (error) throw error;
  return { slug, status: "created" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify admin
    const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    const { data: roleRow } = await supabase.from("user_roles").select("role").eq("user_id", user.id).eq("role", "admin").maybeSingle();
    if (!roleRow) return new Response(JSON.stringify({ error: "Admin only" }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Check AI module enabled (cost gate)
    const { data: modSetting } = await supabase.from("ai_module_settings").select("enabled").eq("module_key", "seo_landing").maybeSingle();
    if (!modSetting?.enabled) {
      return new Response(JSON.stringify({ error: "Module SEO AI đang tắt. Vui lòng bật trong AI & Tăng Trưởng." }), { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { keywords } = await req.json();
    if (!Array.isArray(keywords) || keywords.length === 0) {
      return new Response(JSON.stringify({ error: "keywords array required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (keywords.length > 15) {
      return new Response(JSON.stringify({ error: "Tối đa 15 keyword/lượt" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const results: any[] = [];
    for (const kw of keywords) {
      if (typeof kw !== "string" || !kw.trim()) continue;
      try {
        const r = await generateOne(kw.trim(), Deno.env.get("LOVABLE_API_KEY")!, supabase);
        results.push({ keyword: kw, ...r });
      } catch (e) {
        const msg = e instanceof Error ? e.message : "error";
        results.push({ keyword: kw, status: "error", error: msg });
        if (msg === "rate_limited" || msg === "credits_exhausted") break;
      }
      // small delay to avoid rate limit
      await new Promise(r => setTimeout(r, 800));
    }

    return new Response(JSON.stringify({ results, total: results.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("seo-landing-batch:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
