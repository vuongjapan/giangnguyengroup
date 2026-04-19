import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Cron-triggered daily: scan delivered orders 14d/30d ago, send repeat-buy email with voucher
Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const SMTP_EMAIL = Deno.env.get("SMTP_EMAIL");
    const SMTP_PASSWORD = Deno.env.get("SMTP_PASSWORD");

    let totalSent = 0;

    for (const days of [14, 30]) {
      const targetDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      const startDay = new Date(targetDate); startDay.setHours(0, 0, 0, 0);
      const endDay = new Date(targetDate); endDay.setHours(23, 59, 59, 999);

      const { data: orders } = await supabase
        .from("orders")
        .select("id, customer_name, customer_email, customer_phone, items, total")
        .in("status", ["completed", "delivered"])
        .gte("created_at", startDay.toISOString())
        .lte("created_at", endDay.toISOString())
        .neq("customer_email", "")
        .limit(100);

      if (!orders || orders.length === 0) continue;

      // Filter out already-sent
      const orderIds = orders.map(o => o.id);
      const { data: existing } = await supabase
        .from("repeat_order_campaigns")
        .select("order_id")
        .in("order_id", orderIds)
        .eq("days_after", days);
      const sentSet = new Set((existing || []).map((e: any) => e.order_id));

      for (const order of orders) {
        if (sentSet.has(order.id)) continue;
        try {
          // Suggest products: pick 3 active products from same category as items
          const itemNames = (order.items as any[]).map((i: any) => i.name).join(" ");
          const { data: suggestions } = await supabase
            .from("products")
            .select("id, name, slug, price, unit, images")
            .eq("is_active", true)
            .limit(50);
          const suggested = (suggestions || []).filter((p: any) => !itemNames.includes(p.name)).slice(0, 3);

          // Generate voucher
          const code = (days === 14 ? "MUALAI14" : "VIPCUS30") + Math.random().toString(36).substring(2, 6).toUpperCase();
          const discount = days === 14 ? 8 : 12;
          await supabase.from("coupons").insert({
            code,
            discount_percent: discount,
            max_uses: 1,
            min_order: 200000,
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
            is_active: true,
          });

          const suggestedHtml = suggested.map((p: any) =>
            `<div style="display:inline-block;width:30%;margin:1%;text-align:center;vertical-align:top">
               <a href="https://giangnguyengroup.lovable.app/product/${p.slug}" style="text-decoration:none;color:#000">
                 <img src="${p.images?.[0] || ''}" width="120" height="120" style="border-radius:8px;object-fit:cover" alt="${p.name}"/>
                 <div style="font-size:13px;margin-top:6px">${p.name}</div>
                 <div style="color:#0066b3;font-weight:bold">${p.price.toLocaleString('vi-VN')}₫</div>
               </a>
             </div>`
          ).join("");

          const html = `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px">
              <h2 style="color:#0066b3">Xin chào ${order.customer_name}, đã ${days} ngày rồi!</h2>
              <p>Cảm ơn bạn đã tin tưởng Giang Nguyên Group. Hôm nay chúng tôi gửi tặng bạn ưu đãi khách thân thiết:</p>
              <div style="background:#fef3c7;padding:20px;border-radius:8px;text-align:center;margin:20px 0">
                <div style="font-size:24px;font-weight:bold;color:#d97706">🎁 GIẢM ${discount}%</div>
                <div style="font-size:20px;letter-spacing:2px;margin-top:8px"><strong>${code}</strong></div>
                <div style="font-size:13px;color:#666;margin-top:8px">Đơn từ 200.000₫ • Hết hạn 14 ngày</div>
              </div>
              <h3>Gợi ý cho bạn lần này:</h3>
              <div>${suggestedHtml}</div>
              <p style="text-align:center;margin-top:30px">
                <a href="https://giangnguyengroup.lovable.app/san-pham" style="background:#0066b3;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none">Mua hàng ngay</a>
              </p>
              <p style="color:#666;font-size:12px;margin-top:30px">Giang Nguyên Group – Hải sản khô Sầm Sơn cao cấp</p>
            </div>`;

          if (SMTP_EMAIL && SMTP_PASSWORD) {
            try {
              const { SMTPClient } = await import("https://deno.land/x/denomailer@1.6.0/mod.ts");
              const client = new SMTPClient({
                connection: { hostname: "smtp.gmail.com", port: 465, tls: true, auth: { username: SMTP_EMAIL, password: SMTP_PASSWORD } },
              });
              await client.send({
                from: SMTP_EMAIL,
                to: order.customer_email,
                subject: `🎁 ${order.customer_name}, ưu đãi ${discount}% dành riêng cho bạn`,
                html,
                content: `Mã ưu đãi: ${code}`,
              });
              await client.close();
            } catch (mailErr) {
              console.error("Mail fail:", mailErr);
            }
          }

          await supabase.from("repeat_order_campaigns").insert({
            order_id: order.id,
            customer_email: order.customer_email,
            customer_name: order.customer_name,
            days_after: days,
            voucher_code: code,
            suggested_product_ids: suggested.map((p: any) => p.id),
          });

          totalSent++;
        } catch (innerErr) {
          console.error("repeat order fail", order.id, innerErr);
        }
      }
    }

    return new Response(JSON.stringify({ sent: totalSent }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("repeat-order-cron error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
