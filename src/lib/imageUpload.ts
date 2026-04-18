import { supabase } from '@/integrations/supabase/client';

export interface UploadResult {
  primary: string; // WebP URL preferred
  fallback: string | null;
}

/**
 * Upload image via the upload-image-webp edge function.
 * Returns WebP URL as primary and original (jpg/png) as fallback.
 * Requires admin access (server-side validated).
 */
export async function uploadImageWebP(
  file: File,
  opts: { bucket?: string; folder?: string; quality?: number; maxWidth?: number } = {}
): Promise<UploadResult> {
  const { bucket = 'product-images', folder = '', quality = 82, maxWidth = 1600 } = opts;
  const form = new FormData();
  form.append('file', file);
  form.append('bucket', bucket);
  form.append('folder', folder);
  form.append('quality', String(quality));
  form.append('maxWidth', String(maxWidth));

  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error('Bạn cần đăng nhập admin');

  const url = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/upload-image-webp`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  const json = await res.json();
  if (!res.ok || !json?.success) {
    throw new Error(json?.error || 'Upload failed');
  }
  return { primary: json.primary, fallback: json.fallback };
}

/**
 * Direct upload fallback (no edge function): uploads original to bucket
 * and returns Supabase Image Transformation WebP URL.
 * Works for non-admin contexts where bucket allows public uploads.
 */
export async function uploadDirectWithTransform(
  file: File,
  opts: { bucket?: string; folder?: string; width?: number; quality?: number } = {}
): Promise<UploadResult> {
  const { bucket = 'product-images', folder = '', width = 800, quality = 82 } = opts;
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${folder ? folder + '/' : ''}${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { contentType: file.type, cacheControl: '31536000', upsert: false });
  if (error) throw error;
  const { data: orig } = supabase.storage.from(bucket).getPublicUrl(path);
  const { data: webp } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: { width, quality, format: 'origin' as any },
  });
  return { primary: webp.publicUrl, fallback: orig.publicUrl };
}

/**
 * Build a Supabase Storage transformation URL for an existing image path.
 * Use this for legacy images already in the bucket.
 */
export function getOptimizedUrl(
  bucket: string,
  path: string,
  opts: { width?: number; quality?: number } = {}
): string {
  const { width = 800, quality = 82 } = opts;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path, {
    transform: { width, quality },
  });
  return data.publicUrl;
}
