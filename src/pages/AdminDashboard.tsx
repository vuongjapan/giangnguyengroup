import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Edit, Trash2, LogOut, Package, Store, Settings, Eye, EyeOff, Save, ShoppingBag, Users, TrendingUp, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/data/products';

type Tab = 'dashboard' | 'products' | 'orders' | 'members' | 'stores' | 'settings';

interface DBProduct {
  id: string; name: string; slug: string; price: number; unit: string;
  images: string[]; category: string; grade: string; badges: string[];
  needs: string[]; rating: number; stock: number; is_active: boolean; sort_order: number;
}

interface DBStore {
  id: string; name: string; address: string; lat: number; lng: number; phone: string; hours: string;
}

interface DBOrder {
  id: string; order_code: string; customer_name: string; customer_phone: string;
  items: any[]; total: number; status: string; created_at: string; user_id: string | null;
}

interface DBProfile {
  id: string; name: string; phone: string; email: string; level: string;
  points: number; total_spent: number; created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [stores, setStores] = useState<DBStore[]>([]);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [members, setMembers] = useState<DBProfile[]>([]);
  const [editingProduct, setEditingProduct] = useState<DBProduct | null>(null);
  const [editingStore, setEditingStore] = useState<DBStore | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/admin/login');
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) { fetchProducts(); fetchStores(); fetchOrders(); fetchMembers(); }
  }, [isAdmin]);

  // Realtime subscriptions
  useEffect(() => {
    if (!isAdmin) return;
    const ordersChannel = supabase.channel('admin-orders')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders())
      .subscribe();
    const profilesChannel = supabase.channel('admin-profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchMembers())
      .subscribe();
    return () => { supabase.removeChannel(ordersChannel); supabase.removeChannel(profilesChannel); };
  }, [isAdmin]);

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('sort_order');
    if (data) setProducts(data as unknown as DBProduct[]);
  };
  const fetchStores = async () => {
    const { data } = await supabase.from('stores').select('*').order('sort_order');
    if (data) setStores(data as unknown as DBStore[]);
  };
  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data as unknown as DBOrder[]);
  };
  const fetchMembers = async () => {
    const { data } = await supabase.from('profiles').select('*').order('total_spent', { ascending: false });
    if (data) setMembers(data as unknown as DBProfile[]);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Xóa sản phẩm này?')) return;
    await supabase.from('products').delete().eq('id', id);
    toast.success('Đã xóa'); fetchProducts();
  };
  const deleteStore = async (id: string) => {
    if (!confirm('Xóa cửa hàng này?')) return;
    await supabase.from('stores').delete().eq('id', id);
    toast.success('Đã xóa'); fetchStores();
  };
  const toggleProductActive = async (p: DBProduct) => {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    fetchProducts();
  };
  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    toast.success('Đã cập nhật trạng thái'); fetchOrders();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  if (!isAdmin) return null;

  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);

  const tabItems = [
    { id: 'dashboard' as Tab, label: 'Tổng quan', icon: TrendingUp },
    { id: 'orders' as Tab, label: `Đơn hàng (${orders.length})`, icon: ShoppingBag },
    { id: 'products' as Tab, label: 'Sản phẩm', icon: Package },
    { id: 'members' as Tab, label: `Thành viên (${members.length})`, icon: Users },
    { id: 'stores' as Tab, label: 'Cửa hàng', icon: Store },
    { id: 'settings' as Tab, label: 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
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
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 overflow-x-auto">
          {tabItems.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard overview */}
        {tab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Đơn hôm nay', value: todayOrders.length, icon: ShoppingBag, color: 'text-primary' },
                { label: 'Doanh thu hôm nay', value: formatPrice(todayRevenue), icon: DollarSign, color: 'text-coral' },
                { label: 'Tổng doanh thu', value: formatPrice(totalRevenue), icon: TrendingUp, color: 'text-green-600' },
                { label: 'Thành viên', value: members.length, icon: Users, color: 'text-purple-600' },
              ].map(stat => (
                <div key={stat.label} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                  </div>
                  <p className={`text-xl font-black ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Recent orders */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-bold text-foreground mb-3">Đơn hàng mới nhất</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Mã đơn</th>
                      <th className="text-left px-3 py-2 font-medium">Khách</th>
                      <th className="text-right px-3 py-2 font-medium">Tổng</th>
                      <th className="text-center px-3 py-2 font-medium">Trạng thái</th>
                      <th className="text-center px-3 py-2 font-medium">Thời gian</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.slice(0, 10).map(o => {
                      const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
                      return (
                        <tr key={o.id} className="hover:bg-muted/50">
                          <td className="px-3 py-2 font-bold text-primary">{o.order_code}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-foreground">{o.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-coral">{formatPrice(o.total)}</td>
                          <td className="px-3 py-2 text-center">
                            <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded-full font-bold border-0 ${st.color}`}>
                              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-center text-xs text-muted-foreground">
                            {new Date(o.created_at).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top products */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-bold text-foreground mb-3">Sản phẩm bán chạy</h3>
              <div className="space-y-2">
                {products.filter(p => p.badges.includes('hot')).slice(0, 5).map((p, i) => (
                  <div key={p.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted">
                    <span className="text-lg font-black text-muted-foreground w-6 text-center">#{i + 1}</span>
                    {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                    <div className="flex-1">
                      <p className="font-medium text-foreground text-sm">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category}</p>
                    </div>
                    <span className="font-bold text-coral text-sm">{formatPrice(p.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Orders tab */}
        {tab === 'orders' && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Quản lý đơn hàng ({orders.length})</h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Mã đơn</th>
                      <th className="text-left px-3 py-2 font-medium">Khách hàng</th>
                      <th className="text-left px-3 py-2 font-medium">Sản phẩm</th>
                      <th className="text-right px-3 py-2 font-medium">Tổng</th>
                      <th className="text-center px-3 py-2 font-medium">Trạng thái</th>
                      <th className="text-center px-3 py-2 font-medium">Ngày</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.map(o => {
                      const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
                      return (
                        <tr key={o.id} className="hover:bg-muted/50">
                          <td className="px-3 py-2 font-bold text-primary">{o.order_code}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-foreground">{o.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] truncate">
                            {(o.items as any[]).map((i: any) => `${i.name} x${i.quantity}`).join(', ')}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-coral">{formatPrice(o.total)}</td>
                          <td className="px-3 py-2 text-center">
                            <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded-full font-bold border-0 cursor-pointer ${st.color}`}>
                              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                                <option key={k} value={k}>{v.label}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-center text-xs text-muted-foreground">
                            {new Date(o.created_at).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })}
                    {orders.length === 0 && (
                      <tr><td colSpan={6} className="text-center py-8 text-muted-foreground">Chưa có đơn hàng</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Products tab */}
        {tab === 'products' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Quản lý sản phẩm ({products.length})</h2>
              <button onClick={() => { setEditingProduct(null); setShowProductForm(true); }}
                className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:opacity-90">
                <Plus className="h-4 w-4" /> Thêm SP
              </button>
            </div>
            {showProductForm && (
              <ProductForm product={editingProduct} onSave={() => { setShowProductForm(false); fetchProducts(); }} onCancel={() => setShowProductForm(false)} />
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
                            {p.images[0] && <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />}
                            <div>
                              <p className="font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                        <td className="px-4 py-3 text-right font-bold text-coral">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3 text-center">{p.stock}</td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleProductActive(p)}>
                            {p.is_active ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
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
                            <button onClick={() => { setEditingProduct(p); setShowProductForm(true); }} className="p-1.5 hover:bg-muted rounded-lg text-primary">
                              <Edit className="h-4 w-4" />
                            </button>
                            <button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Members tab */}
        {tab === 'members' && (
          <div>
            <h2 className="text-lg font-bold text-foreground mb-4">Quản lý thành viên ({members.length})</h2>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Thành viên</th>
                      <th className="text-center px-3 py-2 font-medium">Hạng</th>
                      <th className="text-right px-3 py-2 font-medium">Tổng chi</th>
                      <th className="text-right px-3 py-2 font-medium">Điểm</th>
                      <th className="text-center px-3 py-2 font-medium">Ngày tham gia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {members.map(m => (
                      <tr key={m.id} className="hover:bg-muted/50">
                        <td className="px-3 py-2">
                          <p className="font-medium text-foreground">{m.name || 'Chưa đặt tên'}</p>
                          <p className="text-xs text-muted-foreground">{m.email} • {m.phone || 'N/A'}</p>
                        </td>
                        <td className="px-3 py-2 text-center">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${m.level === 'PRO' ? 'bg-purple-100 text-purple-800' : m.level === 'VIP' ? 'bg-yellow-100 text-yellow-800' : 'bg-muted text-foreground'}`}>
                            {m.level === 'PRO' ? '💎' : m.level === 'VIP' ? '🥇' : '⭐'} {m.level}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-right font-bold text-coral">{formatPrice(m.total_spent)}</td>
                        <td className="px-3 py-2 text-right font-bold text-accent">{m.points.toLocaleString()}</td>
                        <td className="px-3 py-2 text-center text-xs text-muted-foreground">
                          {new Date(m.created_at).toLocaleDateString('vi-VN')}
                        </td>
                      </tr>
                    ))}
                    {members.length === 0 && (
                      <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có thành viên</td></tr>
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
              <button onClick={() => { setEditingStore(null); setShowStoreForm(true); }}
                className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:opacity-90">
                <Plus className="h-4 w-4" /> Thêm cửa hàng
              </button>
            </div>
            {showStoreForm && (
              <StoreForm store={editingStore} onSave={() => { setShowStoreForm(false); fetchStores(); }} onCancel={() => setShowStoreForm(false)} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stores.map(s => (
                <div key={s.id} className="bg-card rounded-xl border border-border p-4">
                  <h3 className="font-bold text-foreground mb-2">{s.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">📍 {s.address}</p>
                  <p className="text-xs text-muted-foreground mb-1">📞 {s.phone}</p>
                  <p className="text-xs text-muted-foreground mb-3">🕐 {s.hours}</p>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditingStore(s); setShowStoreForm(true); }}
                      className="text-xs text-primary font-medium hover:underline flex items-center gap-1">
                      <Edit className="h-3 w-3" /> Sửa
                    </button>
                    <button onClick={() => deleteStore(s.id)}
                      className="text-xs text-destructive font-medium hover:underline flex items-center gap-1">
                      <Trash2 className="h-3 w-3" /> Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Settings tab */}
        {tab === 'settings' && (
          <div className="max-w-2xl">
            <h2 className="text-lg font-bold text-foreground mb-4">Cài đặt website</h2>
            <div className="bg-card rounded-xl border border-border p-6 space-y-3">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">👤 Admin</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">📦 Sản phẩm: {products.length}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">🏪 Cửa hàng: {stores.length}</p>
              </div>
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm font-medium text-foreground mb-1">👥 Thành viên: {members.length}</p>
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
    name: product?.name || '', slug: product?.slug || '', price: product?.price || 0,
    unit: product?.unit || 'kg', category: product?.category || '', grade: product?.grade || 'Cao cấp',
    stock: product?.stock || 50, badges: product?.badges?.join(', ') || '', needs: product?.needs?.join(', ') || '',
  });
  const [saving, setSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    let imageUrl = product?.images?.[0] || '';
    if (imageFile) {
      const ext = imageFile.name.split('.').pop();
      const path = `${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage.from('product-images').upload(path, imageFile);
      if (!uploadErr) {
        const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
        imageUrl = urlData.publicUrl;
      }
    }
    const payload = {
      name: form.name, slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      price: Number(form.price), unit: form.unit, category: form.category, grade: form.grade,
      stock: Number(form.stock), badges: form.badges ? form.badges.split(',').map(b => b.trim()) : [],
      needs: form.needs ? form.needs.split(',').map(n => n.trim()) : [], images: imageUrl ? [imageUrl] : [],
    };
    if (product) {
      const { error } = await supabase.from('products').update(payload).eq('id', product.id);
      if (error) toast.error('Lỗi: ' + error.message); else toast.success('Đã cập nhật!');
    } else {
      const { error } = await supabase.from('products').insert(payload);
      if (error) toast.error('Lỗi: ' + error.message); else toast.success('Đã thêm!');
    }
    setSaving(false); onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-4">
      <h3 className="font-bold text-foreground">{product ? 'Sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { label: 'Tên sản phẩm *', key: 'name', required: true },
          { label: 'Slug (URL)', key: 'slug', placeholder: 'auto-generate' },
          { label: 'Giá (₫) *', key: 'price', type: 'number', required: true },
          { label: 'Đơn vị', key: 'unit' },
          { label: 'Danh mục *', key: 'category', required: true },
          { label: 'Hạng', key: 'grade' },
          { label: 'Tồn kho', key: 'stock', type: 'number' },
          { label: 'Badges (dấu phẩy)', key: 'badges', placeholder: 'hot, gift' },
        ].map(f => (
          <div key={f.key}>
            <label className="block text-xs font-medium text-foreground mb-1">{f.label}</label>
            <input type={f.type || 'text'} value={(form as any)[f.key]}
              onChange={e => setForm(prev => ({ ...prev, [f.key]: f.type === 'number' ? Number(e.target.value) : e.target.value }))}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required={f.required} placeholder={f.placeholder} />
          </div>
        ))}
        <div className="md:col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Ảnh sản phẩm</label>
          <input type="file" accept="image/*" onChange={e => setImageFile(e.target.files?.[0] || null)} className="w-full text-sm" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="ocean-gradient text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
      </div>
    </form>
  );
}

// Store Form Component
function StoreForm({ store, onSave, onCancel }: { store: DBStore | null; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: store?.name || '', address: store?.address || '',
    lat: store?.lat || 19.755, lng: store?.lng || 105.904,
    phone: store?.phone || '', hours: store?.hours || '7:00 – 21:00',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...form, lat: Number(form.lat), lng: Number(form.lng) };
    if (store) {
      const { error } = await supabase.from('stores').update(payload).eq('id', store.id);
      if (error) toast.error('Lỗi: ' + error.message); else toast.success('Đã cập nhật!');
    } else {
      const { error } = await supabase.from('stores').insert(payload);
      if (error) toast.error('Lỗi: ' + error.message); else toast.success('Đã thêm!');
    }
    setSaving(false); onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-4">
      <h3 className="font-bold text-foreground">{store ? 'Sửa cửa hàng' : 'Thêm cửa hàng mới'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-xs font-medium text-foreground mb-1">Tên *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required /></div>
        <div><label className="block text-xs font-medium text-foreground mb-1">Điện thoại *</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required /></div>
        <div className="md:col-span-2"><label className="block text-xs font-medium text-foreground mb-1">Địa chỉ *</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" required /></div>
        <div><label className="block text-xs font-medium text-foreground mb-1">Vĩ độ</label>
          <input type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
        <div><label className="block text-xs font-medium text-foreground mb-1">Kinh độ</label>
          <input type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: Number(e.target.value) }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
        <div><label className="block text-xs font-medium text-foreground mb-1">Giờ mở cửa</label>
          <input value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" /></div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="ocean-gradient text-primary-foreground px-6 py-2 rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
      </div>
    </form>
  );
}
