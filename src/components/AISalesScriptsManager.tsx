// Admin: edit AI sales scripts and behavior settings (separate from chatbot manager)
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Save, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

interface Script {
  id: string;
  trigger_type: string;
  message: string;
  cta_label: string;
  cta_action: string;
  active: boolean;
  sort_order: number;
}

interface Settings {
  id?: string;
  enabled: boolean;
  avatar_url: string;
  cooldown_seconds: number;
  position: string;
  style_theme: string;
  close_sleep_hours: number;
  max_close_count: number;
}

const TRIGGER_LABELS: Record<string, string> = {
  welcome: 'Chào mừng (vào web 3s)',
  product_view: 'Xem sản phẩm 5s',
  idle: 'Không thao tác 15s',
  cart_upsell: 'Có hàng trong giỏ',
  returning: 'Khách quay lại',
  exit_intent: 'Sắp rời trang',
  night_combo: 'Buổi tối (combo nhậu)',
};

const CTA_ACTIONS = [
  { value: 'view', label: 'Xem sản phẩm' },
  { value: 'combo', label: 'Đến trang combo' },
  { value: 'chat', label: 'Mở chatbot' },
  { value: 'recent', label: 'Sản phẩm đã xem' },
  { value: 'cart', label: 'Mở giỏ hàng' },
];

export default function AISalesScriptsManager() {
  const [scripts, setScripts] = useState<Script[]>([]);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [s, st] = await Promise.all([
      supabase.from('ai_scripts').select('*').order('sort_order'),
      supabase.from('ai_settings').select('*').limit(1).maybeSingle(),
    ]);
    if (s.data) setScripts(s.data as Script[]);
    if (st.data) setSettings(st.data as Settings);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const saveScript = async (sc: Script) => {
    const { error } = await supabase.from('ai_scripts').update({
      message: sc.message, cta_label: sc.cta_label, cta_action: sc.cta_action,
      active: sc.active, sort_order: sc.sort_order,
    }).eq('id', sc.id);
    if (error) return toast.error('Lỗi: ' + error.message);
    toast.success('Đã lưu kịch bản');
  };

  const toggleActive = async (sc: Script) => {
    const newActive = !sc.active;
    setScripts(prev => prev.map(p => p.id === sc.id ? { ...p, active: newActive } : p));
    await supabase.from('ai_scripts').update({ active: newActive }).eq('id', sc.id);
  };

  const addScript = async () => {
    const { data, error } = await supabase.from('ai_scripts').insert({
      trigger_type: 'welcome', message: 'Tin nhắn mới', cta_label: 'Xem ngay',
      cta_action: 'view', active: true, sort_order: scripts.length,
    }).select().single();
    if (error) return toast.error(error.message);
    if (data) setScripts([...scripts, data as Script]);
  };

  const deleteScript = async (id: string) => {
    if (!confirm('Xóa kịch bản này?')) return;
    await supabase.from('ai_scripts').delete().eq('id', id);
    setScripts(scripts.filter(s => s.id !== id));
  };

  const saveSettings = async () => {
    if (!settings) return;
    const payload = {
      enabled: settings.enabled, avatar_url: settings.avatar_url,
      cooldown_seconds: settings.cooldown_seconds, position: settings.position,
      style_theme: settings.style_theme, close_sleep_hours: settings.close_sleep_hours,
      max_close_count: settings.max_close_count,
    };
    const { error } = settings.id
      ? await supabase.from('ai_settings').update(payload).eq('id', settings.id)
      : await supabase.from('ai_settings').insert(payload);
    if (error) return toast.error(error.message);
    toast.success('Đã lưu cấu hình AI');
    load();
  };

  if (loading) return <div className="p-8 text-center text-muted-foreground">Đang tải...</div>;

  return (
    <div className="space-y-6">
      {/* Settings */}
      {settings && (
        <div className="bg-card rounded-xl p-6 border border-border">
          <h3 className="text-lg font-bold text-foreground mb-4">Cấu hình AI Sales Assistant</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={settings.enabled}
                onChange={e => setSettings({ ...settings, enabled: e.target.checked })}
                className="w-5 h-5" />
              <span className="text-sm font-medium">Bật AI Assistant</span>
            </label>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">URL Avatar AI</label>
              <input type="url" value={settings.avatar_url}
                onChange={e => setSettings({ ...settings, avatar_url: e.target.value })}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Cooldown (giây)</label>
              <input type="number" min={5} max={300} value={settings.cooldown_seconds}
                onChange={e => setSettings({ ...settings, cooldown_seconds: +e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Vị trí</label>
              <select value={settings.position}
                onChange={e => setSettings({ ...settings, position: e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm">
                <option value="bottom-left">Góc trái dưới</option>
                <option value="bottom-right">Góc phải dưới</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Số lần đóng tối đa / ngày</label>
              <input type="number" min={1} max={10} value={settings.max_close_count}
                onChange={e => setSettings({ ...settings, max_close_count: +e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
            </div>
            <div>
              <label className="text-xs font-bold text-foreground block mb-1">Ngủ sau khi đóng (giờ)</label>
              <input type="number" min={1} max={168} value={settings.close_sleep_hours}
                onChange={e => setSettings({ ...settings, close_sleep_hours: +e.target.value })}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm" />
            </div>
          </div>
          <button onClick={saveSettings}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg font-bold text-sm hover:opacity-90">
            <Save className="h-4 w-4" /> Lưu cấu hình
          </button>
        </div>
      )}

      {/* Scripts */}
      <div className="bg-card rounded-xl p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-foreground">Kịch bản tin nhắn</h3>
          <button onClick={addScript}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-xs font-bold hover:opacity-90">
            <Plus className="h-4 w-4" /> Thêm kịch bản
          </button>
        </div>
        <div className="space-y-3">
          {scripts.map(sc => (
            <div key={sc.id} className="border border-border rounded-lg p-4 bg-background">
              <div className="flex items-start gap-3 mb-3">
                <button onClick={() => toggleActive(sc)} title={sc.active ? 'Đang bật' : 'Đang tắt'}>
                  {sc.active
                    ? <ToggleRight className="h-6 w-6 text-green-600" />
                    : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
                </button>
                <select value={sc.trigger_type}
                  onChange={e => setScripts(s => s.map(p => p.id === sc.id ? { ...p, trigger_type: e.target.value } : p))}
                  className="px-2 py-1 border border-border rounded text-xs font-semibold">
                  {Object.entries(TRIGGER_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <button onClick={() => deleteScript(sc.id)} className="ml-auto text-coral hover:text-red-700">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <textarea value={sc.message}
                onChange={e => setScripts(s => s.map(p => p.id === sc.id ? { ...p, message: e.target.value } : p))}
                rows={2}
                className="w-full px-3 py-2 border border-border rounded-lg text-sm mb-2" />
              <div className="grid grid-cols-2 gap-2">
                <input type="text" value={sc.cta_label} placeholder="Nhãn nút CTA"
                  onChange={e => setScripts(s => s.map(p => p.id === sc.id ? { ...p, cta_label: e.target.value } : p))}
                  className="px-3 py-1.5 border border-border rounded-lg text-xs" />
                <select value={sc.cta_action}
                  onChange={e => setScripts(s => s.map(p => p.id === sc.id ? { ...p, cta_action: e.target.value } : p))}
                  className="px-3 py-1.5 border border-border rounded-lg text-xs">
                  {CTA_ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
              <button onClick={() => saveScript(sc)}
                className="mt-2 inline-flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded text-xs font-bold hover:opacity-90">
                <Save className="h-3 w-3" /> Lưu
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
