import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, X, Check } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  group_name: string;
  sort_order: number;
  is_active: boolean;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export default function CategoriesManager() {
  const [cats, setCats] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<Category | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '📦', group_name: 'KHÁC', sort_order: 0, is_active: true });

  const fetchAll = async () => {
    const { data } = await (supabase as any).from('product_categories').select('*').order('sort_order');
    if (data) setCats(data as Category[]);
    const { data: prods } = await supabase.from('products').select('category');
    if (prods) {
      const m: Record<string, number> = {};
      for (const p of prods as any[]) {
        const k = (p.category || '').trim();
        if (k) m[k] = (m[k] || 0) + 1;
      }
      setCounts(m);
    }
  };
  useEffect(() => { fetchAll(); }, []);

  const startAdd = () => {
    setForm({ name: '', icon: '📦', group_name: 'KHÁC', sort_order: (cats.at(-1)?.sort_order || 0) + 10, is_active: true });
    setAdding(true);
    setEditing(null);
  };

  const startEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, icon: c.icon, group_name: c.group_name, sort_order: c.sort_order, is_active: c.is_active });
    setAdding(false);
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error('Cần nhập tên danh mục');
    const payload = { ...form, name: form.name.trim(), slug: slugify(form.name) };
    if (editing) {
      const { error } = await (supabase as any).from('product_categories').update(payload).eq('id', editing.id);
      if (error) return toast.error(error.message);
      toast.success('Đã cập nhật');
    } else {
      const { error } = await (supabase as any).from('product_categories').insert(payload);
      if (error) return toast.error(error.message);
      toast.success('Đã thêm danh mục');
    }
    setEditing(null); setAdding(false); fetchAll();
  };

  const del = async (c: Category) => {
    if ((counts[c.name] || 0) > 0) return toast.error(`Không xóa được — còn ${counts[c.name]} sản phẩm dùng danh mục này`);
    if (!confirm(`Xóa danh mục "${c.name}"?`)) return;
    const { error } = await (supabase as any).from('product_categories').delete().eq('id', c.id);
    if (error) return toast.error(error.message);
    toast.success('Đã xóa'); fetchAll();
  };

  const toggleActive = async (c: Category) => {
    await (supabase as any).from('product_categories').update({ is_active: !c.is_active }).eq('id', c.id);
    fetchAll();
  };

  // group view
  const grouped = cats.reduce<Record<string, Category[]>>((acc, c) => {
    (acc[c.group_name] = acc[c.group_name] || []).push(c);
    return acc;
  }, {});

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-bold">📁 Quản lý danh mục sản phẩm</h3>
          <p className="text-xs text-muted-foreground">Tổng {cats.length} danh mục — số trong ngoặc là số sản phẩm đang dùng</p>
        </div>
        <button onClick={startAdd} className="ocean-gradient text-primary-foreground px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Thêm
        </button>
      </div>

      {(adding || editing) && (
        <div className="mb-4 p-3 rounded-lg border border-primary/40 bg-primary/5 grid grid-cols-1 md:grid-cols-6 gap-2">
          <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
            placeholder="📦" maxLength={4} className="px-3 py-2 rounded border border-border bg-background text-center text-lg" />
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            placeholder="Tên danh mục" className="px-3 py-2 rounded border border-border bg-background text-sm md:col-span-2" />
          <input value={form.group_name} onChange={e => setForm(f => ({ ...f, group_name: e.target.value }))}
            placeholder="Nhóm (VD: HẢI SẢN KHÔ)" className="px-3 py-2 rounded border border-border bg-background text-sm" />
          <input type="number" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: Number(e.target.value) }))}
            placeholder="STT" className="px-3 py-2 rounded border border-border bg-background text-sm" />
          <div className="flex gap-1">
            <button onClick={save} className="flex-1 bg-primary text-primary-foreground px-3 py-2 rounded text-sm font-bold flex items-center justify-center gap-1"><Save className="h-3.5 w-3.5" /> Lưu</button>
            <button onClick={() => { setEditing(null); setAdding(false); }} className="px-3 py-2 rounded border border-border text-sm"><X className="h-4 w-4" /></button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {Object.entries(grouped).map(([group, items]) => (
          <div key={group} className="border border-border rounded-lg overflow-hidden">
            <div className="bg-muted px-3 py-2 text-xs font-bold text-foreground">{group} ({items.length})</div>
            <div className="divide-y divide-border">
              {items.map(c => (
                <div key={c.id} className={`flex items-center gap-2 px-3 py-2 ${!c.is_active ? 'opacity-50' : ''}`}>
                  <span className="text-lg w-7 text-center">{c.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{c.name} <span className="text-xs text-muted-foreground">({counts[c.name] || 0})</span></div>
                    <div className="text-[11px] text-muted-foreground">/{c.slug} • STT {c.sort_order}</div>
                  </div>
                  <button onClick={() => toggleActive(c)} title={c.is_active ? 'Đang bật' : 'Đang tắt'}
                    className={`px-2 py-1 rounded text-[11px] font-bold ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                    {c.is_active ? <Check className="h-3 w-3 inline" /> : '—'}
                  </button>
                  <button onClick={() => startEdit(c)} className="p-1.5 hover:bg-muted rounded text-primary"><Edit2 className="h-4 w-4" /></button>
                  <button onClick={() => del(c)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
