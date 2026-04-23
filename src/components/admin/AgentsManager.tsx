import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, Save, X, Loader2, Upload, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImageWebP } from '@/lib/imageUpload';

interface Agent {
  id: string;
  name: string;
  slug: string;
  region: string;
  address: string;
  phone: string;
  zalo: string;
  avatar: string;
  description: string;
  products_distributed: string[];
  is_active: boolean;
  sort_order: number;
}

const empty = (): Partial<Agent> => ({
  name: '', slug: '', region: '', address: '', phone: '', zalo: '',
  avatar: '', description: '', products_distributed: [], is_active: true, sort_order: 0,
});

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function AgentsManager() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Partial<Agent> | null>(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('agents' as any).select('*').order('sort_order');
    setAgents((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.name) return toast.error('Cần nhập tên');
    const slug = editing.slug || slugify(editing.name);
    const payload = { ...editing, slug };
    delete (payload as any).id;
    const { error } = editing.id
      ? await supabase.from('agents' as any).update(payload).eq('id', editing.id)
      : await supabase.from('agents' as any).insert(payload);
    if (error) return toast.error(error.message);
    toast.success('Đã lưu');
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm('Xoá đại lý này?')) return;
    await supabase.from('agents' as any).delete().eq('id', id);
    toast.success('Đã xoá');
    load();
  };

  const toggleActive = async (a: Agent) => {
    await supabase.from('agents' as any).update({ is_active: !a.is_active }).eq('id', a.id);
    load();
  };

  const handleUpload = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    try {
      const { primary } = await uploadImageWebP(file, { folder: 'agents' });
      setEditing({ ...editing, avatar: primary });
      toast.success('Đã tải ảnh');
    } catch (e: any) { toast.error(e.message); }
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Quản lý Đại lý ({agents.length})</h2>
        <button onClick={() => setEditing(empty())}
          className="ocean-gradient text-primary-foreground font-bold px-4 py-2 rounded-lg text-sm flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Thêm
        </button>
      </div>

      {loading ? <Loader2 className="h-6 w-6 animate-spin mx-auto my-8" /> : (
        <div className="grid md:grid-cols-2 gap-3">
          {agents.map(a => (
            <div key={a.id} className="bg-card border border-border rounded-lg p-3 flex gap-3">
              {a.avatar ? <img src={a.avatar} alt="" className="w-14 h-14 rounded-lg object-cover" /> : <div className="w-14 h-14 rounded-lg bg-muted" />}
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm truncate">{a.name}</p>
                <p className="text-xs text-muted-foreground truncate">{a.region} · {a.phone}</p>
                <div className="flex gap-1 mt-1">
                  <button onClick={() => setEditing(a)} className="text-xs text-primary p-1"><Edit className="h-3.5 w-3.5" /></button>
                  <button onClick={() => toggleActive(a)} className="text-xs text-muted-foreground p-1">{a.is_active ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                  <button onClick={() => remove(a.id)} className="text-xs text-destructive p-1"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="bg-card rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 space-y-3" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold">{editing.id ? 'Sửa' : 'Thêm'} đại lý</h3>
              <button onClick={() => setEditing(null)}><X className="h-5 w-5" /></button>
            </div>

            <input value={editing.name || ''} onChange={e => setEditing({ ...editing, name: e.target.value })}
              placeholder="Tên đại lý *" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input value={editing.region || ''} onChange={e => setEditing({ ...editing, region: e.target.value })}
                placeholder="Khu vực (vd: Hà Nội)" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              <input value={editing.sort_order || 0} type="number" onChange={e => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                placeholder="Thứ tự" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <input value={editing.address || ''} onChange={e => setEditing({ ...editing, address: e.target.value })}
              placeholder="Địa chỉ" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <input value={editing.phone || ''} onChange={e => setEditing({ ...editing, phone: e.target.value })}
                placeholder="Điện thoại" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              <input value={editing.zalo || ''} onChange={e => setEditing({ ...editing, zalo: e.target.value })}
                placeholder="Zalo (số)" className="px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>

            <div>
              <label className="text-xs font-bold mb-1 block">Ảnh đại diện</label>
              <div className="flex gap-2 items-center">
                {editing.avatar && <img src={editing.avatar} alt="" className="w-14 h-14 rounded object-cover" />}
                <label className="flex-1 cursor-pointer bg-muted hover:bg-muted/80 px-3 py-2 rounded-lg text-sm flex items-center gap-2 justify-center">
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? 'Đang tải...' : 'Tải ảnh'}
                  <input type="file" accept="image/*" className="hidden"
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleUpload(f); }} />
                </label>
              </div>
              <input value={editing.avatar || ''} onChange={e => setEditing({ ...editing, avatar: e.target.value })}
                placeholder="hoặc dán URL ảnh" className="w-full mt-2 px-3 py-2 rounded-lg border border-border bg-background text-xs" />
            </div>

            <textarea value={editing.description || ''} onChange={e => setEditing({ ...editing, description: e.target.value })}
              placeholder="Mô tả ngắn" rows={3} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />

            <input value={(editing.products_distributed || []).join(', ')}
              onChange={e => setEditing({ ...editing, products_distributed: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
              placeholder="SP phân phối, cách nhau dấu phẩy" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />

            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={editing.is_active ?? true} onChange={e => setEditing({ ...editing, is_active: e.target.checked })} />
              Hiển thị
            </label>

            <button onClick={save} className="w-full ocean-gradient text-primary-foreground font-bold py-2 rounded-lg text-sm flex items-center justify-center gap-2">
              <Save className="h-4 w-4" /> Lưu
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
