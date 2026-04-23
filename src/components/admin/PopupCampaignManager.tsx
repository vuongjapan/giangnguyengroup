import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, Eye, EyeOff, Upload } from 'lucide-react';
import { uploadImageWebP } from '@/lib/imageUpload';

interface Campaign {
  id: string;
  name: string;
  type: string;
  image_url: string;
  headline: string;
  button_text: string;
  coupon_code: string;
  target_url: string;
  cart_threshold: number;
  is_active: boolean;
  views: number;
  clicks: number;
  start_at: string | null;
  end_at: string | null;
}

const TYPES = [
  { value: 'home', label: 'Trang chủ' },
  { value: 'exit', label: 'Thoát trang (cart > 200K)' },
  { value: 'cart_threshold', label: 'Giỏ hàng đạt mức tiền' },
  { value: 'seasonal', label: 'Lễ Tết' },
];

const empty = (): Partial<Campaign> => ({
  name: '', type: 'exit', image_url: '', headline: '', button_text: 'Xem ngay',
  coupon_code: '', target_url: '/san-pham', cart_threshold: 200000, is_active: true,
});

export default function PopupCampaignManager() {
  const [list, setList] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Campaign> | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
    if (!file) return;
    setUploading(true);
    try {
      const { primary } = await uploadImageWebP(file, { bucket: 'site-media', folder: 'popups', maxWidth: 1200, quality: 85 });
      setEditing(prev => prev ? { ...prev, image_url: primary } : prev);
      toast.success('Đã tải ảnh lên');
    } catch (e: any) {
      toast.error(e?.message || 'Tải ảnh thất bại');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('popup_campaigns').select('*').order('updated_at', { ascending: false });
    setList((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name || !editing.headline) { toast.error('Nhập tên và tiêu đề'); return; }
    const payload = { ...editing } as any;
    if (editing.id) {
      const { error } = await supabase.from('popup_campaigns').update(payload).eq('id', editing.id);
      if (error) { toast.error(error.message); return; }
    } else {
      const { error } = await supabase.from('popup_campaigns').insert(payload);
      if (error) { toast.error(error.message); return; }
    }
    toast.success('Đã lưu popup');
    setEditing(null); load();
  };

  const toggle = async (c: Campaign) => {
    await supabase.from('popup_campaigns').update({ is_active: !c.is_active }).eq('id', c.id);
    load();
  };

  const remove = async (c: Campaign) => {
    if (!confirm(`Xóa "${c.name}"?`)) return;
    await supabase.from('popup_campaigns').delete().eq('id', c.id);
    load();
  };

  if (editing) {
    return (
      <div className="space-y-4 max-w-2xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{editing.id ? 'Sửa' : 'Tạo'} popup</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Hủy</Button>
            <Button onClick={save}>Lưu</Button>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold">Tên (nội bộ)</label>
          <Input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })} />
        </div>
        <div>
          <label className="text-xs font-semibold">Loại popup</label>
          <select className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background"
            value={editing.type} onChange={e => setEditing({ ...editing, type: e.target.value })}>
            {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold">Tiêu đề (headline)</label>
          <Textarea rows={2} value={editing.headline || ''} onChange={e => setEditing({ ...editing, headline: e.target.value })} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold">Mã giảm giá</label>
            <Input value={editing.coupon_code || ''} onChange={e => setEditing({ ...editing, coupon_code: e.target.value.toUpperCase() })} />
          </div>
          <div>
            <label className="text-xs font-semibold">Text nút</label>
            <Input value={editing.button_text || ''} onChange={e => setEditing({ ...editing, button_text: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold">URL đích</label>
            <Input value={editing.target_url || ''} onChange={e => setEditing({ ...editing, target_url: e.target.value })} />
          </div>
          <div>
            <label className="text-xs font-semibold">Mức giỏ tối thiểu (đ)</label>
            <Input type="number" value={editing.cart_threshold || 0} onChange={e => setEditing({ ...editing, cart_threshold: Number(e.target.value) })} />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold">Ảnh popup</label>
          <div className="flex gap-2 items-start mt-1">
            <Input placeholder="Dán URL hoặc bấm Tải ảnh →" value={editing.image_url || ''} onChange={e => setEditing({ ...editing, image_url: e.target.value })} />
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
            <Button type="button" variant="outline" disabled={uploading} onClick={() => fileInputRef.current?.click()}>
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              <span className="ml-1 hidden sm:inline">Tải ảnh</span>
            </Button>
          </div>
          {editing.image_url && <img src={editing.image_url} alt="preview" className="mt-2 max-h-40 rounded border" />}
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={editing.is_active ?? true} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
          Kích hoạt ngay
        </label>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold">Popup Campaigns</h2>
          <p className="text-xs text-muted-foreground">Popup tĩnh – không tốn AI. Quản lý ảnh, mã, link, hẹn giờ.</p>
        </div>
        <Button onClick={() => setEditing(empty())}><Plus className="h-4 w-4 mr-1" /> Tạo popup</Button>
      </div>

      {loading ? <Loader2 className="animate-spin" /> : (
        <div className="grid md:grid-cols-2 gap-3">
          {list.map(c => {
            const ctr = c.views > 0 ? ((c.clicks / c.views) * 100).toFixed(1) : '0';
            return (
              <div key={c.id} className={`rounded-xl border p-4 ${c.is_active ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <span className="text-[10px] uppercase tracking-wider text-primary font-bold">{TYPES.find(t => t.value === c.type)?.label || c.type}</span>
                    <h3 className="font-bold text-sm truncate">{c.name}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{c.headline}</p>
                  </div>
                  {c.image_url && <img src={c.image_url} alt="" className="w-14 h-14 rounded object-cover flex-shrink-0" />}
                </div>
                <div className="flex items-center gap-3 mt-3 text-[11px] text-muted-foreground">
                  <span>👁 {c.views}</span>
                  <span>🖱 {c.clicks}</span>
                  <span>CTR {ctr}%</span>
                  {c.coupon_code && <span className="bg-coral/10 text-coral px-1.5 rounded">{c.coupon_code}</span>}
                </div>
                <div className="flex gap-1 mt-3">
                  <Button size="sm" variant="ghost" onClick={() => toggle(c)}>{c.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</Button>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(c)}><Edit className="h-3.5 w-3.5" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => remove(c)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
            );
          })}
          {list.length === 0 && <p className="text-sm text-muted-foreground col-span-2 text-center py-8">Chưa có popup. Bấm "Tạo popup" để bắt đầu.</p>}
        </div>
      )}
    </div>
  );
}
