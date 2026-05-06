import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, Upload, Image as ImageIcon, Film, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImageWebP } from '@/lib/imageUpload';

type HeroBg = { type: 'image' | 'video'; url: string; poster?: string };

const DEFAULT: HeroBg = {
  type: 'image',
  url: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1920',
};

export default function HeroBackgroundManager() {
  const [bg, setBg] = useState<HeroBg>(DEFAULT);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'hero_background').maybeSingle()
      .then(({ data }) => { if (data?.value) setBg(data.value as any); });
  }, []);

  const uploadImage = async (file: File) => {
    if (file.size > 10 * 1024 * 1024) { toast.error('Ảnh quá lớn (max 10MB)'); return; }
    setUploading(true);
    try {
      const { primary } = await uploadImageWebP(file, { bucket: 'site-media', folder: 'hero', quality: 85, maxWidth: 1920 });
      setBg({ type: 'image', url: primary });
      toast.success('Đã upload ảnh. Nhấn "Lưu" để áp dụng.');
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
      setBg(prev => ({ type: 'video', url: urlData.publicUrl, poster: prev.type === 'image' ? prev.url : prev.poster }));
      toast.success('Đã upload video. Nhấn "Lưu" để áp dụng.');
    } catch (err: any) {
      toast.error('Upload thất bại: ' + (err?.message || 'Kiểm tra quyền admin'));
    }
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase.from('site_settings').select('id').eq('key', 'hero_background').maybeSingle();
      if (existing) {
        const { error } = await supabase.from('site_settings').update({ value: bg as any }).eq('key', 'hero_background');
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_settings').insert({ key: 'hero_background', value: bg as any });
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
    toast.info('Đã chọn mặc định. Nhấn "Lưu" để áp dụng.');
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-primary" /> Nền Hero (Ảnh / Video)
      </h3>

      <div className="grid md:grid-cols-[300px_1fr] gap-4 items-start">
        {/* Preview */}
        <div className="border-2 border-dashed border-border rounded-xl p-2 bg-muted/30 aspect-video overflow-hidden">
          {bg.type === 'video' ? (
            <video src={bg.url} poster={bg.poster} muted loop autoPlay playsInline className="w-full h-full object-cover rounded-lg" />
          ) : (
            <img src={bg.url} alt="Hero preview" className="w-full h-full object-cover rounded-lg" />
          )}
        </div>

        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border border-primary text-primary hover:bg-primary/10 ${uploading ? 'opacity-50' : ''}`}>
              <Upload className="h-4 w-4" /> Upload ảnh
              <input type="file" accept="image/*" className="hidden" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImage(f); e.currentTarget.value = ''; }} />
            </label>
            <label className={`cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border border-primary text-primary hover:bg-primary/10 ${uploading ? 'opacity-50' : ''}`}>
              <Film className="h-4 w-4" /> Upload video
              <input type="file" accept="video/mp4,video/webm" className="hidden" disabled={uploading}
                onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadVideo(f); e.currentTarget.value = ''; }} />
            </label>
            <button onClick={reset} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-bold border border-border hover:bg-muted">
              <Trash2 className="h-4 w-4" /> Mặc định
            </button>
          </div>

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
              <input value={bg.poster || ''} onChange={(e) => setBg({ ...bg, poster: e.target.value })}
                placeholder="Poster URL (ảnh hiển thị trước khi video load)" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            )}
          </div>

          <button onClick={save} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold ocean-gradient text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu nền hero'}
          </button>
          <p className="text-xs text-muted-foreground">
            💡 Khuyến nghị: ảnh ngang ≥1920px, video MP4 ngắn (5-15s, &lt;10MB) để tải nhanh.
          </p>
        </div>
      </div>
    </div>
  );
}
