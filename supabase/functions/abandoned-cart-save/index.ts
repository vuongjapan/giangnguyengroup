import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { recovery_token, cart_data, customer_email, customer_phone, customer_name, total_value, user_id } = await req.json();

    if (!Array.isArray(cart_data) || cart_data.length === 0) {
      return new Response(JSON.stringify({ error: "Cart empty" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (recovery_token) {
      // Update existing
      const { data, error } = await supabase
        .from("abandoned_carts")
        .update({
          cart_data,
          customer_email: customer_email || "",
          customer_phone: customer_phone || "",
          customer_name: customer_name || "",
          total_value: total_value || 0,
          user_id: user_id || null,
        })
        .eq("recovery_token", recovery_token)
        .eq("recovered", false)
        .select("recovery_token")
        .maybeSingle();

      if (!error && data) {
        return new Response(JSON.stringify({ recovery_token: data.recovery_token }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // Insert new
    const { data, error } = await supabase
      .from("abandoned_carts")
      .insert({
        cart_data,
        customer_email: customer_email || "",
        customer_phone: customer_phone || "",
        customer_name: customer_name || "",
        total_value: total_value || 0,
        user_id: user_id || null,
      })
      .select("recovery_token")
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ recovery_token: data.recovery_token }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("abandoned-cart-save error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
