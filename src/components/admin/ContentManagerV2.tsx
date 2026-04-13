import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Save, Plus, Edit, Trash2, Image, X, RefreshCw, Eye, EyeOff, ChevronDown, ChevronUp, Upload, Video } from 'lucide-react';
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
  content?: string[];
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

interface PolicySection {
  title: string;
  icon: string;
  intro?: string;
  items: { label: string; desc: string }[];
}

interface ContactInfo {
  hotline: string;
  zalo: string;
  email: string;
  hours: string;
  address: string;
}

type ContentSection = 'promotions' | 'recipes' | 'news' | 'blog' | 'brand' | 'hero' | 'policy' | 'contact' | 'footer' | 'ticker' | 'exit_popup' | 'why_choose' | 'promo_banners' | 'video_section';

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

// ============ UPLOAD HELPER ============
async function uploadToStorage(file: File, folder: string): Promise<string | null> {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('site-media').upload(path, file);
  if (error) { toast.error('Upload lỗi: ' + error.message); return null; }
  const { data: pub } = supabase.storage.from('site-media').getPublicUrl(path);
  return pub.publicUrl;
}

// ============ IMAGE INPUT (with upload) ============
function ImageInput({ value, onChange, label }: { value: string; onChange: (v: string) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadToStorage(file, 'content');
    if (url) onChange(url);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      {label && <label className="block text-xs font-bold text-foreground mb-1">{label}</label>}
      <div className="flex gap-2 items-center">
        <input value={value} onChange={e => onChange(e.target.value)} placeholder="URL ảnh..."
          className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} className="hidden" />
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
          <Upload className="h-3 w-3" /> {uploading ? '...' : 'Upload'}
        </button>
        {value && <img src={value} alt="" className="w-10 h-10 rounded object-cover border border-border" />}
      </div>
    </div>
  );
}

