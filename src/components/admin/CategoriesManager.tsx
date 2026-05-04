import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Save, X, Check, GripVertical, Merge, Upload, Image as ImageIcon } from 'lucide-react';
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { uploadImageWebP } from '@/lib/imageUpload';

interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  group_name: string;
  sort_order: number;
  is_active: boolean;
  image_url?: string;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function SortableRow({
  c, count, onEdit, onDelete, onToggle, onUploadImage, onPickMerge, mergeChecked,
}: {
  c: Category; count: number;
  onEdit: () => void; onDelete: () => void; onToggle: () => void;
  onUploadImage: (file: File) => void;
  onPickMerge: (checked: boolean) => void;
  mergeChecked: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: c.id });
  const fileRef = useRef<HTMLInputElement>(null);
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };

  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-2 px-3 py-2 bg-card ${!c.is_active ? 'opacity-60' : ''}`}>
      <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground p-1" title="Kéo để sắp xếp">
        <GripVertical className="h-4 w-4" />
      </button>
      <input type="checkbox" checked={mergeChecked} onChange={e => onPickMerge(e.target.checked)} title="Chọn để gộp" className="h-4 w-4" />
      {c.image_url ? (
        <img src={c.image_url} alt={c.name} className="w-9 h-9 rounded object-cover border border-border" />
      ) : (
        <span className="text-xl w-9 h-9 flex items-center justify-center bg-muted rounded">{c.icon}</span>
      )}
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">
          {c.name} <span className="text-xs text-muted-foreground">({count})</span>
        </div>
        <div className="text-[11px] text-muted-foreground">/{c.slug} • STT {c.sort_order}</div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={e => { const f = e.target.files?.[0]; if (f) onUploadImage(f); e.currentTarget.value = ''; }} />
      <button onClick={() => fileRef.current?.click()} className="p-1.5 hover:bg-muted rounded text-primary" title="Upload ảnh đại diện">
        <Upload className="h-4 w-4" />
      </button>
      <button onClick={onToggle} title={c.is_active ? 'Đang bật' : 'Đang tắt'}
        className={`px-2 py-1 rounded text-[11px] font-bold ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
        {c.is_active ? <Check className="h-3 w-3 inline" /> : '—'}
      </button>
      <button onClick={onEdit} className="p-1.5 hover:bg-muted rounded text-primary"><Edit2 className="h-4 w-4" /></button>
      <button onClick={onDelete} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
    </div>
  );
}

