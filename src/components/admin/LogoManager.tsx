import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, Upload, Image } from 'lucide-react';
import { toast } from 'sonner';
import defaultLogo from '@/assets/logo-giang-nguyen.jpg';

export default function LogoManager() {
  const [logoUrl, setLogoUrl] = useState<string>(defaultLogo);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    supabase.from('site_settings').select('value').eq('key', 'site_logo').maybeSingle()
      .then(({ data }) => { if (data?.value) setLogoUrl(data.value as string); });
  }, []);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Ảnh quá lớn (max 5MB)'); return; }
    setUploading(true);
    try {
      // Try edge function (WebP conversion + admin validation)
      const { uploadImageWebP } = await import('@/lib/imageUpload');
      try {
        const { primary } = await uploadImageWebP(file, { bucket: 'site-media', folder: 'logos', quality: 90, maxWidth: 800 });
        setLogoUrl(primary);
        toast.success('Đã upload (WebP). Nhấn "Lưu logo" để áp dụng.');
      } catch {
        // Fallback to direct upload if edge function fails
        const ext = (file.name.split('.').pop() || 'png').toLowerCase();
        const path = `logos/site-logo-${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage
          .from('site-media')
          .upload(path, file, { upsert: true, contentType: file.type, cacheControl: '3600' });
        if (upErr) throw upErr;
        const { data: urlData } = supabase.storage.from('site-media').getPublicUrl(path);
        setLogoUrl(urlData.publicUrl);
        toast.success('Đã upload. Nhấn "Lưu logo" để áp dụng.');
      }
    } catch (err: any) {
      toast.error('Upload thất bại: ' + (err?.message || 'Kiểm tra quyền admin'));
    }
    setUploading(false);
    e.target.value = '';
  };

  const saveLogo = async () => {
    setSaving(true);
    try {
      const { data: existing } = await supabase.from('site_settings').select('id').eq('key', 'site_logo').maybeSingle();
      if (existing) {
        const { error } = await supabase.from('site_settings').update({ value: logoUrl as any }).eq('key', 'site_logo');
        if (error) throw error;
      } else {
        const { error } = await supabase.from('site_settings').insert({ key: 'site_logo', value: logoUrl as any });
        if (error) throw error;
      }
      toast.success('Đã lưu logo. Refresh để thấy thay đổi.');
    } catch (err: any) {
      toast.error('Lỗi lưu logo: ' + (err?.message || 'Unknown'));
    }
    setSaving(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4">
      <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
        <Image className="h-5 w-5 text-primary" /> Quản lý Logo
      </h3>
      <div className="flex items-center gap-6">
        <div className="border-2 border-dashed border-border rounded-xl p-4 bg-muted/30">
          <img src={logoUrl} alt="Logo" className="h-20 w-auto object-contain rounded-lg" />
        </div>
        <div className="space-y-2">
          <label className={`cursor-pointer inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border border-primary text-primary hover:bg-primary/10 ${uploading ? 'opacity-50' : ''}`}>
            <Upload className="h-4 w-4" /> {uploading ? 'Đang tải...' : 'Upload logo mới'}
            <input type="file" accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
          <button onClick={saveLogo} disabled={saving}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold ocean-gradient text-primary-foreground hover:opacity-90 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu logo'}
          </button>
        </div>
      </div>
    </div>
  );
}
