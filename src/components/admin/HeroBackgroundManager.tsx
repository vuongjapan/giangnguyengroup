import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, Upload, Image as ImageIcon, Film, Trash2, Crop } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImageWebP } from '@/lib/imageUpload';

type Ratio = '16:9' | '4:3' | '1:1' | 'auto';
type HeroBg = {
  type: 'image' | 'video';
  url: string;
  poster?: string;
  fallback?: string;     // image shown if video fails
  aspectRatio?: Ratio;   // ratio used to crop the bg image
};

const DEFAULT: HeroBg = {
  type: 'image',
  url: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1920',
  aspectRatio: '16:9',
};

const RATIO_MAP: Record<Exclude<Ratio, 'auto'>, number> = {
  '16:9': 16 / 9,
  '4:3': 4 / 3,
  '1:1': 1,
};

// Center-crop a File to the given aspect ratio. Returns a new File (PNG).
async function cropFileToRatio(file: File, ratio: Ratio): Promise<File> {
  if (ratio === 'auto') return file;
  const r = RATIO_MAP[ratio];
  const img = new Image();
  const url = URL.createObjectURL(file);
  await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = rej; img.src = url; });
  const srcR = img.width / img.height;
  let sx = 0, sy = 0, sw = img.width, sh = img.height;
  if (srcR > r) { sw = img.height * r; sx = (img.width - sw) / 2; }
  else { sh = img.width / r; sy = (img.height - sh) / 2; }
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(sw);
  canvas.height = Math.round(sh);
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
  URL.revokeObjectURL(url);
  const blob: Blob = await new Promise(res => canvas.toBlob(b => res(b!), 'image/png', 0.95));
  return new File([blob], file.name.replace(/\.[^.]+$/, '') + `-${ratio.replace(':', 'x')}.png`, { type: 'image/png' });
}