export default function CategoriesManager() {
  const [cats, setCats] = useState<Category[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({});
  const [editing, setEditing] = useState<Category | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', icon: '📦', group_name: 'KHÁC', sort_order: 0, is_active: true, image_url: '' });
  const [mergeIds, setMergeIds] = useState<string[]>([]);
  const [mergeTarget, setMergeTarget] = useState<string>('');
  const [merging, setMerging] = useState(false);
  const editFileRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

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
    setForm({ name: '', icon: '📦', group_name: 'KHÁC', sort_order: (cats.at(-1)?.sort_order || 0) + 10, is_active: true, image_url: '' });
    setAdding(true); setEditing(null);
  };

  const startEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, icon: c.icon, group_name: c.group_name, sort_order: c.sort_order, is_active: c.is_active, image_url: c.image_url || '' });
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
    if ((counts[c.name] || 0) > 0) return toast.error(`Không xóa được — còn ${counts[c.name]} sản phẩm dùng danh mục này. Hãy gộp trước.`);
    if (!confirm(`Xóa danh mục "${c.name}"?`)) return;
    const { error } = await (supabase as any).from('product_categories').delete().eq('id', c.id);
    if (error) return toast.error(error.message);
    toast.success('Đã xóa'); fetchAll();
  };

  const toggleActive = async (c: Category) => {
    await (supabase as any).from('product_categories').update({ is_active: !c.is_active }).eq('id', c.id);
    fetchAll();
  };

  const uploadImageFor = async (c: Category, file: File) => {
    const tId = toast.loading('Đang upload ảnh...');
    try {
      const { primary } = await uploadImageWebP(file, { folder: 'categories', maxWidth: 400, quality: 85 });
      await (supabase as any).from('product_categories').update({ image_url: primary }).eq('id', c.id);
      toast.success('Đã cập nhật ảnh', { id: tId });
      fetchAll();
    } catch (e: any) {
      toast.error(e.message || 'Upload thất bại', { id: tId });
    }
  };

  const uploadImageInForm = async (file: File) => {
    const tId = toast.loading('Đang upload ảnh...');
    try {
      const { primary } = await uploadImageWebP(file, { folder: 'categories', maxWidth: 400, quality: 85 });
      setForm(f => ({ ...f, image_url: primary }));
      toast.success('Đã upload', { id: tId });
    } catch (e: any) {
      toast.error(e.message || 'Upload thất bại', { id: tId });
    }
  };

  // Drag & drop reorder within the full list
  const onDragEnd = async (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = cats.findIndex(c => c.id === active.id);
    const newIdx = cats.findIndex(c => c.id === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    const next = arrayMove(cats, oldIdx, newIdx).map((c, i) => ({ ...c, sort_order: (i + 1) * 10 }));
    setCats(next);
    // batch update
    const updates = next.map(c => (supabase as any).from('product_categories').update({ sort_order: c.sort_order }).eq('id', c.id));
    await Promise.all(updates);
    toast.success('Đã lưu thứ tự');
  };

  // Merge categories: move all products from selected → target
  const doMerge = async () => {
    if (mergeIds.length < 2) return toast.error('Chọn ít nhất 2 danh mục để gộp');
    if (!mergeTarget) return toast.error('Chọn danh mục đích');
    if (!mergeIds.includes(mergeTarget)) return toast.error('Danh mục đích phải nằm trong các mục đã chọn');
    const target = cats.find(c => c.id === mergeTarget);
    if (!target) return;
    const sources = cats.filter(c => mergeIds.includes(c.id) && c.id !== mergeTarget);
    const sourceNames = sources.map(c => c.name);
    const totalProducts = sourceNames.reduce((s, n) => s + (counts[n] || 0), 0);
    if (!confirm(`Gộp ${sources.length} danh mục [${sourceNames.join(', ')}] vào "${target.name}"?\n${totalProducts} sản phẩm sẽ được chuyển sang "${target.name}".\nCác danh mục nguồn sẽ bị xóa.`)) return;

    setMerging(true);
    const tId = toast.loading('Đang gộp danh mục...');
    try {
      // 1) Move products
      for (const src of sources) {
        const { error } = await supabase.from('products').update({ category: target.name }).eq('category', src.name);
        if (error) throw error;
      }
      // 2) Delete source categories
      const { error: delErr } = await (supabase as any).from('product_categories').delete().in('id', sources.map(s => s.id));
      if (delErr) throw delErr;
      toast.success(`Đã gộp xong — ${totalProducts} sản phẩm chuyển sang "${target.name}"`, { id: tId });
      setMergeIds([]); setMergeTarget('');
      fetchAll();
    } catch (e: any) {
      toast.error(e.message || 'Gộp thất bại', { id: tId });
    } finally {
      setMerging(false);
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-lg font-bold">📁 Quản lý danh mục sản phẩm</h3>
          <p className="text-xs text-muted-foreground">Tổng {cats.length} danh mục — kéo <GripVertical className="h-3 w-3 inline" /> để sắp xếp • tick ☑ để gộp</p>
        </div>
        <button onClick={startAdd} className="ocean-gradient text-primary-foreground px-3 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Thêm
        </button>
      </div>

      {/* Merge bar */}
      {mergeIds.length > 0 && (
        <div className="mb-4 p-3 rounded-lg border-2 border-amber-400 bg-amber-50 flex flex-col sm:flex-row sm:items-center gap-2">
          <div className="text-sm font-bold flex items-center gap-1.5"><Merge className="h-4 w-4" /> Đã chọn {mergeIds.length}</div>
          <select value={mergeTarget} onChange={e => setMergeTarget(e.target.value)}
            className="px-3 py-2 rounded border border-border bg-background text-sm flex-1 min-w-0">
            <option value="">— Chọn danh mục đích (giữ lại) —</option>
            {cats.filter(c => mergeIds.includes(c.id)).map(c => (
              <option key={c.id} value={c.id}>{c.icon} {c.name} ({counts[c.name] || 0} sp)</option>
            ))}
          </select>
          <button onClick={doMerge} disabled={merging || mergeIds.length < 2 || !mergeTarget}
            className="bg-amber-600 text-white px-3 py-2 rounded text-sm font-bold disabled:opacity-50 flex items-center gap-1">
            <Merge className="h-4 w-4" /> Gộp
          </button>
          <button onClick={() => { setMergeIds([]); setMergeTarget(''); }} className="px-3 py-2 rounded border border-border text-sm">Hủy</button>
        </div>
      )}

      {(adding || editing) && (
        <div className="mb-4 p-3 rounded-lg border border-primary/40 bg-primary/5">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-2">
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
          <div className="mt-2 flex items-center gap-3">
            {form.image_url ? (
              <img src={form.image_url} alt="" className="w-14 h-14 rounded object-cover border border-border" />
            ) : (
              <div className="w-14 h-14 rounded bg-muted flex items-center justify-center text-muted-foreground"><ImageIcon className="h-5 w-5" /></div>
            )}
            <input ref={editFileRef} type="file" accept="image/*" className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) uploadImageInForm(f); e.currentTarget.value = ''; }} />
            <button type="button" onClick={() => editFileRef.current?.click()}
              className="px-3 py-2 rounded border border-border text-sm flex items-center gap-1.5">
              <Upload className="h-4 w-4" /> {form.image_url ? 'Đổi ảnh' : 'Upload ảnh đại diện'}
            </button>
            {form.image_url && (
              <button type="button" onClick={() => setForm(f => ({ ...f, image_url: '' }))}
                className="text-xs text-destructive">Xóa ảnh</button>
            )}
          </div>
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={cats.map(c => c.id)} strategy={verticalListSortingStrategy}>
          <div className="border border-border rounded-lg divide-y divide-border overflow-hidden">
            {cats.map(c => (
              <SortableRow key={c.id} c={c} count={counts[c.name] || 0}
                mergeChecked={mergeIds.includes(c.id)}
                onPickMerge={(ch) => setMergeIds(prev => ch ? [...prev, c.id] : prev.filter(x => x !== c.id))}
                onEdit={() => startEdit(c)}
                onDelete={() => del(c)}
                onToggle={() => toggleActive(c)}
                onUploadImage={(f) => uploadImageFor(c, f)} />
            ))}
            {cats.length === 0 && (
              <div className="p-6 text-center text-sm text-muted-foreground">Chưa có danh mục nào. Bấm "Thêm" để tạo.</div>
            )}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
