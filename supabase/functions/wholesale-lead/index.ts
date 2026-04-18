// Wholesale lead intake + auto lead scoring
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple lead scoring rules
function scoreLead(input: {
  shop_name: string;
  contact_name: string;
  phone: string;
  email: string;
  region: string;
  products_interest: string;
  expected_volume: string;
  note: string;
}): number {
  let score = 0;

  // Phone valid (10-11 digits)
  if (/^0\d{9,10}$/.test(input.phone.replace(/\s/g, ""))) score += 25;

  // Has email
  if (input.email && /\S+@\S+\.\S+/.test(input.email)) score += 10;

  // Shop name detailed
  if (input.shop_name.length >= 6) score += 15;

  // Volume signals
  const v = input.expected_volume.toLowerCase();
  if (v.includes("100") || v.includes("tấn") || v.includes("trên")) score += 25;
  else if (v.includes("50") || v.includes("kg")) score += 15;
  else if (v.length > 0) score += 5;

  // Region specified
  if (input.region.length >= 3) score += 10;

  // Products interest specified
  if (input.products_interest.length >= 6) score += 10;

  // Note length (intent signal)
  if (input.note.length >= 20) score += 5;

  return Math.min(100, score);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();

    // Validation
    const shop_name = String(body.shop_name || "").trim().slice(0, 200);
    const contact_name = String(body.contact_name || "").trim().slice(0, 100);
    const phone = String(body.phone || "").trim().slice(0, 20);
    const email = String(body.email || "").trim().slice(0, 200);
    const region = String(body.region || "").trim().slice(0, 200);
    const products_interest = String(body.products_interest || "").trim().slice(0, 500);
    const expected_volume = String(body.expected_volume || "").trim().slice(0, 100);
    const note = String(body.note || "").trim().slice(0, 1000);
    const source = String(body.source || "website").trim().slice(0, 50);

    if (!shop_name || !contact_name || !phone) {
      return new Response(
        JSON.stringify({ error: "Vui lòng nhập đủ tên cửa hàng, tên liên hệ và SĐT" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!/^0\d{8,11}$/.test(phone.replace(/\s/g, ""))) {
      return new Response(
        JSON.stringify({ error: "Số điện thoại không hợp lệ" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const lead_score = scoreLead({
      shop_name,
      contact_name,
      phone,
      email,
      region,
      products_interest,
      expected_volume,
      note,
    });

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const { data, error } = await supabase
      .from("wholesale_leads")
      .insert({
        shop_name,
        contact_name,
        phone,
        email,
        region,
        products_interest,
        expected_volume,
        note,
        source,
        lead_score,
        status: lead_score >= 60 ? "hot" : lead_score >= 30 ? "warm" : "new",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        id: data.id,
        lead_score,
        message:
          lead_score >= 60
            ? "Cảm ơn bạn! Chúng tôi sẽ liên hệ trong 1-2 giờ."
            : "Cảm ơn bạn! Chúng tôi sẽ liên hệ trong 24h.",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("wholesale-lead error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Lỗi không xác định" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
