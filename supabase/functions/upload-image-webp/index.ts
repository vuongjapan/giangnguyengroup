// Convert uploaded image to WebP and store in Supabase Storage
// Falls back to original format if conversion fails
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { ImageMagick, initializeImageMagick, MagickFormat } from "https://deno.land/x/imagemagick_deno@0.0.26/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

let magickInit = false;
async function ensureMagick() {
  if (!magickInit) {
    await initializeImageMagick();
    magickInit = true;
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify caller is admin
    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await userClient.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: roleRow } = await userClient
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin")
      .maybeSingle();
    if (!roleRow) {
      return new Response(JSON.stringify({ error: "Admin access required" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const form = await req.formData();
    const file = form.get("file") as File | null;
    const bucket = (form.get("bucket") as string | null) || "product-images";
    const folder = (form.get("folder") as string | null) || "";
    const quality = parseInt((form.get("quality") as string | null) || "82", 10);
    const maxWidth = parseInt((form.get("maxWidth") as string | null) || "1600", 10);

    if (!file) {
      return new Response(JSON.stringify({ error: "Missing file" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (file.size > 15 * 1024 * 1024) {
      return new Response(JSON.stringify({ error: "File too large (max 15MB)" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(supabaseUrl, supabaseServiceKey);
    const buf = new Uint8Array(await file.arrayBuffer());
    const originalExt = (file.name.split(".").pop() || "jpg").toLowerCase();
    const baseName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    let webpBytes: Uint8Array | null = null;
    try {
      await ensureMagick();
      await new Promise<void>((resolve) => {
        ImageMagick.read(buf, (img) => {
          // Resize if too wide
          if (img.width > maxWidth) {
            const ratio = maxWidth / img.width;
            img.resize(maxWidth, Math.round(img.height * ratio));
          }
          img.quality = quality;
          img.write(MagickFormat.Webp, (data) => {
            webpBytes = new Uint8Array(data);
            resolve();
          });
        });
      });
    } catch (e) {
      console.error("WebP conversion failed, falling back:", e);
    }

    const results: { url: string; format: string; path: string }[] = [];

    // Upload WebP if conversion succeeded
    if (webpBytes) {
      const webpPath = `${folder ? folder + "/" : ""}${baseName}.webp`;
      const { error: webpErr } = await admin.storage
        .from(bucket)
        .upload(webpPath, webpBytes, { contentType: "image/webp", cacheControl: "31536000", upsert: false });
      if (!webpErr) {
        const { data: webpUrl } = admin.storage.from(bucket).getPublicUrl(webpPath);
        results.push({ url: webpUrl.publicUrl, format: "webp", path: webpPath });
      } else {
        console.error("WebP upload error:", webpErr);
      }
    }

    // Always upload original as fallback
    const origPath = `${folder ? folder + "/" : ""}${baseName}.${originalExt}`;
    const { error: origErr } = await admin.storage
      .from(bucket)
      .upload(origPath, buf, { contentType: file.type || "image/jpeg", cacheControl: "31536000", upsert: false });
    if (origErr) {
      console.error("Original upload error:", origErr);
      if (results.length === 0) {
        return new Response(JSON.stringify({ error: "Upload failed: " + origErr.message }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    } else {
      const { data: origUrl } = admin.storage.from(bucket).getPublicUrl(origPath);
      results.push({ url: origUrl.publicUrl, format: originalExt, path: origPath });
    }

    return new Response(
      JSON.stringify({
        success: true,
        primary: results[0]?.url,
        fallback: results[1]?.url || null,
        files: results,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("upload-image-webp error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
