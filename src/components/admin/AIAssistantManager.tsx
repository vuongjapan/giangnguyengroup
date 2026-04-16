import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, Upload, Sparkles, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

interface AIConfig {
  enabled: boolean;
  avatar_url: string;
  cooldown: number;
  welcome_message: string;
  product_message: string;
  idle_message: string;
  cart_message: string;
  combo_message: string;
}

const DEFAULT_CONFIG: AIConfig = {
  enabled: true,
  avatar_url: '/images/logo-giang-nguyen-group.jpg',
  cooldown: 20,
  welcome_message: 'Chào bạn 👋 Hôm nay bên mình có hải sản khô đang bán rất chạy!',
  product_message: '🔥 Sản phẩm này đang bán rất chạy! Xem thêm sản phẩm cùng loại:',
  idle_message: 'Bạn cần mình tư vấn loại hải sản phù hợp không? 🦐',
  cart_message: '💡 Thêm combo để được giá tốt hơn! Tiết kiệm hơn mua lẻ:',
  combo_message: '🎁 Combo tiết kiệm! Mua combo lợi hơn mua lẻ:',
};

export default function AIAssistantManager() {
  const [config, setConfig] = useState<AIConfig>(DEFAULT_CONFIG);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'ai_assistant_config').maybeSingle();
    if (data?.value) setConfig({ ...DEFAULT_CONFIG, ...(data.value as any) });
  };

  const saveConfig = async () => {
    setSaving(true);
    const { data: existing } = await supabase.from('site_settings').select('id').eq('key', 'ai_assistant_config').maybeSingle();
    if (existing) {
      await supabase.from('site_settings').update({ value: config as any }).eq('key', 'ai_assistant_config');
    } else {
      await supabase.from('site_settings').insert({ key: 'ai_assistant_config', value: config as any });
    }
    toast.success('Đã lưu cấu hình AI Assistant');
    setSaving(false);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `ai-assistant/avatar-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('site-media').upload(path, file, { upsert: true });
    if (error) { toast.error('Upload thất bại'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('site-media').getPublicUrl(path);
    setConfig(c => ({ ...c, avatar_url: urlData.publicUrl }));
    toast.success('Đã upload avatar AI');
    setUploading(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> Quản lý AI Tư vấn
        </h2>
        <button onClick={saveConfig} disabled={saving}
          className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:opacity-90 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
        </button>
      </div>

      {/* Toggle + Avatar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-bold text-foreground mb-3">Trạng thái</h3>
          <button onClick={() => setConfig(c => ({ ...c, enabled: !c.enabled }))}
            className={`flex items-center gap-2 px-4 py-3 rounded-lg font-bold text-sm w-full justify-center ${config.enabled ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
            {config.enabled ? <><Eye className="h-4 w-4" /> Đang bật</> : <><EyeOff className="h-4 w-4" /> Đang tắt</>}
          </button>

          <div className="mt-4">
            <label className="text-sm font-medium text-foreground">Tần suất gợi ý (giây)</label>
            <input type="number" value={config.cooldown} onChange={e => setConfig(c => ({ ...c, cooldown: +e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm bg-card" min={5} max={120} />
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-bold text-foreground mb-3">Avatar AI</h3>
          <div className="flex items-center gap-4">
            <img src={config.avatar_url} alt="AI Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-primary" />
            <label className={`cursor-pointer flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold border border-primary text-primary hover:bg-primary/10 ${uploading ? 'opacity-50' : ''}`}>
              <Upload className="h-4 w-4" /> {uploading ? 'Đang tải...' : 'Đổi avatar'}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} disabled={uploading} />
            </label>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="bg-card rounded-xl border border-border p-4 space-y-4">
        <h3 className="font-bold text-foreground">Nội dung gợi ý</h3>
        {[
          { key: 'welcome_message', label: 'Lời chào (trang chủ)' },
          { key: 'product_message', label: 'Gợi ý sản phẩm liên quan' },
          { key: 'combo_message', label: 'Gợi ý combo' },
          { key: 'cart_message', label: 'Gợi ý khi checkout' },
          { key: 'idle_message', label: 'Khi không tương tác' },
        ].map(field => (
          <div key={field.key}>
            <label className="text-sm font-medium text-foreground">{field.label}</label>
            <textarea value={(config as any)[field.key]} onChange={e => setConfig(c => ({ ...c, [field.key]: e.target.value }))}
              className="w-full mt-1 px-3 py-2 border border-border rounded-lg text-sm bg-card resize-none" rows={2} />
          </div>
        ))}
      </div>
    </div>
  );
}
