// Dynamic sitemap.xml generated from database
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const SITE_URL = "https://giangnguyengroup.lovable.app";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SitemapEntry {
  loc: string;
  lastmod?: string;
  changefreq?: string;
  priority?: number;
}

const STATIC_URLS: SitemapEntry[] = [
  { loc: "/", changefreq: "daily", priority: 1.0 },
  { loc: "/san-pham", changefreq: "daily", priority: 0.9 },
  { loc: "/combo", changefreq: "weekly", priority: 0.9 },
  { loc: "/khuyen-mai", changefreq: "daily", priority: 0.8 },
  { loc: "/mon-ngon", changefreq: "weekly", priority: 0.7 },
  { loc: "/tin-tuc", changefreq: "weekly", priority: 0.7 },
  { loc: "/blog", changefreq: "weekly", priority: 0.7 },
  { loc: "/gioi-thieu", changefreq: "monthly", priority: 0.6 },
  { loc: "/he-thong-cua-hang", changefreq: "monthly", priority: 0.6 },
  { loc: "/chinh-sach", changefreq: "monthly", priority: 0.5 },
  { loc: "/khach-san", changefreq: "weekly", priority: 0.6 },
];

function escapeXml(s: string): string {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]!));
}

function entryToXml(e: SitemapEntry): string {
  let xml = `  <url><loc>${escapeXml(SITE_URL + e.loc)}</loc>`;
  if (e.lastmod) xml += `<lastmod>${e.lastmod.split("T")[0]}</lastmod>`;
  if (e.changefreq) xml += `<changefreq>${e.changefreq}</changefreq>`;
  if (e.priority !== undefined) xml += `<priority>${e.priority.toFixed(1)}</priority>`;
  xml += `</url>`;
  return xml;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const [productsRes, combosRes, hotelsRes] = await Promise.all([
      supabase.from("products").select("slug, updated_at").eq("is_active", true),
      supabase.from("combos").select("slug, updated_at").eq("is_active", true),
      supabase.from("hotels").select("slug, updated_at").eq("is_active", true),
    ]);

    const entries: SitemapEntry[] = [...STATIC_URLS];

    (productsRes.data || []).forEach((p: any) => {
      entries.push({ loc: `/product/${p.slug}`, lastmod: p.updated_at, changefreq: "weekly", priority: 0.8 });
    });
    (combosRes.data || []).forEach((c: any) => {
      entries.push({ loc: `/combo/${c.slug}`, lastmod: c.updated_at, changefreq: "weekly", priority: 0.7 });
    });
    (hotelsRes.data || []).forEach((h: any) => {
      entries.push({ loc: `/khach-san/${h.slug}`, lastmod: h.updated_at, changefreq: "monthly", priority: 0.5 });
    });

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map(entryToXml).join("\n")}
</urlset>`;

    return new Response(xml, {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/xml; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (e) {
    console.error("sitemap error:", e);
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`, {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/xml" },
    });
  }
});
