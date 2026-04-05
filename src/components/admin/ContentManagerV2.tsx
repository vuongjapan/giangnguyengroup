import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, Plus, Edit, Trash2, Image, X, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';

// ============ TYPES ============
interface PromotionItem {
  id: string;
  title: string;
  description: string;
  image: string;
  salePercent: number;
  isActive: boolean;
}

interface RecipeItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  time: string;
  servings: string;
  ingredients: string[];
  steps: string[];
  relatedProductSlugs: string[];
}

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  date: string;
  tag?: string;
}

interface BlogArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  image: string;
  readTime: string;
  views: number;
  date: string;
  relatedProductSlugs: string[];
  metaTitle: string;
  metaDescription: string;
}

interface BrandContent {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  storyTitle: string;
  storyParagraphs: string[];
  storyImage: string;
  yearsExperience: string;
  values: { icon: string; title: string; desc: string }[];
  timeline: { year: string; title: string; desc: string }[];
  certifications: { icon: string; title: string; desc: string }[];
  ctaTitle: string;
  ctaDescription: string;
}

type ContentSection = 'promotions' | 'recipes' | 'news' | 'blog' | 'brand' | 'banner' | 'policy' | 'contact' | 'footer';

// ============ HELPERS ============
const genId = () => Math.random().toString(36).slice(2, 10);

async function loadContent(key: string): Promise<any> {
  const { data } = await supabase.from('site_settings').select('value').eq('key', key).maybeSingle();
  return data?.value as any;
}

async function saveContent(key: string, value: any) {
  const { data: existing } = await supabase.from('site_settings').select('id').eq('key', key).maybeSingle();
  if (existing) {
    await supabase.from('site_settings').update({ value }).eq('key', key);
  } else {
    await supabase.from('site_settings').insert({ key, value });
  }
  toast.success('Đã lưu!');
}

// ============ IMAGE INPUT ============
function ImageInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <div>
      {label && <label className="block text-xs font-bold text-foreground mb-1">{label}</label>}
      <div className="flex gap-2">
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="URL ảnh..."
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        {value && <img src={value} alt="" className="w-10 h-10 rounded object-cover border border-border" />}
      </div>
    </div>
  );
}

// ============ MULTI IMAGE INPUT ============
function MultiImageInput({ images, onChange, label }: { images: string[]; onChange: (v: string[]) => void; label?: string }) {
  const addImage = () => onChange([...images, '']);
  return (
    <div>
      {label && <label className="block text-xs font-bold text-foreground mb-1">{label}</label>}
      {images.map((img, i) => (
        <div key={i} className="flex gap-2 mb-1">
          <input value={img} onChange={e => { const n = [...images]; n[i] = e.target.value; onChange(n); }}
            placeholder="URL ảnh..." className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          {img && <img src={img} alt="" className="w-10 h-10 rounded object-cover border border-border" />}
          <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}
            className="text-destructive hover:bg-destructive/10 p-2 rounded"><X className="h-4 w-4" /></button>
        </div>
      ))}
      <button type="button" onClick={addImage} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
        <Plus className="h-3 w-3" /> Thêm ảnh
      </button>
    </div>
  );
}

// ============ LIST INPUT ============
function ListInput({ items, onChange, label, placeholder }: { items: string[]; onChange: (v: string[]) => void; label: string; placeholder?: string }) {
  return (
    <div>
      <label className="block text-xs font-bold text-foreground mb-1">{label}</label>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 mb-1">
          <span className="text-xs text-muted-foreground pt-2.5 w-5">{i + 1}.</span>
          <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
            placeholder={placeholder} className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          <button type="button" onClick={() => onChange(items.filter((_, j) => j !== i))}
            className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="h-3 w-3" /></button>
        </div>
      ))}
      <button type="button" onClick={() => onChange([...items, ''])} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
        <Plus className="h-3 w-3" /> Thêm
      </button>
    </div>
  );
}