export default function HeroBackgroundManager() {
  const [bg, setBg] = useState<HeroBg>(DEFAULT);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cropRatio, setCropRatio] = useState<Ratio>('16:9');

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'hero_background').maybeSingle()
      .then(({ data }) => {
        if (data?.value) {
          const v = data.value as HeroBg;
          setBg(v);
          if (v.aspectRatio) setCropRatio(v.aspectRatio);
        }
      });
  }, []);

  const uploadImage = async (file: File, target: 'main' | 'fallback') => {
    if (file.size > 10 * 1024 * 1024) { toast.error('Ảnh quá lớn (max 10MB)'); return; }
    setUploading(true);
    try {
      const cropped = await cropFileToRatio(file, cropRatio);
      const { primary } = await uploadImageWebP(cropped, { bucket: 'site-media', folder: 'hero', quality: 85, maxWidth: 1920 });
      if (target === 'main') {
        setBg(prev => ({ ...prev, type: 'image', url: primary, aspectRatio: cropRatio }));
      } else {
        setBg(prev => ({ ...prev, fallback: primary, aspectRatio: cropRatio }));
      }
      toast.success(`Đã upload ảnh${cropRatio !== 'auto' ? ` (cắt ${cropRatio})` : ''}. Nhấn "Lưu" để áp dụng.`);
    } catch (err: any) {
      toast.error('Upload thất bại: ' + (err?.message || ''));
    }
    setUploading(false);
  };

  const uploadVideo = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) { toast.error('Video quá lớn (max 50MB)'); return; }
    setUploading(true);
    try {
      const ext = (file.name.split('.').pop() || 'mp4').toLowerCase();
      const path = `hero/hero-video-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from('site-media')
        .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '31536000' });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('site-media').getPublicUrl(path);
      setBg(prev => ({ ...prev, type: 'video', url: urlData.publicUrl, poster: prev.fallback || (prev.type === 'image' ? prev.url : prev.poster) }));
      toast.success('Đã upload video. Nhấn "Lưu" để áp dụng.');
    } catch (err: any) {
      toast.error('Upload thất bại: ' + (err?.message || 'Kiểm tra quyền admin'));
    }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...bg, aspectRatio: cropRatio };
      const { data: existing } = await supabase.from('site_settings').select('id').eq('key', 'hero_background').maybeSingle();
      if (existing) {
        const { error } = await supabase.from('site_settings').update({ value: payload as any }).eq('key', 'hero_background');
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_settings').insert({ key: 'hero_background', value: payload as any });
        if (error) throw error;
      }
      toast.success('Đã lưu nền hero. Trang sẽ tự cập nhật.');
    } catch (err: any) {
      toast.error('Lỗi: ' + (err?.message || ''));
    }
    setSaving(false);
  };

  const reset = async () => {
    if (!confirm('Khôi phục nền hero mặc định?')) return;
    setBg(DEFAULT);
    setCropRatio('16:9');
    toast.info('Đã chọn mặc định. Nhấn "Lưu" để áp dụng.');
  };

  const previewAspect =
    cropRatio === '1:1' ? 'aspect-square' :
    cropRatio === '4:3' ? 'aspect-[4/3]' :
    cropRatio === '16:9' ? 'aspect-video' : 'aspect-video';

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-primary" /> Nền Hero (Ảnh / Video)
      </h3>

      <div className="grid md:grid-cols-[300px_1fr] gap-4 items-start">
        {/* Preview */}
        <div className={`border-2 border-dashed border-border rounded-xl p-2 bg-muted/30 ${previewAspect} overflow-hidden`}>
          {bg.type === 'video' ? (
            <video src={bg.url} poster={bg.poster || bg.fallback} muted loop autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
          ) : (
            <img src={bg.url} alt="Hero preview" className="w-full h-full object-cover rounded-lg" />
          )}
        </div>

        <div className="space-y-3">
          {/* Aspect ratio selector */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1 text-sm font-semibold text-foreground">
              <Crop className="h-4 w-4 text-primary" /> Tỉ lệ ảnh:
            </span>
            {(['16:9', '4:3', '1:1', 'auto'] as Ratio[]).map(r => (
              <button
                key={r}
                onClick={() => setCropRatio(r)}
                className={`px-2.5 py-1 rounded-md text-xs font-bold border ${cropRatio === r ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}
              >
                {r === 'auto' ? 'Giữ nguyên' : r}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border border-primary text-primary hover:bg-primary/10 ${uploading ? 'opacity-50' : ''}`}>
              <Upload className="h-4 w-4" /> Upload ảnh nền
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'main'); e.currentTarget.value = ''; }} />
            </label>
            <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border border-primary text-primary hover:bg-primary/10 ${uploading ? 'opacity-50' : ''}`}>
              <Film className="h-4 w-4" /> Upload video
              <input type="file" accept="video/mp4,video/webm" className="hidden" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadVideo(f); e.currentTarget.value = ''; }} />
            </label>
            <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border border-accent text-accent hover:bg-accent/10 ${uploading ? 'opacity-50' : ''}`}>
              <ImageIcon className="h-4 w-4" /> Ảnh fallback (khi video lỗi)
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f, 'fallback'); e.currentTarget.value = ''; }} />
            </label>
            <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border border-border hover:bg-muted">
              <Trash2 className="h-4 w-4" /> Mặc định
            </button>
          </div>

          {bg.fallback && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Fallback đã chọn:</span>
              <img src={bg.fallback} alt="fallback" className="w-12 h-8 object-cover rounded border border-border" />
              <button onClick={() => setBg(prev => ({ ...prev, fallback: undefined }))} className="text-destructive hover:underline">Xóa</button>
            </div>
          )}

          <div className="space-y-2">
            <label className="text-xs text-muted-foreground">Hoặc dán URL trực tiếp:</label>
            <div className="flex gap-2">
              <select value={bg.type} onChange={(e) => setBg({ ...bg, type: e.target.value as any })}
                className="px-2 py-2 rounded-lg border border-border bg-background text-sm">
                <option value="image">Ảnh</option>
                <option value="video">Video</option>
              </select>
              <input value={bg.url} onChange={(e) => setBg({ ...bg, url: e.target.value })}
                placeholder="https://..." className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            {bg.type === 'video' && (
              <>
                <input value={bg.poster || ''} onChange={(e) => setBg({ ...bg, poster: e.target.value })}
                  placeholder="Poster URL (ảnh hiển thị trước khi video load)" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                <input value={bg.fallback || ''} onChange={(e) => setBg({ ...bg, fallback: e.target.value })}
                  placeholder="Fallback URL (ảnh dùng khi video không tải được)" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </>
            )}
          </div>

          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold ocean-gradient text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu nền hero'}
          </button>
          <p className="text-xs text-muted-foreground">
            💡 Chọn tỉ lệ trước khi upload ảnh để tự cắt giữa. Khuyến nghị 16:9 cho hero, video MP4 ngắn (5-15s).
          </p>
        </div>
      </div>
    </div>
  );
}