// ============ MULTI IMAGE INPUT (with upload) ============
function MultiImageInput({ images, onChange, label }: { images: string[]; onChange: (v: string[]) => void; label?: string }) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadToStorage(file, 'content');
      if (url) urls.push(url);
    }
    onChange([...images, ...urls]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  return (
    <div>
      {label && <label className="block text-xs font-bold text-foreground mb-1">{label}</label>}
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((img, i) => (
          <div key={i} className="relative group">
            <img src={img} alt="" className="w-20 h-20 rounded-lg object-cover border border-border" />
            <button type="button" onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute -top-1.5 -right-1.5 bg-destructive text-destructive-foreground rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity">
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
      <input ref={fileRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
      <div className="flex gap-2">
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="text-xs bg-primary text-primary-foreground px-3 py-1.5 rounded-lg font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
          <Upload className="h-3 w-3" /> {uploading ? 'Đang tải...' : 'Upload ảnh'}
        </button>
        <button type="button" onClick={() => onChange([...images, ''])} className="text-xs text-primary hover:underline flex items-center gap-1">
          <Plus className="h-3 w-3" /> Dán URL
        </button>
      </div>
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
    { key: 'hero', label: '🎬 Hero Banner', desc: 'Video nền & slide trang chủ' },
    { key: 'video_section', label: '📹 Video phóng sự', desc: 'Video + mô tả dưới hero' },
    { key: 'promo_banners', label: '🖼️ Banner QC', desc: 'Ảnh quảng cáo trang chủ' },
    { key: 'promotions', label: '🎉 Khuyến mãi', desc: 'Flash sale, ưu đãi mua nhiều' },
    { key: 'why_choose', label: '✅ 7 Lý do', desc: '7 lý do chọn Giang Nguyên' },
    { key: 'recipes', label: '🍳 Món ngon', desc: 'Công thức chế biến hải sản' },
    { key: 'news', label: '📰 Tin tức', desc: 'Tin tức & sự kiện' },
    { key: 'blog', label: '📚 Blog', desc: 'Bài viết kiến thức' },
    { key: 'brand', label: '📖 Giới thiệu', desc: 'Câu chuyện thương hiệu' },
    { key: 'policy', label: '📋 Chính sách', desc: 'Chính sách bán hàng' },
    { key: 'contact', label: '📞 Liên hệ', desc: 'Thông tin liên hệ' },
    { key: 'ticker', label: '📢 Dòng chạy', desc: 'Dòng chữ chạy đầu trang' },
    { key: 'exit_popup', label: '🎯 Popup thoát', desc: 'Popup KHOAN ĐÃ!' },
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
        {section === 'hero' && <HeroEditor />}
        {section === 'policy' && <PolicyEditor />}
        {section === 'contact' && <ContactEditor />}
        {section === 'ticker' && <TickerEditor />}
        {section === 'exit_popup' && <ExitPopupEditor />}
        {section === 'why_choose' && <WhyChooseEditor />}
        {section === 'promo_banners' && <PromoBannersEditor />}
        {section === 'video_section' && <VideoSectionEditor />}
        {section === 'footer' && <SimpleEditor contentKey="footer" />}
      </div>
    </div>
  );
}

// ============ PROMOTIONS EDITOR (Flash Sale + Bulk Deals + Promo Items) ============
interface FlashSaleConfig {
  title: string;
  subtitle: string;
  maxDiscount: string;
  productSlugs: string[];
  isActive: boolean;
}

interface BulkDeal {
  id: string;
  min: number;
  discount: number;
  label: string;
}

interface HotelPromo {
  title: string;
  description: string;
  linkText: string;
  linkUrl: string;
  isActive: boolean;
}

function PromotionsEditor() {
  const [tab, setTab] = useState<'flash' | 'bulk' | 'hotel' | 'items'>('flash');
  const [flashSale, setFlashSale] = useState<FlashSaleConfig>({ title: '⚡ FLASH SALE HÔM NAY', subtitle: 'Giảm đến 25% – Chỉ hôm nay – Số lượng có hạn!', maxDiscount: '25', productSlugs: [], isActive: true });
  const [bulkDeals, setBulkDeals] = useState<BulkDeal[]>([
    { id: genId(), min: 2, discount: 5, label: 'Mua 2 giảm 5%' },
    { id: genId(), min: 3, discount: 10, label: 'Mua 3 giảm 10%' },
    { id: genId(), min: 5, discount: 15, label: 'Mua 5+ giảm 15%' },
  ]);
  const [hotelPromo, setHotelPromo] = useState<HotelPromo>({ title: 'Ưu đãi riêng khách TUẤN ĐẠT LUXURY HOTEL', description: 'Khách lưu trú được giảm thêm 5–10% trên tất cả sản phẩm. Giao tận phòng trong 30 phút!', linkText: 'Xem ưu đãi khách sạn →', linkUrl: '/khach-san', isActive: true });
  const [items, setItems] = useState<PromotionItem[]>([]);
  const [editing, setEditing] = useState<PromotionItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      loadContent('promo_flash_sale'),
      loadContent('promo_bulk_deals'),
      loadContent('promo_hotel'),
      loadContent('content_promotions'),
    ]).then(([fs, bd, hp, pi]) => {
      if (fs) setFlashSale(fs);
      if (bd) setBulkDeals(bd);
      if (hp) setHotelPromo(hp);
      if (pi) setItems(pi);
      setLoading(false);
    });
  }, []);

  const saveFlash = () => saveContent('promo_flash_sale', flashSale);
  const saveBulk = () => saveContent('promo_bulk_deals', bulkDeals);
  const saveHotel = () => saveContent('promo_hotel', hotelPromo);
  const saveItems = async (newItems: PromotionItem[]) => { await saveContent('content_promotions', newItems); setItems(newItems); };

  const handleSaveItem = (item: PromotionItem) => {
    const exists = items.find(i => i.id === item.id);
    saveItems(exists ? items.map(i => i.id === item.id ? item : i) : [...items, item]);
    setEditing(null);
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  const tabs = [
    { key: 'flash' as const, label: '⚡ Flash Sale' },
    { key: 'bulk' as const, label: '🏷️ Mua nhiều giảm giá' },
    { key: 'hotel' as const, label: '🏨 Ưu đãi khách sạn' },
    { key: 'items' as const, label: '🎁 Khuyến mãi khác' },
  ];

  return (
    <div>
      <h3 className="font-bold text-foreground text-lg mb-4">🎉 Quản lý khuyến mãi</h3>
      <div className="flex gap-1 mb-6 flex-wrap">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-3 py-2 rounded-lg text-xs font-bold transition-colors ${tab === t.key ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* FLASH SALE */}
      {tab === 'flash' && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm font-bold text-foreground">Bật Flash Sale</label>
            <button onClick={() => setFlashSale({ ...flashSale, isActive: !flashSale.isActive })}
              className={`w-10 h-5 rounded-full transition-colors relative ${flashSale.isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${flashSale.isActive ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề</label>
              <input value={flashSale.title} onChange={e => setFlashSale({ ...flashSale, title: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Giảm tối đa (%)</label>
              <input value={flashSale.maxDiscount} onChange={e => setFlashSale({ ...flashSale, maxDiscount: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Mô tả phụ</label>
            <input value={flashSale.subtitle} onChange={e => setFlashSale({ ...flashSale, subtitle: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <ListInput items={flashSale.productSlugs} onChange={v => setFlashSale({ ...flashSale, productSlugs: v })}
            label="Slug sản phẩm Flash Sale (để trống = lấy 4 SP đầu)" placeholder="vd: muc-kho-loai-1" />
          <button onClick={saveFlash} className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
            <Save className="h-4 w-4" /> Lưu Flash Sale
          </button>
        </div>
      )}

      {/* BULK DEALS */}
      {tab === 'bulk' && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-4">
          <p className="text-xs text-muted-foreground mb-2">Cấu hình các mức giảm giá khi mua nhiều sản phẩm</p>
          {bulkDeals.map((deal, i) => (
            <div key={deal.id} className="flex items-center gap-3 bg-muted/50 p-3 rounded-lg">
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-foreground mb-0.5">Từ (SP)</label>
                  <input type="number" value={deal.min} onChange={e => { const n = [...bulkDeals]; n[i] = { ...deal, min: Number(e.target.value) }; setBulkDeals(n); }}
                    className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground mb-0.5">Giảm (%)</label>
                  <input type="number" value={deal.discount} onChange={e => { const n = [...bulkDeals]; n[i] = { ...deal, discount: Number(e.target.value) }; setBulkDeals(n); }}
                    className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-foreground mb-0.5">Nhãn</label>
                  <input value={deal.label} onChange={e => { const n = [...bulkDeals]; n[i] = { ...deal, label: e.target.value }; setBulkDeals(n); }}
                    className="w-full px-2 py-1.5 rounded border border-border bg-background text-sm" />
                </div>
              </div>
              <button onClick={() => setBulkDeals(bulkDeals.filter((_, j) => j !== i))} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          <div className="flex gap-2">
            <button onClick={() => setBulkDeals([...bulkDeals, { id: genId(), min: bulkDeals.length + 2, discount: (bulkDeals.length + 1) * 5, label: '' }])}
              className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Thêm mức</button>
          </div>
          <button onClick={saveBulk} className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
            <Save className="h-4 w-4" /> Lưu mức giảm giá
          </button>
        </div>
      )}

      {/* HOTEL PROMO */}
      {tab === 'hotel' && (
        <div className="bg-card rounded-xl border border-border p-6 space-y-3">
          <div className="flex items-center gap-3 mb-2">
            <label className="text-sm font-bold text-foreground">Hiển thị</label>
            <button onClick={() => setHotelPromo({ ...hotelPromo, isActive: !hotelPromo.isActive })}
              className={`w-10 h-5 rounded-full transition-colors relative ${hotelPromo.isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
              <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${hotelPromo.isActive ? 'left-5' : 'left-0.5'}`} />
            </button>
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề</label>
            <input value={hotelPromo.title} onChange={e => setHotelPromo({ ...hotelPromo, title: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Mô tả</label>
            <textarea value={hotelPromo.description} onChange={e => setHotelPromo({ ...hotelPromo, description: e.target.value })} rows={3}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Text nút</label>
              <input value={hotelPromo.linkText} onChange={e => setHotelPromo({ ...hotelPromo, linkText: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Link</label>
              <input value={hotelPromo.linkUrl} onChange={e => setHotelPromo({ ...hotelPromo, linkUrl: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          </div>
          <button onClick={saveHotel} className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5">
            <Save className="h-4 w-4" /> Lưu
          </button>
        </div>
      )}

      {/* PROMO ITEMS */}
      {tab === 'items' && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">Khuyến mãi tùy chỉnh ({items.length})</p>
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
                  <button onClick={() => { if (confirm('Xóa?')) saveItems(items.filter(i => i.id !== item.id)); }} className="p-1.5 hover:bg-destructive/10 rounded text-destructive"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
            {items.length === 0 && <p className="text-center py-8 text-muted-foreground text-sm">Chưa có. Bấm "Thêm" để tạo mới.</p>}
          </div>
        </div>
      )}
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
    id: genId(), title: '', excerpt: '', content: [''], category: 'Hàng mới về', image: '',
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
            <label className="block text-xs font-bold text-foreground mb-1">Tóm tắt</label>
            <textarea value={editing.excerpt} onChange={e => setEditing({ ...editing, excerpt: e.target.value })} rows={2}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <ListInput items={editing.content || ['']} onChange={v => setEditing({ ...editing, content: v })} label="Nội dung chi tiết (mỗi dòng = 1 đoạn)" placeholder="Đoạn văn..." />
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
              <button onClick={() => setEditing({ ...item, content: item.content || [item.excerpt] })} className="p-1.5 hover:bg-muted rounded text-primary"><Edit className="h-4 w-4" /></button>
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
    heroImage: '', heroTitle: 'Về Giang Nguyên Group',
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

// ============ HERO EDITOR WITH VIDEO UPLOAD ============
interface HeroSlide {
  title: string;
  subtitle: string;
  slogan: string;
}
interface HeroData {
  videoUrl: string;
  slides: HeroSlide[];
}

function HeroEditor() {
  const [hero, setHero] = useState<HeroData>({
    videoUrl: '',
    slides: [
      { title: 'Hải Sản Khô Cao Cấp Sầm Sơn', subtitle: '100% hải sản tự nhiên – Không hóa chất', slogan: 'Chọn biển sạch – Chọn Giang Nguyen' },
    ],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadContent('hero_banner').then(d => { if (d) setHero(d); setLoading(false); });
  }, []);

  const save = async () => { setSaving(true); await saveContent('hero_banner', hero); setSaving(false); };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Video tối đa 50MB');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `hero/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('site-media').upload(path, file);
    if (error) {
      toast.error('Lỗi upload: ' + error.message);
    } else {
      const { data } = supabase.storage.from('site-media').getPublicUrl(path);
      setHero(h => ({ ...h, videoUrl: data.publicUrl }));
      toast.success('Upload video thành công!');
    }
    setUploading(false);
  };

  const updateSlide = (i: number, field: keyof HeroSlide, val: string) => {
    const slides = [...hero.slides];
    slides[i] = { ...slides[i], [field]: val };
    setHero({ ...hero, slides });
  };

  const addSlide = () => setHero({ ...hero, slides: [...hero.slides, { title: '', subtitle: '', slogan: '' }] });
  const removeSlide = (i: number) => setHero({ ...hero, slides: hero.slides.filter((_, j) => j !== i) });

  if (loading) return <p className="text-muted-foreground">Đang tải...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-foreground">🎬 Hero Banner</h3>
        <button onClick={save} disabled={saving}
          className="bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:opacity-90 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </button>
      </div>

      {/* Video */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-3">
        <h4 className="font-bold text-foreground">🎥 Video nền</h4>
        <p className="text-xs text-muted-foreground">Upload video MP4 hoặc dán URL. Để trống sẽ hiển thị gradient.</p>
        
        <div className="flex gap-2">
          <label className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg border-2 border-dashed cursor-pointer transition-colors ${uploading ? 'border-primary bg-primary/5' : 'border-border hover:border-primary'}`}>
            <Upload className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">{uploading ? 'Đang upload...' : 'Upload video MP4'}</span>
            <input type="file" accept="video/mp4,video/webm" onChange={handleVideoUpload} className="hidden" disabled={uploading} />
          </label>
        </div>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Hoặc dán URL video</label>
          <input value={hero.videoUrl} onChange={e => setHero({ ...hero, videoUrl: e.target.value })}
            placeholder="https://example.com/video.mp4"
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>

        {hero.videoUrl && (
          <div className="space-y-2">
            <video src={hero.videoUrl} muted autoPlay loop playsInline className="w-full max-h-40 rounded-lg object-cover border border-border" />
            <button onClick={() => setHero({ ...hero, videoUrl: '' })} className="text-xs text-destructive hover:underline flex items-center gap-1">
              <X className="h-3 w-3" /> Xóa video
            </button>
          </div>
        )}
      </div>

      {/* Slides */}
      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-foreground">📝 Slide nội dung ({hero.slides.length})</h4>
          <button onClick={addSlide} className="bg-primary/10 text-primary px-3 py-1 rounded-lg text-xs font-bold flex items-center gap-1 hover:bg-primary/20">
            <Plus className="h-3 w-3" /> Thêm slide
          </button>
        </div>

        {hero.slides.map((s, i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-2 relative">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-muted-foreground">Slide {i + 1}</span>
              {hero.slides.length > 1 && (
                <button onClick={() => removeSlide(i)} className="text-destructive hover:bg-destructive/10 p-1 rounded">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề</label>
              <input value={s.title} onChange={e => updateSlide(i, 'title', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Mô tả</label>
              <input value={s.subtitle} onChange={e => updateSlide(i, 'subtitle', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Slogan</label>
              <input value={s.slogan} onChange={e => updateSlide(i, 'slogan', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============ POLICY EDITOR ============
const DEFAULT_POLICY: PolicySection[] = [
  { title: 'Chính sách giao hàng', icon: '🚚', items: [
    { label: 'Khu vực Sầm Sơn – Thanh Hóa', desc: 'Giao nhanh 2–4 giờ' },
    { label: 'Toàn quốc', desc: '1–3 ngày (tùy khu vực)' },
    { label: 'Miễn phí vận chuyển', desc: 'Đơn từ 500.000₫' },
    { label: 'Kiểm tra hàng', desc: 'Trước khi thanh toán' },
    { label: 'Giao hỏa tốc', desc: 'Theo yêu cầu khách hàng' },
  ]},
  { title: 'Chính sách vận chuyển', icon: '📦', items: [
    { label: 'Đóng gói hút chân không', desc: 'Đảm bảo vệ sinh an toàn thực phẩm' },
    { label: 'Bảo quản khi vận chuyển', desc: 'Giữ khô, sạch, không ảnh hưởng chất lượng' },
    { label: 'Đơn vị vận chuyển uy tín', desc: 'Giao hàng nhanh, có tracking' },
    { label: 'Lỗi vận chuyển', desc: 'Shop chịu 100% trách nhiệm' },
  ]},
  { title: 'Chính sách bảo hành', icon: '🛡️', intro: 'GIANG NGUYÊN GROUP cam kết: 100% hải sản tự nhiên – Không hóa chất.', items: [
    { label: 'Đổi 1–1', desc: 'Sản phẩm lỗi, không đúng mô tả' },
    { label: 'Thời gian hỗ trợ', desc: 'Trong vòng 48h từ khi nhận hàng' },
    { label: 'Hoàn tiền 100%', desc: 'Nếu khách không hài lòng' },
    { label: 'Cam kết mạnh', desc: 'Sai hoàn tiền gấp đôi' },
  ]},
  { title: 'Chính sách bảo mật', icon: '🔒', items: [
    { label: 'Không chia sẻ thông tin', desc: 'Cho bất kỳ bên thứ 3 nào' },
    { label: 'Chỉ sử dụng để', desc: 'Xử lý đơn hàng & chăm sóc khách hàng' },
    { label: 'Bảo mật tuyệt đối', desc: 'Thông tin cá nhân, SĐT, địa chỉ' },
  ]},
  { title: 'Chính sách thanh toán', icon: '💳', items: [
    { label: 'COD', desc: 'Kiểm tra hàng trước khi trả tiền' },
    { label: 'Chuyển khoản', desc: 'VietinBank – 104002912582 – VAN THI MINH LINH' },
    { label: 'QR SePay', desc: 'Nhanh chóng, tiện lợi' },
    { label: 'Nội dung CK', desc: 'SEVQR + mã đơn hàng' },
  ]},
];

function PolicyEditor() {
  const [sections, setSections] = useState<PolicySection[]>(DEFAULT_POLICY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent('content_policy').then(d => { if (d) setSections(d); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true);
    await saveContent('content_policy', sections);
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground text-lg">📋 Chính sách bán hàng</h3>
        <div className="flex gap-2">
          <button onClick={() => setSections([...sections, { title: '', icon: '📋', items: [{ label: '', desc: '' }] }])}
            className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Thêm mục</button>
          <button onClick={save} disabled={saving}
            className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>

      {sections.map((sec, si) => (
        <div key={si} className="bg-card rounded-xl border border-border p-5 space-y-3">
          <div className="flex items-center gap-2">
            <input value={sec.icon} onChange={e => { const n = [...sections]; n[si] = { ...sec, icon: e.target.value }; setSections(n); }}
              className="w-12 px-2 py-2 rounded-lg border border-border bg-background text-sm text-center" />
            <input value={sec.title} onChange={e => { const n = [...sections]; n[si] = { ...sec, title: e.target.value }; setSections(n); }}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-bold" placeholder="Tiêu đề mục" />
            <button onClick={() => setSections(sections.filter((_, j) => j !== si))} className="text-destructive p-2"><Trash2 className="h-4 w-4" /></button>
          </div>
          {sec.intro !== undefined && (
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Giới thiệu (tùy chọn)</label>
              <input value={sec.intro || ''} onChange={e => { const n = [...sections]; n[si] = { ...sec, intro: e.target.value }; setSections(n); }}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            </div>
          )}
          {sec.items.map((item, ii) => (
            <div key={ii} className="flex gap-2 items-start">
              <span className="text-xs text-muted-foreground pt-2.5 w-5">✔</span>
              <input value={item.label} onChange={e => { const n = [...sections]; n[si].items[ii] = { ...item, label: e.target.value }; setSections([...n]); }}
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm font-medium" placeholder="Tiêu đề" />
              <input value={item.desc} onChange={e => { const n = [...sections]; n[si].items[ii] = { ...item, desc: e.target.value }; setSections([...n]); }}
                className="flex-[2] px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Mô tả chi tiết" />
              <button onClick={() => { const n = [...sections]; n[si].items = n[si].items.filter((_, j) => j !== ii); setSections(n); }}
                className="text-destructive p-1"><X className="h-3 w-3" /></button>
            </div>
          ))}
          <button onClick={() => { const n = [...sections]; n[si].items.push({ label: '', desc: '' }); setSections([...n]); }}
            className="text-xs text-primary hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Thêm mục con</button>
        </div>
      ))}
    </div>
  );
}

// ============ CONTACT EDITOR ============
const DEFAULT_CONTACT: ContactInfo = {
  hotline: '093.356.2286',
  zalo: '093.356.2286',
  email: 'giangnguyengroup@gmail.com',
  hours: '7h – 17h hàng ngày',
  address: 'Sầm Sơn, Thanh Hóa',
};

function ContactEditor() {
  const [contact, setContact] = useState<ContactInfo>(DEFAULT_CONTACT);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent('content_contact').then(d => { if (d) setContact(d); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true);
    await saveContent('content_contact', contact);
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-foreground text-lg">📞 Thông tin liên hệ</h3>
        <button onClick={save} disabled={saving}
          className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>

      <div className="bg-card rounded-xl border border-border p-5 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">📞 Hotline</label>
            <input value={contact.hotline} onChange={e => setContact({ ...contact, hotline: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">💬 Zalo</label>
            <input value={contact.zalo} onChange={e => setContact({ ...contact, zalo: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">📧 Email</label>
            <input value={contact.email} onChange={e => setContact({ ...contact, email: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">🕐 Giờ mở cửa</label>
            <input value={contact.hours} onChange={e => setContact({ ...contact, hours: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-bold text-foreground mb-1">📍 Địa chỉ</label>
            <input value={contact.address} onChange={e => setContact({ ...contact, address: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ TICKER EDITOR ============
function TickerEditor() {
  const [items, setItems] = useState<string[]>([
    '🔥 FLASH SALE hải sản khô Sầm Sơn – Giảm 10% đơn đầu tiên',
    '🚚 FREE SHIP toàn quốc đơn từ 500K',
    '⭐ Cam kết 100% hải sản sạch, hoàn tiền nếu không hài lòng',
    '🎁 Mua 2 tặng 1 Nem chua Thanh Hóa',
  ]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent('ticker_banner').then(d => {
      if (d && Array.isArray(d)) setItems(d);
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await saveContent('ticker_banner', items.filter(i => i.trim()));
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">📢 Dòng chữ chạy đầu trang</h3>
        <button onClick={save} disabled={saving}
          className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
      <p className="text-xs text-muted-foreground mb-3">Mỗi dòng là một tin nhắn chạy. Có thể thêm emoji 🔥🚚⭐🎁</p>
      {items.map((item, i) => (
        <div key={i} className="flex gap-2 mb-2">
          <span className="text-xs text-muted-foreground pt-2.5 w-5">{i + 1}.</span>
          <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; setItems(n); }}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Nội dung dòng chạy..." />
          <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))}
            className="text-destructive hover:bg-destructive/10 p-1 rounded"><X className="h-3 w-3" /></button>
        </div>
      ))}
      <button type="button" onClick={() => setItems([...items, ''])} className="text-xs text-primary hover:underline flex items-center gap-1 mt-1">
        <Plus className="h-3 w-3" /> Thêm dòng
      </button>
    </div>
  );
}

// ============ EXIT POPUP EDITOR ============
function ExitPopupEditor() {
  const [config, setConfig] = useState({
    title: 'KHOAN ĐÃ!',
    subtitle: 'Đừng bỏ lỡ ưu đãi này nhé!',
    discountText: 'Giảm thêm 5% cho bạn!',
    couponCode: 'QUAYLAIGIAM5',
    buttonText: 'XEM SẢN PHẨM NGAY',
    isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent('exit_popup').then(d => {
      if (d) setConfig({ ...config, ...d });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await saveContent('exit_popup', config);
    setSaving(false);
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">🎯 Popup "KHOAN ĐÃ!"</h3>
        <button onClick={save} disabled={saving}
          className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>

      <div className="space-y-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={config.isActive} onChange={e => setConfig({ ...config, isActive: e.target.checked })}
            className="accent-primary" />
          <span className="text-sm font-bold text-foreground">{config.isActive ? '✅ Đang bật' : '❌ Đang tắt'}</span>
        </label>

        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề</label>
          <input value={config.title} onChange={e => setConfig({ ...config, title: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Phụ đề</label>
          <input value={config.subtitle} onChange={e => setConfig({ ...config, subtitle: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Nội dung ưu đãi</label>
          <input value={config.discountText} onChange={e => setConfig({ ...config, discountText: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Mã giảm giá hiển thị</label>
          <input value={config.couponCode} onChange={e => setConfig({ ...config, couponCode: e.target.value.toUpperCase() })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm uppercase" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Text nút bấm</label>
          <input value={config.buttonText} onChange={e => setConfig({ ...config, buttonText: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>

        {/* Preview */}
        <div className="mt-4 border border-dashed border-primary/30 rounded-xl p-4 bg-primary/5">
          <p className="text-xs text-muted-foreground mb-2 font-bold">Xem trước:</p>
          <div className="text-center">
            <p className="text-2xl mb-1">😢</p>
            <p className="font-black text-foreground">{config.title}</p>
            <p className="text-sm text-muted-foreground">{config.subtitle}</p>
            <p className="text-base font-bold text-foreground mt-2">{config.discountText}</p>
            <p className="text-sm text-muted-foreground">Dùng mã <strong className="text-primary">{config.couponCode}</strong></p>
            <div className="mt-2 ocean-gradient text-primary-foreground rounded-lg py-2 text-sm font-bold">{config.buttonText}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ WHY CHOOSE US EDITOR ============
function WhyChooseEditor() {
  const [heading, setHeading] = useState('7 LÝ DO NÊN CHỌN GIANG NGUYÊN SEAFOOD');
  const [reasons, setReasons] = useState<{ icon: string; title: string; details: string[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const defaultReasons = [
    { icon: 'package', title: 'ĐA DẠNG HÀNG HÓA', details: ['Hải sản TƯƠI SỐNG, ĐÔNG LẠNH, KHÔ đa dạng chủng loại', 'Hơn 50+ sản phẩm chính gốc Sầm Sơn'] },
    { icon: 'shield', title: 'CAM KẾT CHẤT LƯỢNG', details: ['100% hải sản sạch, không hóa chất', 'HOÀN TIỀN NHANH CHÓNG nếu không đạt yêu cầu'] },
    { icon: 'truck', title: 'THANH TOÁN LINH HOẠT', details: ['COD, chuyển khoản, quét QR tiện lợi', 'Hỗ trợ cọc 50% cho đơn hàng từ xa'] },
    { icon: 'award', title: 'QUYỀN LỢI KHÁCH HÀNG', details: ['Tích điểm đổi quà', 'Giảm thêm 5% khách thân thiết'] },
    { icon: 'refresh', title: 'DỄ DÀNG MUA SẮM', details: ['Website thân thiện mọi thiết bị', 'Đặt hàng online 24/7'] },
    { icon: 'headphones', title: 'GIAO HÀNG NHANH', details: ['Giao HỎA TỐC nội thành 2H', 'MIỄN PHÍ VẬN CHUYỂN đơn từ 500K'] },
    { icon: 'leaf', title: 'NGUỒN GỐC SẢN PHẨM', details: ['100% NGUỒN GỐC RÕ RÀNG', 'Thu mua trực tiếp từ ngư dân Sầm Sơn'] },
  ];

  useEffect(() => {
    loadContent('why_choose_us').then(d => {
      if (d) {
        setHeading(d.heading || heading);
        setReasons(d.reasons?.length ? d.reasons : defaultReasons);
      } else {
        setReasons(defaultReasons);
      }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await saveContent('why_choose_us', { heading, reasons });
    setSaving(false);
  };

  const icons = ['package', 'shield', 'truck', 'award', 'refresh', 'headphones', 'leaf'];

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">✅ 7 Lý do chọn Giang Nguyên</h3>
        <button onClick={save} disabled={saving} className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề</label>
          <input value={heading} onChange={e => setHeading(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        {reasons.map((r, i) => (
          <div key={i} className="border border-border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-foreground">Lý do #{i + 1}</span>
              <button onClick={() => setReasons(reasons.filter((_, j) => j !== i))} className="text-destructive hover:underline text-xs">Xóa</button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold mb-1">Icon</label>
                <select value={r.icon} onChange={e => { const u = [...reasons]; u[i] = { ...u[i], icon: e.target.value }; setReasons(u); }} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  {icons.map(ic => <option key={ic} value={ic}>{ic}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold mb-1">Tiêu đề</label>
                <input value={r.title} onChange={e => { const u = [...reasons]; u[i] = { ...u[i], title: e.target.value }; setReasons(u); }} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
              </div>
            </div>
            <ListInput items={r.details} onChange={v => { const u = [...reasons]; u[i] = { ...u[i], details: v }; setReasons(u); }} label="Chi tiết" placeholder="Mô tả..." />
          </div>
        ))}
        <button onClick={() => setReasons([...reasons, { icon: 'package', title: '', details: [''] }])} className="text-sm text-primary font-bold hover:underline flex items-center gap-1">
          <Plus className="h-4 w-4" /> Thêm lý do
        </button>
      </div>
    </div>
  );
}

// ============ VIDEO SECTION EDITOR ============
function VideoSectionEditor() {
  const [data, setData] = useState({
    videoUrl: '', title: 'Hành trình hải sản sạch từ biển Sầm Sơn',
    features: ['Đánh bắt trực tiếp từ biển Sầm Sơn', 'Phơi nắng tự nhiên – Không sấy công nghiệp', 'Không hóa chất – An toàn tuyệt đối'],
    ctaText: 'Xem sản phẩm ngay', ctaLink: '/san-pham', isActive: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadContent('video_section').then(d => {
      if (d) setData(d);
      setLoading(false);
    });
  }, []);

  const save = async () => { setSaving(true); await saveContent('video_section', data); setSaving(false); };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error('Video tối đa 50MB'); return; }
    setUploading(true);
    const ext = file.name.split('.').pop() || 'mp4';
    const path = `videos/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await supabase.storage.from('site-media').upload(path, file);
    if (error) { toast.error('Upload lỗi: ' + error.message); setUploading(false); return; }
    const { data: pub } = supabase.storage.from('site-media').getPublicUrl(path);
    setData(d => ({ ...d, videoUrl: pub.publicUrl }));
    toast.success('Đã tải video lên!');
    setUploading(false);
    if (fileRef.current) fileRef.current.value = '';
  };

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">📹 Video phóng sự</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm font-bold text-foreground">Bật</label>
          <button onClick={() => setData(d => ({ ...d, isActive: !d.isActive }))}
            className={`w-10 h-5 rounded-full transition-colors relative ${data.isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}>
            <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${data.isActive ? 'left-5' : 'left-0.5'}`} />
          </button>
          <button onClick={save} disabled={saving} className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
            <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
          </button>
        </div>
      </div>
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Video (URL hoặc Upload)</label>
          <div className="flex gap-2 items-center">
            <input value={data.videoUrl} onChange={e => setData(d => ({ ...d, videoUrl: e.target.value }))}
              placeholder="URL video hoặc upload..." className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
            <input ref={fileRef} type="file" accept="video/*" onChange={handleVideoUpload} className="hidden" />
            <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
              className="px-3 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1 hover:opacity-90 disabled:opacity-50">
              <Video className="h-3 w-3" /> {uploading ? 'Đang tải...' : 'Upload video'}
            </button>
          </div>
          {data.videoUrl && (
            <video src={data.videoUrl} className="w-full max-w-md rounded-lg mt-2 border border-border" controls muted />
          )}
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Tiêu đề</label>
          <input value={data.title} onChange={e => setData(d => ({ ...d, title: e.target.value }))}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <ListInput items={data.features} onChange={v => setData(d => ({ ...d, features: v }))} label="Điểm nổi bật" placeholder="VD: Đánh bắt trực tiếp..." />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Nút CTA</label>
            <input value={data.ctaText} onChange={e => setData(d => ({ ...d, ctaText: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">Link CTA</label>
            <input value={data.ctaLink} onChange={e => setData(d => ({ ...d, ctaLink: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ============ PROMO BANNERS EDITOR ============
function PromoBannersEditor() {
  const [mainBanners, setMainBanners] = useState<{ image: string; link: string; alt: string }[]>([]);
  const [sideBanners, setSideBanners] = useState<{ image: string; link: string; alt: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadContent('promo_banners').then(d => {
      if (d) { setMainBanners(d.mainBanners || []); setSideBanners(d.sideBanners || []); }
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    await saveContent('promo_banners', { mainBanners, sideBanners });
    setSaving(false);
  };

  const renderBannerRow = (banner: { image: string; link: string; alt: string }, onChange: (b: any) => void, onRemove: () => void, idx: number) => (
    <div key={idx} className="border border-border rounded-lg p-3 space-y-2">
      <ImageInput value={banner.image} onChange={v => onChange({ ...banner, image: v })} label="Ảnh banner" />
      <input value={banner.link} onChange={e => onChange({ ...banner, link: e.target.value })} placeholder="Link (VD: /san-pham)" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
      <div className="flex justify-between items-center">
        <input value={banner.alt} onChange={e => onChange({ ...banner, alt: e.target.value })} placeholder="Mô tả ảnh" className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        <button onClick={onRemove} className="text-destructive hover:underline text-xs ml-2">Xóa</button>
      </div>
    </div>
  );

  if (loading) return <div className="flex justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-foreground">🖼️ Banner quảng cáo trang chủ</h3>
        <button onClick={save} disabled={saving} className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
      </div>
      <div className="space-y-6">
        <div>
          <h4 className="font-bold text-foreground text-sm mb-2">Banner chính (lớn, carousel)</h4>
          <div className="space-y-3">
            {mainBanners.map((b, i) => renderBannerRow(b, v => { const u = [...mainBanners]; u[i] = v; setMainBanners(u); }, () => setMainBanners(mainBanners.filter((_, j) => j !== i)), i))}
          </div>
          <button onClick={() => setMainBanners([...mainBanners, { image: '', link: '/san-pham', alt: '' }])} className="text-sm text-primary font-bold hover:underline flex items-center gap-1 mt-2">
            <Plus className="h-4 w-4" /> Thêm banner chính
          </button>
        </div>
        <div>
          <h4 className="font-bold text-foreground text-sm mb-2">Banner phụ (bên phải + hàng dưới)</h4>
          <div className="space-y-3">
            {sideBanners.map((b, i) => renderBannerRow(b, v => { const u = [...sideBanners]; u[i] = v; setSideBanners(u); }, () => setSideBanners(sideBanners.filter((_, j) => j !== i)), i))}
          </div>
          <button onClick={() => setSideBanners([...sideBanners, { image: '', link: '/', alt: '' }])} className="text-sm text-primary font-bold hover:underline flex items-center gap-1 mt-2">
            <Plus className="h-4 w-4" /> Thêm banner phụ
          </button>
        </div>
      </div>
    </div>
  );
}

function SimpleEditor({ contentKey }: { contentKey: string }) {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const labels: Record<string, string> = {
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
