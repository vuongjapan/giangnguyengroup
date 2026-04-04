import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, LogOut, Package, Store, Settings, Image, Eye, EyeOff, Save } from 'lucide-react';
import { toast } from 'sonner';

type Tab = 'products' | 'stores' | 'settings';

interface DBProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  unit: string;
  images: string[];
  category: string;
  grade: string;
  badges: string[];
  needs: string[];
  rating: number;
  stock: number;
  is_active: boolean;
  sort_order: number;
}

interface DBStore {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
}

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('products');
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [stores, setStores] = useState<DBStore[]>([]);
  const [editingProduct, setEditingProduct] = useState<DBProduct | null>(null);
  const [editingStore, setEditingStore] = useState<DBStore | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) {
      navigate('/admin/login');
    }
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) {
      fetchProducts();
      fetchStores();
    }
  }, [isAdmin]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('sort_order');
    if (data) setProducts(data as unknown as DBProduct[]);
  };

  const fetchStores = async () => {
    const { data } = await supabase.from('stores').select('*').order('sort_order');
    if (data) setStores(data as unknown as DBStore[]);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa sản phẩm này?')) return;
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) toast.error('Lỗi xóa sản phẩm');
    else { toast.success('Đã xóa'); fetchProducts(); }
  };

  const deleteStore = async (id: string) => {
    if (!confirm('Bạn chắc chắn muốn xóa cửa hàng này?')) return;
    const { error } = await supabase.from('stores').delete().eq('id', id);
    if (error) toast.error('Lỗi xóa cửa hàng');
    else { toast.success('Đã xóa'); fetchStores(); }
  };

  const toggleProductActive = async (product: DBProduct) => {
    const { error } = await supabase.from('products').update({ is_active: !product.is_active }).eq('id', product.id);
    if (error) toast.error('Lỗi cập nhật');
    else fetchProducts();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  if (!isAdmin) return null;

  const tabs = [
    { id: 'products' as Tab, label: 'Sản phẩm', icon: Package },
    { id: 'stores' as Tab, label: 'Cửa hàng', icon: Store },
    { id: 'settings' as Tab, label: 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Admin header */}
      <header className="ocean-gradient text-primary-foreground py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-black text-lg">GN SEAFOOD</Link>
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold">ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-primary-foreground/80 hidden sm:block">{user?.email}</span>
            <button onClick={() => { signOut(); navigate('/'); }} className="flex items-center gap-1 text-xs hover:underline">
              <LogOut className="h-3.5 w-3.5" /> Đăng xuất
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Products tab */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Quản lý sản phẩm ({products.length})</h2>
              <button
                onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Thêm SP
              </button>
            </div>

            {showProductForm && (
              <ProductForm
                product={editingProduct}
                onSave={() => { setShowProductForm(false); fetchProducts(); }}
                onCancel={() => setShowProductForm(false)}
              />
            )}

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left px-4 py-3 font-medium">Sản phẩm</th>
                      <th className="text-left px-4 py-3 font-medium">Danh mục</th>
                      <th className="text-right px-4 py-3 font-medium">Giá</th>
                      <th className="text-center px-4 py-3 font-medium">Tồn kho</th>
                      <th className="text-center px-4 py-3 font-medium">Trạng thái</th>
                      <th className="text-center px-4 py-3 font-medium">Hành động</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products.map(p => (
                      <tr key={p.id} className="hover:bg-muted/50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.images[0] && (
                              <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                            )}
                            <div>
                              <p className="font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                        <td className="px-4 py-3 text-right font-bold text-coral">
                          {new Intl.NumberFormat('vi-VN').format(p.price)}₫
                        </td>
                        <td className="px-4 py-3 text-center">{p.stock}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleProductActive(p)} className="inline-flex items-center gap-1">
                            {p.is_active ? (
                              <span className="text-xs bg-success/10 text-success px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <Eye className="h-3 w-3" /> Hiện
                              </span>
                            ) : (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                                <EyeOff className="h-3 w-3" /> Ẩn
                              </span>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => { setEditingProduct(p); setShowProductForm(true); }}
                              className="p-1.5 hover:bg-muted rounded-lg text-primary"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {products.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có sản phẩm nào</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Stores tab */}
        {tab === 'stores' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Quản lý cửa hàng ({stores.length})</h2>
              <button
                onClick={() => { setEditingStore(null); setShowStoreForm(true); }}
                className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:opacity-90"
              >
                <Plus className="h-4 w-4" /> Thêm cửa hàng
              </button>
            </div>

            {showStoreForm && (
              <StoreForm
                store={editingStore}
                onSave={() => { setShowStoreForm(false); fetchStores(); }}
                onCancel={() => setShowStoreForm(false)}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map(s => (
                <div key={s.id} className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-bold text-foreground mb-2">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">📍 {s.address}</p>
                  <p className="text-xs text-muted-foreground mb-1">📞 {s.phone}</p>
                  <p className="text-xs text-muted-foreground mb-3">🕐 {s.hours}</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditingStore(s); setShowStoreForm(true); }}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" /> Sửa
                    </button>
                    <button
                      onClick={() => deleteStore(s.id)}
                      className="text-xs text-destructive font-medium hover:underline flex items-center gap-1"
                    >
                      <Trash2 className="h-3 w-3" /> Xóa
                    </button>
                  </div>
                </div>
              ))}
              {stores.length === 0 && (
                <p className="text-muted-foreground col-span-3 text-center py-8">Chưa có cửa hàng nào</p>
              )}
            </div>
          </div>
        )}

        {/* Settings tab */}
        {tab === 'settings' && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-foreground mb-4">Cài đặt website</h2>
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                Tính năng quản lý banner, nội dung giới thiệu, và thông tin liên hệ sẽ được cập nhật.
              </p>
              <div className="space-y-3">
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">👤 Admin hiện tại</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">🏪 Số cửa hàng</p>
                  <p className="text-xs text-muted-foreground">{stores.length} chi nhánh</p>
                </div>
                <div className="p-4 bg-muted rounded-lg">
                  <p className="text-sm font-medium text-foreground mb-1">📦 Tổng sản phẩm</p>
                  <p className="text-xs text-muted-foreground">{products.length} sản phẩm</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Product Form Component
function ProductForm({ product, onSave, onCancel }: { product: DBProduct | null; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    price: product?.price || 0,
    unit: product?.unit || 'kg',
    category: product?.category || '',
    grade: product?.grade || 'Cao cấp',
    stock: product?.stock || 50,
    badges: product?.badges?.join(', ') || '',
    needs: product?.needs?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let imageUrl = product?.images?.[0] || '';

    // Upload image if new
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from('product-images')
        .upload(path, imageFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }

    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      price: Number(form.price),
      unit: form.unit,
      category: form.category,
      grade: form.grade,
      stock: Number(form.stock),
      badges: form.badges ? form.badges.split(',').map(b => b.trim()) : [],
      needs: form.needs ? form.needs.split(',').map(n => n.trim()) : [],
      images: imageUrl ? [imageUrl] : [],
    };

    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id);
      if (error) toast.error('Lỗi cập nhật: ' + error.message);
      else toast.success('Đã cập nhật!');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) toast.error('Lỗi thêm: ' + error.message);
      else toast.success('Đã thêm sản phẩm!');
    }
    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-4">
      <h3 className="font-bold text-foreground">{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Tên sản phẩm *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Slug (URL)</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="auto-generate" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Giá (₫) *</label>
          <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Đơn vị</label>
          <input value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Danh mục *</label>
          <input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Hạng</label>
          <input value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Tồn kho</label>
          <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Badges (cách nhau dấu phẩy)</label>
          <input value={form.badges} onChange={e => setForm(f => ({ ...f, badges: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="hot, gift, limited" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Ảnh sản phẩm</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="ocean-gradient text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">
          Hủy
        </button>
      </div>
    </form>
  );
}

// Store Form Component
function StoreForm({ store, onSave, onCancel }: { store: DBStore | null; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: store?.name || '',
    address: store?.address || '',
    lat: store?.lat || 19.755,
    lng: store?.lng || 105.904,
    phone: store?.phone || '',
    hours: store?.hours || '7:00 – 21:00',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, lat: Number(form.lat), lng: Number(form.lng) };

    if (store) {
      const { error } = await supabase.from('stores').update(payload).eq('id', store.id);
      if (error) toast.error('Lỗi: ' + error.message);
      else toast.success('Đã cập nhật!');
    } else {
      const { error } = await supabase.from('stores').insert(payload);
      if (error) toast.error('Lỗi: ' + error.message);
      else toast.success('Đã thêm cửa hàng!');
    }
    setSaving(false);
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-4">
      <h3 className="font-bold text-foreground">{store ? 'Sửa cửa hàng' : 'Thêm cửa hàng mới'}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Tên *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Điện thoại *</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Địa chỉ *</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Vĩ độ (lat)</label>
          <input type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Kinh độ (lng)</label>
          <input type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Giờ mở cửa</label>
          <input value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
        </div>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="ocean-gradient text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">
          Hủy
        </button>
      </div>
    </form>
  );
}
