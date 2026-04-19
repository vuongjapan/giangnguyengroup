import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cron-triggered: scan carts older than 1h, not yet reminded → create voucher + send email + mark reminded
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    const { data: carts, error } = await supabase
      .from("abandoned_carts")
      .select("*")
      .eq("recovered", false)
      .is("reminder_sent_at", null)
      .neq("customer_email", "")
      .lt("created_at", oneHourAgo)
      .gt("created_at", dayAgo)
      .gt("total_value", 100000)
      .limit(50);

    if (error) throw error;

    let processed = 0;
    const SMTP_EMAIL = Deno.env.get("SMTP_EMAIL");
    const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");

    for (const cart of carts || []) {
      try {
        // Generate voucher
        const code = "QUAYLAI" + Math.random().toString(36).substring(2, 7).toUpperCase();
        await supabase.from("coupons").insert({
          code,
          discount_percent: 10,
          max_uses: 1,
          min_order: Math.max(200000, Math.floor(cart.total_value * 0.5)),
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          is_active: true,
        });

        const recoveryUrl = `https://giangnguyengroup.lovable.app/checkout?recover=${cart.recovery_token}&voucher=${code}`;
        const items = (cart.cart_data as any[]).slice(0, 3).map((i: any) => `<li>${i.name} x${i.quantity}</li>`).join("");

        const html = `
          <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
            <h2 style="color:#0066b3">Bạn quên giỏ hàng tại Giang Nguyên Group!</h2>
            <p>Xin chào ${cart.customer_name || "quý khách"},</p>
            <p>Giỏ hàng ${cart.total_value.toLocaleString("vi-VN")}₫ của bạn vẫn đang chờ:</p>
            <ul>${items}</ul>
            <div style="background:#fef3c7;padding:16px;border-radius:8px;margin:20px 0">
              <p style="margin:0;font-size:18px"><strong>🎁 Mã giảm 10%: ${code}</strong></p>
              <p style="margin:4px 0 0;font-size:13px">Áp dụng đơn từ ${Math.max(200000, Math.floor(cart.total_value * 0.5)).toLocaleString("vi-VN")}₫. Hết hạn sau 7 ngày.</p>
            </div>
            <p><a href="${recoveryUrl}" style="background:#0066b3;color:#fff;padding:12px 24px;border-radius:6px;text-decoration:none;display:inline-block">Hoàn tất đơn hàng ngay</a></p>
            <p style="color:#666;font-size:12px;margin-top:30px">Giang Nguyên Group – Hải sản khô Sầm Sơn cao cấp</p>
          </div>
        `;

        // Send via SMTP (basic, using denomailer)
        if (SMTP_EMAIL && SMTP_PASSWORD) {
          try {
            const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
            const client = new SMTPClient({
              connection: {
                hostname: "smtp.gmail.com",
                port: 465,
                tls: true,
                auth: { username: SMTP_EMAIL, password: SMTP_PASSWORD },
              },
            });
            await client.send({
              from: SMTP_EMAIL,
              to: cart.customer_email,
              subject: `🛒 Giỏ hàng ${cart.total_value.toLocaleString("vi-VN")}₫ đang chờ – Tặng mã giảm 10%`,
              html,
              content: "Hoàn tất đơn hàng tại " + recoveryUrl,
            });
            await client.close();
          } catch (mailErr) {
            console.error("Email send fail:", mailErr);
          }
        }

        await supabase
          .from("abandoned_carts")
          .update({ reminder_sent_at: new Date().toISOString(), voucher_code: code })
          .eq("id", cart.id);

        processed++;
      } catch (innerErr) {
        console.error("Cart process fail", cart.id, innerErr);
      }
    }

    return new Response(JSON.stringify({ processed, total: carts?.length || 0 }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recovery error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