// ============ MAIN CONTENT MANAGER ============
export default function ContentManagerV2() {
  const [section, setSection] = useState<ContentSection>('promotions');

  const sections: { key: ContentSection; label: string; desc: string }[] = [
    { key: 'promotions', label: '🎉 Khuyến mãi', desc: 'Flash sale, ưu đãi mua nhiều' },
    { key: 'recipes', label: '🍳 Món ngon', desc: 'Công thức chế biến hải sản' },
    { key: 'news', label: '📰 Tin tức', desc: 'Tin tức & sự kiện' },
    { key: 'blog', label: '📚 Blog', desc: 'Bài viết kiến thức' },
    { key: 'brand', label: '📖 Giới thiệu', desc: 'Câu chuyện thương hiệu' },
    { key: 'banner', label: '🖼️ Banner', desc: 'Banner trang chủ' },
    { key: 'policy', label: '📋 Chính sách', desc: 'Chính sách bán hàng' },
    { key: 'contact', label: '📞 Liên hệ', desc: 'Thông tin liên hệ' },
    { key: 'footer', label: '🔻 Footer', desc: 'Chân trang' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
      <div className="space-y-1">
        <h3 className="font-bold text-foreground mb-3">Quản lý nội dung</h3>
        {sections.map(s => (
          <button key={s.key} onClick={() => setSection(s.key)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${section === s.key ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted text-foreground'}`}>
            <p className="font-medium">{s.label}</p>
            <p className="text-xs opacity-70">{s.desc}</p>
          </button>
        ))}
      </div>
      <div className="md:col-span-4">
        {section === 'promotions' && <PromotionsEditor />}
        {section === 'recipes' && <RecipesEditor />}
        {section === 'news' && <NewsEditor />}
        {section === 'blog' && <BlogEditor />}
        {section === 'brand' && <BrandEditor />}
        {(section === 'banner' || section === 'policy' || section === 'contact' || section === 'footer') && <SimpleEditor contentKey={section} />}
      </div>
    </div>
  );
}

// ============ PROMOTIONS EDITOR ============
function PromotionsEditor() {
  const [items, setItems] = useState<PromotionItem[]>([]);
  const [editing, setEditing] = useState<PromotionItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent('content_promotions').then(d => { if (d) setItems(d); setLoading(false); });
  }, []);

  const save = async (newItems: PromotionItem[]) => {
    setSaving(true);
    await saveContent('content_promotions', newItems);
    setItems(newItems);
    setSaving(false);
  };

  const handleSaveItem = (item: PromotionItem) => {
    const exists = items.find(i => i.id === item.id);
    const newItems = exists ? items.map(i => i.id === item.id ? item : i) : [...items, item];
    save(newItems);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Xóa khuyến mãi này?')) return;
    save(items.filter(i => i.id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground text-lg">🎉 Quản lý khuyến mãi ({items.length})</h3>
        <button onClick={() => setEditing({ id: genId(), title: '', description: '', image: '', salePercent: 10, isActive: true })}
          className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Thêm
        </button>
      </div>

      {editing && (
        <div className="bg-card rounded-xl border border-border p-6 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề *</label>
              <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">% Giảm giá</label>
              <input type="number" value={editing.salePercent} onChange={e => setEditing({ ...editing, salePercent: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Mô tả</label>
            <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <ImageInput value={editing.image} onChange={v => setEditing({ ...editing, image: v })} label="Ảnh" />
          <div className="flex gap-2">
            <button onClick={() => handleSaveItem(editing)} className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
              <Save className="h-4 w-4" /> Lưu
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
            {item.image && <img src={item.image} alt="" className="w-14 h-14 rounded object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground truncate">{item.description}</p>
              <span className="text-xs text-coral font-bold">-{item.salePercent}%</span>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(item)} className="p-1.5 hover:bg-muted rounded text-primary"><Edit className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Chưa có khuyến mãi. Bấm "Thêm" để tạo mới.</p>}
      </div>
    </div>
  );
}

// ============ RECIPES EDITOR ============
function RecipesEditor() {
  const [items, setItems] = useState<RecipeItem[]>([]);
  const [editing, setEditing] = useState<RecipeItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent('content_recipes').then(d => { if (d) setItems(d); setLoading(false); });
  }, []);

  const save = async (newItems: RecipeItem[]) => {
    setSaving(true);
    await saveContent('content_recipes', newItems);
    setItems(newItems);
    setSaving(false);
  };

  const emptyRecipe = (): RecipeItem => ({
    id: genId(), title: '', category: 'Mực', image: '', description: '',
    time: '15 phút', servings: '2-3 người', ingredients: [''], steps: [''], relatedProductSlugs: [],
  });

  const handleSave = (item: RecipeItem) => {
    const exists = items.find(i => i.id === item.id);
    save(exists ? items.map(i => i.id === item.id ? item : i) : [...items, item]);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Xóa công thức này?')) return;
    save(items.filter(i => i.id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground text-lg">🍳 Quản lý món ngon ({items.length})</h3>
        <button onClick={() => setEditing(emptyRecipe())}
          className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Thêm
        </button>
      </div>

      {editing && (
        <div className="bg-card rounded-xl border border-border p-6 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Tên món *</label>
              <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Danh mục</label>
              <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                {['Mực', 'Cá', 'Tôm', 'Khác'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Thời gian</label>
                <input value={editing.time} onChange={e => setEditing({ ...editing, time: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Khẩu phần</label>
                <input value={editing.servings} onChange={e => setEditing({ ...editing, servings: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Mô tả ngắn</label>
            <textarea value={editing.description} onChange={e => setEditing({ ...editing, description: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <ImageInput value={editing.image} onChange={v => setEditing({ ...editing, image: v })} label="Ảnh món ăn" />
          <ListInput items={editing.ingredients} onChange={v => setEditing({ ...editing, ingredients: v })} label="Nguyên liệu" placeholder="VD: 200g mực khô" />
          <ListInput items={editing.steps} onChange={v => setEditing({ ...editing, steps: v })} label="Các bước chế biến" placeholder="Bước..." />
          <ListInput items={editing.relatedProductSlugs} onChange={v => setEditing({ ...editing, relatedProductSlugs: v })} label="Slug sản phẩm liên quan" placeholder="VD: muc-kho-loai-1" />
          <div className="flex gap-2">
            <button onClick={() => handleSave(editing)} className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
              <Save className="h-4 w-4" /> Lưu
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
            {item.image && <img src={item.image} alt="" className="w-14 h-14 rounded object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.category} • {item.time} • {item.servings}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(item)} className="p-1.5 hover:bg-muted rounded text-primary"><Edit className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Chưa có công thức. Bấm "Thêm" để tạo mới.</p>}
      </div>
    </div>
  );
}

// ============ NEWS EDITOR ============
function NewsEditor() {
  const [items, setItems] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<NewsItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent('content_news').then(d => { if (d) setItems(d); setLoading(false); });
  }, []);

  const save = async (newItems: NewsItem[]) => {
    await saveContent('content_news', newItems);
    setItems(newItems);
  };

  const emptyNews = (): NewsItem => ({
    id: genId(), title: '', excerpt: '', category: 'Hàng mới về', image: '',
    date: new Date().toLocaleDateString('vi-VN'), tag: '',
  });

  const handleSave = (item: NewsItem) => {
    const exists = items.find(i => i.id === item.id);
    save(exists ? items.map(i => i.id === item.id ? item : i) : [...items, item]);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Xóa tin tức này?')) return;
    save(items.filter(i => i.id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground text-lg">📰 Quản lý tin tức ({items.length})</h3>
        <button onClick={() => setEditing(emptyNews())}
          className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Thêm
        </button>
      </div>

      {editing && (
        <div className="bg-card rounded-xl border border-border p-6 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề *</label>
              <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Danh mục</label>
                <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  {['Hàng mới về', 'Biển Sầm Sơn hôm nay', 'Khuyến mãi', 'Feedback khách'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Ngày</label>
                <input value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
              <div>
                <label className="block text-xs font-bold text-foreground mb-1">Tag</label>
                <select value={editing.tag || ''} onChange={e => setEditing({ ...editing, tag: e.target.value || undefined })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="">Không</option>
                  <option>MỚI</option>
                  <option>HOT</option>
                </select>
              </div>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Nội dung ngắn</label>
            <textarea value={editing.excerpt} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <ImageInput value={editing.image} onChange={v => setEditing({ ...editing, image: v })} label="Ảnh" />
          <div className="flex gap-2">
            <button onClick={() => handleSave(editing)} className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
              <Save className="h-4 w-4" /> Lưu
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
            {item.image && <img src={item.image} alt="" className="w-14 h-14 rounded object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.category} • {item.date} {item.tag && <span className="text-coral font-bold">#{item.tag}</span>}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(item)} className="p-1.5 hover:bg-muted rounded text-primary"><Edit className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Chưa có tin tức. Bấm "Thêm" để tạo mới.</p>}
      </div>
    </div>
  );
}

// ============ BLOG EDITOR ============
function BlogEditor() {
  const [items, setItems] = useState<BlogArticle[]>([]);
  const [editing, setEditing] = useState<BlogArticle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContent('content_blog').then(d => { if (d) setItems(d); setLoading(false); });
  }, []);

  const save = async (newItems: BlogArticle[]) => {
    await saveContent('content_blog', newItems);
    setItems(newItems);
  };

  const emptyArticle = (): BlogArticle => ({
    id: genId(), slug: '', title: '', excerpt: '', content: [''],
    category: 'Du lịch Sầm Sơn', image: '', readTime: '5 phút',
    views: 0, date: new Date().toLocaleDateString('vi-VN'),
    relatedProductSlugs: [], metaTitle: '', metaDescription: '',
  });

  const handleSave = (item: BlogArticle) => {
    if (!item.slug) item.slug = item.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const exists = items.find(i => i.id === item.id);
    save(exists ? items.map(i => i.id === item.id ? item : i) : [...items, item]);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Xóa bài viết này?')) return;
    save(items.filter(i => i.id !== id));
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground text-lg">📚 Quản lý Blog ({items.length})</h3>
        <button onClick={() => setEditing(emptyArticle())}
          className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
          <Plus className="h-4 w-4" /> Thêm bài
        </button>
      </div>

      {editing && (
        <div className="bg-card rounded-xl border border-border p-6 mb-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề *</label>
              <input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Slug (tự tạo nếu trống)</label>
              <input value={editing.slug} onChange={e => setEditing({ ...editing, slug: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm font-mono" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Danh mục</label>
              <select value={editing.category} onChange={e => setEditing({ ...editing, category: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                {['Du lịch Sầm Sơn', 'Đặc sản biển', 'Kinh nghiệm chọn hải sản'].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Thời gian đọc</label>
              <input value={editing.readTime} onChange={e => setEditing({ ...editing, readTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Ngày đăng</label>
              <input value={editing.date} onChange={e => setEditing({ ...editing, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Lượt xem</label>
              <input type="number" value={editing.views} onChange={e => setEditing({ ...editing, views: Number(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Mô tả ngắn (excerpt)</label>
            <textarea value={editing.excerpt} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <ImageInput value={editing.image} onChange={v => setEditing({ ...editing, image: v })} label="Ảnh đại diện" />
          <ListInput items={editing.content} onChange={v => setEditing({ ...editing, content: v })} label="Nội dung bài viết (mỗi dòng = 1 đoạn)" placeholder="Đoạn văn..." />
          <ListInput items={editing.relatedProductSlugs} onChange={v => setEditing({ ...editing, relatedProductSlugs: v })} label="Slug sản phẩm liên quan" placeholder="VD: muc-kho-loai-1" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Meta Title (SEO)</label>
              <input value={editing.metaTitle} onChange={e => setEditing({ ...editing, metaTitle: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Meta Description (SEO)</label>
              <input value={editing.metaDescription} onChange={e => setEditing({ ...editing, metaDescription: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleSave(editing)} className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
              <Save className="h-4 w-4" /> Lưu
            </button>
            <button onClick={() => setEditing(null)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {items.map(item => (
          <div key={item.id} className="bg-card rounded-lg border border-border p-3 flex items-center gap-3">
            {item.image && <img src={item.image} alt="" className="w-14 h-14 rounded object-cover" />}
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground text-sm">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.category} • {item.date} • {item.views} views</p>
              <p className="text-xs text-primary font-mono">/blog/{item.slug}</p>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditing(item)} className="p-1.5 hover:bg-muted rounded text-primary"><Edit className="h-4 w-4" /></button>
              <button onClick={() => handleDelete(item.id)} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Chưa có bài viết. Bấm "Thêm bài" để tạo mới.</p>}
      </div>
    </div>
  );
}

// ============ BRAND EDITOR ============
function BrandEditor() {
  const [brand, setBrand] = useState<BrandContent>({
    heroImage: '', heroTitle: 'Về Giang Nguyen Seafood',
    heroSubtitle: 'Hành trình từ ngư dân Sầm Sơn đến thương hiệu hải sản khô cao cấp số 1',
    storyTitle: 'Từ biển khơi đến bàn ăn',
    storyParagraphs: [''],
    storyImage: '', yearsExperience: '10+',
    values: [], timeline: [], certifications: [],
    ctaTitle: '', ctaDescription: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent('content_brand').then(d => { if (d) setBrand(d); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true);
    await saveContent('content_brand', brand);
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground text-lg">📖 Trang Giới thiệu</h3>
        <button onClick={save} disabled={saving}
          className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu tất cả'}
        </button>
      </div>

      {/* Hero */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h4 className="font-bold text-foreground">🖼️ Hero Banner</h4>
        <ImageInput value={brand.heroImage} onChange={v => setBrand({ ...brand, heroImage: v })} label="Ảnh nền hero" />
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề</label>
          <input value={brand.heroTitle} onChange={e => setBrand({ ...brand, heroTitle: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Mô tả</label>
          <input value={brand.heroSubtitle} onChange={e => setBrand({ ...brand, heroSubtitle: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
      </div>

      {/* Story */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h4 className="font-bold text-foreground">📝 Câu chuyện</h4>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề section</label>
          <input value={brand.storyTitle} onChange={e => setBrand({ ...brand, storyTitle: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <ListInput items={brand.storyParagraphs} onChange={v => setBrand({ ...brand, storyParagraphs: v })} label="Các đoạn văn" placeholder="Nội dung..." />
        <ImageInput value={brand.storyImage} onChange={v => setBrand({ ...brand, storyImage: v })} label="Ảnh minh họa" />
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Số năm kinh nghiệm</label>
          <input value={brand.yearsExperience} onChange={e => setBrand({ ...brand, yearsExperience: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm w-24" />
        </div>
      </div>

      {/* Values */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground">💎 Giá trị cốt lõi</h4>
          <button onClick={() => setBrand({ ...brand, values: [...brand.values, { icon: '⭐', title: '', desc: '' }] })}
            className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Thêm</button>
        </div>
        {brand.values.map((v, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input value={v.icon} onChange={e => { const n = [...brand.values]; n[i] = { ...v, icon: e.target.value }; setBrand({ ...brand, values: n }); }}
              className="w-12 px-2 py-2 rounded-lg border border-border bg-background text-sm text-center" placeholder="🏅" />
            <input value={v.title} onChange={e => { const n = [...brand.values]; n[i] = { ...v, title: e.target.value }; setBrand({ ...brand, values: n }); }}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Tiêu đề" />
            <input value={v.desc} onChange={e => { const n = [...brand.values]; n[i] = { ...v, desc: e.target.value }; setBrand({ ...brand, values: n }); }}
              className="flex-[2] px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Mô tả" />
            <button onClick={() => setBrand({ ...brand, values: brand.values.filter((_, j) => j !== i) })}
              className="text-destructive p-2"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground">📅 Hành trình phát triển</h4>
          <button onClick={() => setBrand({ ...brand, timeline: [...brand.timeline, { year: '', title: '', desc: '' }] })}
            className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Thêm</button>
        </div>
        {brand.timeline.map((t, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input value={t.year} onChange={e => { const n = [...brand.timeline]; n[i] = { ...t, year: e.target.value }; setBrand({ ...brand, timeline: n }); }}
              className="w-16 px-2 py-2 rounded-lg border border-border bg-background text-sm text-center font-bold" placeholder="2024" />
            <input value={t.title} onChange={e => { const n = [...brand.timeline]; n[i] = { ...t, title: e.target.value }; setBrand({ ...brand, timeline: n }); }}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Tiêu đề" />
            <input value={t.desc} onChange={e => { const n = [...brand.timeline]; n[i] = { ...t, desc: e.target.value }; setBrand({ ...brand, timeline: n }); }}
              className="flex-[2] px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Mô tả" />
            <button onClick={() => setBrand({ ...brand, timeline: brand.timeline.filter((_, j) => j !== i) })}
              className="text-destructive p-2"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {/* Certifications */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground">🏆 Chứng nhận</h4>
          <button onClick={() => setBrand({ ...brand, certifications: [...brand.certifications, { icon: '🏅', title: '', desc: '' }] })}
            className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Thêm</button>
        </div>
        {brand.certifications.map((c, i) => (
          <div key={i} className="flex gap-2 items-start">
            <input value={c.icon} onChange={e => { const n = [...brand.certifications]; n[i] = { ...c, icon: e.target.value }; setBrand({ ...brand, certifications: n }); }}
              className="w-12 px-2 py-2 rounded-lg border border-border bg-background text-sm text-center" placeholder="🏅" />
            <input value={c.title} onChange={e => { const n = [...brand.certifications]; n[i] = { ...c, title: e.target.value }; setBrand({ ...brand, certifications: n }); }}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Tiêu đề" />
            <input value={c.desc} onChange={e => { const n = [...brand.certifications]; n[i] = { ...c, desc: e.target.value }; setBrand({ ...brand, certifications: n }); }}
              className="flex-[2] px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Mô tả" />
            <button onClick={() => setBrand({ ...brand, certifications: brand.certifications.filter((_, j) => j !== i) })}
              className="text-destructive p-2"><X className="h-4 w-4" /></button>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h4 className="font-bold text-foreground">📢 CTA cuối trang</h4>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề CTA</label>
          <input value={brand.ctaTitle} onChange={e => setBrand({ ...brand, ctaTitle: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Mô tả CTA</label>
          <input value={brand.ctaDescription} onChange={e => setBrand({ ...brand, ctaDescription: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
      </div>
    </div>
  );
}

// ============ SIMPLE EDITOR (for banner, policy, contact, footer) ============
function SimpleEditor({ contentKey }: { contentKey: string }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const labels: Record<string, string> = {
    banner: '🖼️ Banner trang chủ',
    policy: '📋 Chính sách bán hàng',
    contact: '📞 Thông tin liên hệ',
    footer: '🔻 Nội dung Footer',
  };

  useEffect(() => {
    loadContent(contentKey).then(d => {
      setContent(d ? (typeof d === 'string' ? d : JSON.stringify(d, null, 2)) : '');
      setLoading(false);
    });
  }, [contentKey]);

  const save = async () => {
    setSaving(true);
    let val: any;
    try { val = JSON.parse(content); } catch { val = content; }
    await saveContent(contentKey, val);
    setSaving(false);
  };

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">{labels[contentKey] || contentKey}</h3>
        <button onClick={save} disabled={saving}
          className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
      {loading ? (
        <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>
      ) : (
        <textarea value={content} onChange={e => setContent(e.target.value)} rows={20}
          className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm font-mono resize-y"
          placeholder="Nhập nội dung JSON hoặc text..." />
      )}
    </div>
  );
}
