import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Sparkles, ShieldOff, Zap, Loader2, DollarSign, Power } from 'lucide-react';

interface ModuleSetting {
  id: string;
  module_key: string;
  enabled: boolean;
  monthly_budget_usd: number;
  used_this_month: number;
  auto_off_at: string | null;
}

const MODULE_INFO: Record<string, { label: string; desc: string; icon: any }> = {
  seo_landing: { label: 'SEO AI – Tạo landing page', desc: 'Tạo bài viết SEO, meta, FAQ schema. Chỉ chạy khi bấm tạo.', icon: Sparkles },
  product_import: { label: 'AI Sản phẩm – Import hàng loạt', desc: 'Tự tạo slug, tags, category, mô tả ngắn khi paste danh sách.', icon: Zap },
  popup_text: { label: 'AI Popup – Viết text quảng cáo', desc: 'Tùy chọn. Mặc định popup dùng ảnh tĩnh.', icon: Sparkles },
  analytics_insight: { label: 'AI Phân tích – Gợi ý tăng doanh thu', desc: 'Tùy chọn. Phân tích sâu khi admin yêu cầu.', icon: Sparkles },
};

export default function AICostControl() {
  const [modules, setModules] = useState<ModuleSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('ai_module_settings').select('*').order('module_key');
    setModules((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const toggle = async (m: ModuleSetting, value: boolean) => {
    setSaving(m.module_key);
    // Auto-off in 15 minutes when turned ON
    const auto_off_at = value ? new Date(Date.now() + 15 * 60 * 1000).toISOString() : null;
    const { error } = await supabase.from('ai_module_settings')
      .update({ enabled: value, auto_off_at }).eq('id', m.id);
    setSaving(null);
    if (error) { toast.error(error.message); return; }
    toast.success(value ? 'Đã bật (tự tắt sau 15 phút)' : 'Đã tắt');
    load();
  };

  const turnAllOff = async () => {
    setSaving('all');
    await supabase.from('ai_module_settings').update({ enabled: false, auto_off_at: null }).neq('id', '00000000-0000-0000-0000-000000000000');
    setSaving(null);
    toast.success('Đã TẮT toàn bộ AI – tiết kiệm tối đa');
    load();
  };

  const enableOnly = async (key: string) => {
    setSaving(key);
    const auto_off_at = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    await supabase.from('ai_module_settings').update({ enabled: false, auto_off_at: null }).neq('module_key', key);
    await supabase.from('ai_module_settings').update({ enabled: true, auto_off_at }).eq('module_key', key);
    setSaving(null);
    toast.success(`Chỉ bật ${MODULE_INFO[key]?.label || key}`);
    load();
  };

  const totalBudget = modules.reduce((s, m) => s + Number(m.monthly_budget_usd || 0), 0);
  const totalUsed = modules.reduce((s, m) => s + Number(m.used_this_month || 0), 0);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      {/* Header / budget */}
      <div className="bg-gradient-to-br from-primary/10 via-card to-accent/5 rounded-2xl border border-border p-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h2 className="text-lg font-extrabold flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" /> AI & Tăng Trưởng
            </h2>
            <p className="text-xs text-muted-foreground mt-1">
              Mục tiêu: <strong>~$1/tháng</strong>. Mặc định AI <strong>TẮT</strong>. Chỉ chạy khi admin bấm.
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs text-muted-foreground">Đã dùng tháng này</span>
            <span className="text-2xl font-black text-primary">${totalUsed.toFixed(2)}<span className="text-sm font-normal text-muted-foreground"> / ${totalBudget.toFixed(2)}</span></span>
          </div>
        </div>

        {/* Quick actions */}
        <div className="flex flex-wrap gap-2 mt-4">
          <button onClick={turnAllOff} disabled={saving === 'all'}
            className="flex items-center gap-1.5 bg-destructive/10 text-destructive border border-destructive/30 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-destructive/20">
            <ShieldOff className="h-3.5 w-3.5" /> Tắt toàn bộ
          </button>
          <button onClick={() => enableOnly('seo_landing')}
            className="flex items-center gap-1.5 bg-primary/10 text-primary border border-primary/30 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-primary/20">
            <Sparkles className="h-3.5 w-3.5" /> Chỉ bật SEO
          </button>
          <button onClick={() => enableOnly('product_import')}
            className="flex items-center gap-1.5 bg-accent/10 text-accent-foreground border border-accent/30 px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-accent/20">
            <Zap className="h-3.5 w-3.5" /> Chỉ bật AI Sản phẩm
          </button>
          <button onClick={turnAllOff}
            className="flex items-center gap-1.5 bg-muted text-foreground px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-muted/80">
            <Power className="h-3.5 w-3.5" /> Chế độ siêu tiết kiệm
          </button>
        </div>
      </div>

      {/* Modules */}
      <div className="grid md:grid-cols-2 gap-3">
        {modules.map(m => {
          const info = MODULE_INFO[m.module_key] || { label: m.module_key, desc: '', icon: Sparkles };
          const Icon = info.icon;
          const isAutoOff = m.enabled && m.auto_off_at && new Date(m.auto_off_at).getTime() > Date.now();
          const minutesLeft = isAutoOff ? Math.max(0, Math.round((new Date(m.auto_off_at!).getTime() - Date.now()) / 60000)) : 0;
          return (
            <div key={m.id} className={`rounded-xl border p-4 transition-colors ${m.enabled ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`h-4 w-4 ${m.enabled ? 'text-primary' : 'text-muted-foreground'}`} />
                    <h3 className="font-bold text-sm">{info.label}</h3>
                  </div>
                  <p className="text-xs text-muted-foreground">{info.desc}</p>
                  {isAutoOff && (
                    <p className="text-[11px] text-coral mt-1.5">⏱ Tự tắt sau {minutesLeft} phút</p>
                  )}
                </div>
                <button
                  onClick={() => toggle(m, !m.enabled)}
                  disabled={saving === m.module_key}
                  className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${m.enabled ? 'bg-primary' : 'bg-muted'}`}
                >
                  <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-card rounded-full shadow transition-transform ${m.enabled ? 'translate-x-5' : ''}`} />
                </button>
              </div>
              <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Dùng: <strong className="text-foreground">${Number(m.used_this_month).toFixed(3)}</strong></span>
                <span>Hạn: ${Number(m.monthly_budget_usd).toFixed(2)}/tháng</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground space-y-1.5">
        <p>💡 <strong>Tiết kiệm chi phí:</strong></p>
        <ul className="list-disc list-inside ml-2 space-y-0.5">
          <li>Nội dung AI tạo ra <strong>lưu vĩnh viễn vào DB</strong> – không gọi lại</li>
          <li>Popup mặc định dùng <strong>ảnh tĩnh</strong> – không tốn AI</li>
          <li>Cart Recovery dùng <strong>popup ngay tại web</strong> thay vì email AI</li>
          <li>Analytics dùng bảng tổng hợp sẵn – không query nặng realtime</li>
        </ul>
      </div>
    </div>
  );
}
