import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  Plus, Edit, Trash2, LogOut, Package, Store, Settings, Eye, EyeOff, Save,
  ShoppingBag, Users, TrendingUp, DollarSign, Hotel, Image, X, GripVertical,
  ChevronDown, ChevronUp, Search, Filter, Lock, Upload, FileText, Globe,
  Shield, UserPlus, RefreshCw, Tag, Percent, Gift
} from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/data/products';

type Tab = 'dashboard' | 'products' | 'combos' | 'orders' | 'members' | 'stores' | 'hotels' | 'coupons' | 'content' | 'settings';

interface DBCoupon {
  id: string; code: string; discount_percent: number; max_uses: number;
  used_count: number; min_order: number; expires_at: string | null;
  is_active: boolean; created_at: string;
}

interface DBProduct {
  id: string; name: string; slug: string; price: number; unit: string;
  images: string[]; category: string; grade: string; badges: string[];
  needs: string[]; rating: number; stock: number; is_active: boolean;
  sort_order: number; description: any;
}

interface DBStore {
  id: string; name: string; address: string; lat: number; lng: number;
  phone: string; hours: string; image: string | null; sort_order: number;
}

interface DBOrder {
  id: string; order_code: string; customer_name: string; customer_phone: string;
  customer_email: string; customer_address: string;
  items: any[]; total: number; status: string; created_at: string;
  user_id: string | null; points_earned: number; points_used: number;
}

interface DBProfile {
  id: string; name: string; phone: string; email: string; level: string;
  points: number; total_spent: number; created_at: string;
}

interface DBHotel {
  id: string; name: string; slug: string; address: string; phone: string;
  description: string; images: string[]; amenities: string[];
  category: string; discount_percent: number; is_active: boolean; sort_order: number;
}

interface DBCombo {
  id: string; name: string; slug: string; tag: string; tag_color: string;
  category: string; description: string; product_ids: string[];
  original_price: number; combo_price: number; image: string; images: string[];
  is_active: boolean; sort_order: number;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

const CATEGORIES = ['Mực khô', 'Cá khô', 'Hải sản 1 nắng', 'Tôm khô', 'Nem chua', 'Combo quà biếu', 'Đặc sản khác'];

export default function AdminDashboard() {
  const { user, isAdmin, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('dashboard');
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [stores, setStores] = useState<DBStore[]>([]);
  const [orders, setOrders] = useState<DBOrder[]>([]);
  const [members, setMembers] = useState<DBProfile[]>([]);
  const [hotels, setHotels] = useState<DBHotel[]>([]);
  const [coupons, setCoupons] = useState<DBCoupon[]>([]);
  const [combos, setCombos] = useState<DBCombo[]>([]);
  const [editingProduct, setEditingProduct] = useState<DBProduct | null>(null);
  const [editingStore, setEditingStore] = useState<DBStore | null>(null);
  const [editingHotel, setEditingHotel] = useState<DBHotel | null>(null);
  const [editingCombo, setEditingCombo] = useState<DBCombo | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [showHotelForm, setShowHotelForm] = useState(false);
  const [showComboForm, setShowComboForm] = useState(false);
  const [orderFilter, setOrderFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate('/admin/login');
  }, [user, isAdmin, loading, navigate]);

  useEffect(() => {
    if (isAdmin) { fetchAll(); }
  }, [isAdmin]);

  const fetchAll = () => { fetchProducts(); fetchStores(); fetchOrders(); fetchMembers(); fetchHotels(); fetchCoupons(); fetchCombos(); };

  useEffect(() => {
    if (!isAdmin) return;
    const channels = [
      supabase.channel('admin-orders').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, () => fetchOrders()).subscribe(),
      supabase.channel('admin-profiles').on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => fetchMembers()).subscribe(),
      supabase.channel('admin-products').on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts()).subscribe(),
      supabase.channel('admin-hotels').on('postgres_changes', { event: '*', schema: 'public', table: 'hotels' }, () => fetchHotels()).subscribe(),
      supabase.channel('admin-stores').on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, () => fetchStores()).subscribe(),
      supabase.channel('admin-coupons').on('postgres_changes', { event: '*', schema: 'public', table: 'coupons' }, () => fetchCoupons()).subscribe(),
      supabase.channel('admin-combos').on('postgres_changes', { event: '*', schema: 'public', table: 'combos' }, () => fetchCombos()).subscribe(),
    ];
    return () => { channels.forEach(c => supabase.removeChannel(c)); };
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
  const fetchHotels = async () => {
    const { data } = await supabase.from('hotels').select('*').order('sort_order');
    if (data) setHotels(data as unknown as DBHotel[]);
  };
  const fetchCoupons = async () => {
    const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
    if (data) setCoupons(data as unknown as DBCoupon[]);
  };
  const fetchCombos = async () => {
    const { data } = await supabase.from('combos').select('*').order('sort_order');
    if (data) setCombos(data as unknown as DBCombo[]);
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
  const deleteHotel = async (id: string) => {
    if (!confirm('Xóa khách sạn này?')) return;
    await supabase.from('hotels').delete().eq('id', id);
    toast.success('Đã xóa'); fetchHotels();
  };
  const toggleProductActive = async (p: DBProduct) => {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id);
    fetchProducts();
  };
  const toggleHotelActive = async (h: DBHotel) => {
    await supabase.from('hotels').update({ is_active: !h.is_active }).eq('id', h.id);
    fetchHotels();
  };
  const deleteCombo = async (id: string) => {
    if (!confirm('Xóa combo này?')) return;
    await supabase.from('combos').delete().eq('id', id);
    toast.success('Đã xóa'); fetchCombos();
  };
  const toggleComboActive = async (c: DBCombo) => {
    await supabase.from('combos').update({ is_active: !c.is_active }).eq('id', c.id);
    fetchCombos();
  };
  const updateOrderStatus = async (id: string, status: string) => {
    await supabase.from('orders').update({ status }).eq('id', id);
    toast.success('Đã cập nhật trạng thái'); fetchOrders();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><RefreshCw className="h-6 w-6 animate-spin text-primary" /></div>;
  if (!isAdmin) return null;

  const todayOrders = orders.filter(o => new Date(o.created_at).toDateString() === new Date().toDateString());
  const todayRevenue = todayOrders.reduce((s, o) => s + o.total, 0);
  const totalRevenue = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  const filteredOrders = orders.filter(o => {
    if (orderFilter !== 'all' && o.status !== orderFilter) return false;
    if (searchTerm) {
      const s = searchTerm.toLowerCase();
      return o.order_code.toLowerCase().includes(s) || o.customer_name.toLowerCase().includes(s) || o.customer_phone.includes(s);
    }
    return true;
  });

  const tabItems = [
    { id: 'dashboard' as Tab, label: 'Tổng quan', icon: TrendingUp },
    { id: 'orders' as Tab, label: `Đơn hàng (${pendingOrders > 0 ? pendingOrders + ' mới' : orders.length})`, icon: ShoppingBag },
    { id: 'products' as Tab, label: `Sản phẩm (${products.length})`, icon: Package },
    { id: 'combos' as Tab, label: `Combo (${combos.length})`, icon: Gift },
    { id: 'hotels' as Tab, label: `Khách sạn (${hotels.length})`, icon: Hotel },
    { id: 'members' as Tab, label: `Thành viên (${members.length})`, icon: Users },
    { id: 'stores' as Tab, label: `Cửa hàng (${stores.length})`, icon: Store },
    { id: 'coupons' as Tab, label: `Mã giảm giá (${coupons.length})`, icon: Tag },
    { id: 'content' as Tab, label: 'Nội dung', icon: FileText },
    { id: 'settings' as Tab, label: 'Cài đặt', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="ocean-gradient text-primary-foreground py-3 px-4 sticky top-0 z-50">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="font-black text-lg">GN SEAFOOD</Link>
            <span className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full font-bold">ADMIN</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={fetchAll} className="p-1.5 hover:bg-white/20 rounded-lg" title="Làm mới"><RefreshCw className="h-4 w-4" /></button>
            <span className="text-xs text-primary-foreground/80 hidden sm:block">{user?.email}</span>
            <button onClick={() => { signOut(); navigate('/'); }} className="flex items-center gap-1 text-xs hover:underline">
              <LogOut className="h-3.5 w-3.5" /> Thoát
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

        {/* ===== DASHBOARD ===== */}
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
            {/* Pending orders alert */}
            {pendingOrders > 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center gap-3">
                <ShoppingBag className="h-6 w-6 text-yellow-600" />
                <div>
                  <p className="font-bold text-yellow-800">Có {pendingOrders} đơn hàng chờ xác nhận!</p>
                  <button onClick={() => { setTab('orders'); setOrderFilter('pending'); }} className="text-sm text-primary font-medium hover:underline">Xem ngay →</button>
                </div>
              </div>
            )}
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders.slice(0, 8).map(o => {
                      const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
                      return (
                        <tr key={o.id} className="hover:bg-muted/50">
                          <td className="px-3 py-2 font-bold text-primary">{o.order_code}</td>
                          <td className="px-3 py-2"><p className="font-medium text-foreground">{o.customer_name}</p></td>
                          <td className="px-3 py-2 text-right font-bold text-coral">{formatPrice(o.total)}</td>
                          <td className="px-3 py-2 text-center"><span className={`text-xs px-2 py-0.5 rounded-full font-bold ${st.color}`}>{st.label}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== ORDERS ===== */}
        {tab === 'orders' && (
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-bold text-foreground">Quản lý đơn hàng ({filteredOrders.length})</h2>
              <div className="flex gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Tìm mã đơn, tên, SĐT..."
                    className="w-full sm:w-56 pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm" />
                </div>
                <select value={orderFilter} onChange={e => setOrderFilter(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-border bg-background text-sm">
                  <option value="all">Tất cả</option>
                  {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                </select>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted text-muted-foreground">
                    <tr>
                      <th className="text-left px-3 py-2 font-medium">Mã đơn</th>
                      <th className="text-left px-3 py-2 font-medium">Khách hàng</th>
                      <th className="text-left px-3 py-2 font-medium hidden md:table-cell">Địa chỉ</th>
                      <th className="text-left px-3 py-2 font-medium">Sản phẩm</th>
                      <th className="text-right px-3 py-2 font-medium">Tổng</th>
                      <th className="text-center px-3 py-2 font-medium">Trạng thái</th>
                      <th className="text-center px-3 py-2 font-medium">Ngày</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filteredOrders.map(o => {
                      const st = STATUS_LABELS[o.status] || STATUS_LABELS.pending;
                      return (
                        <tr key={o.id} className="hover:bg-muted/50">
                          <td className="px-3 py-2 font-bold text-primary">{o.order_code}</td>
                          <td className="px-3 py-2">
                            <p className="font-medium text-foreground">{o.customer_name}</p>
                            <p className="text-xs text-muted-foreground">{o.customer_phone}</p>
                            {o.customer_email && <p className="text-xs text-muted-foreground">{o.customer_email}</p>}
                          </td>
                          <td className="px-3 py-2 text-xs text-muted-foreground max-w-[150px] truncate hidden md:table-cell">{o.customer_address}</td>
                          <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px]">
                            {(o.items as any[]).map((i: any) => `${i.name} x${i.quantity}`).join(', ')}
                          </td>
                          <td className="px-3 py-2 text-right font-bold text-coral">{formatPrice(o.total)}</td>
                          <td className="px-3 py-2 text-center">
                            <select value={o.status} onChange={e => updateOrderStatus(o.id, e.target.value)}
                              className={`text-xs px-2 py-1 rounded-full font-bold border-0 cursor-pointer ${st.color}`}>
                              {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
                            </select>
                          </td>
                          <td className="px-3 py-2 text-center text-xs text-muted-foreground">
                            {new Date(o.created_at).toLocaleDateString('vi-VN')}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredOrders.length === 0 && (
                      <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Không có đơn hàng</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== PRODUCTS ===== */}
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
                      <tr key={p.id} className={`hover:bg-muted/50 ${!p.is_active ? 'opacity-50' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {p.images[0] ? <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover" /> : <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center"><Image className="h-5 w-5 text-muted-foreground" /></div>}
                            <div>
                              <p className="font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.grade} • {p.images.length} ảnh</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                        <td className="px-4 py-3 text-right font-bold text-coral">{formatPrice(p.price)}</td>
                        <td className="px-4 py-3 text-center">
                          <span className={`text-xs font-bold ${p.stock < 10 ? 'text-destructive' : 'text-foreground'}`}>{p.stock}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button onClick={() => toggleProductActive(p)}>
                            {p.is_active ? (
                              <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><Eye className="h-3 w-3" /> Hiện</span>
                            ) : (
                              <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-medium flex items-center gap-1"><EyeOff className="h-3 w-3" /> Ẩn</span>
                            )}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => { setEditingProduct(p); setShowProductForm(true); }} className="p-1.5 hover:bg-muted rounded-lg text-primary"><Edit className="h-4 w-4" /></button>
                            <button onClick={() => deleteProduct(p.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 className="h-4 w-4" /></button>
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

        {/* ===== COMBOS ===== */}
        {tab === 'combos' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Quản lý Combo Quà Biếu ({combos.length})</h2>
              <button onClick={() => { setEditingCombo(null); setShowComboForm(true); }}
                className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:opacity-90">
                <Plus className="h-4 w-4" /> Thêm Combo
              </button>
            </div>
            {showComboForm && (
              <ComboForm combo={editingCombo} products={products} onSave={() => { setShowComboForm(false); fetchCombos(); }} onCancel={() => setShowComboForm(false)} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {combos.map(c => (
                <div key={c.id} className={`bg-card rounded-xl border border-border overflow-hidden ${!c.is_active ? 'opacity-50' : ''}`}>
                  {(c.image || c.images[0]) && <img src={c.image || c.images[0]} alt={c.name} className="w-full h-36 object-cover" />}
                  <div className="p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {c.tag && <span className={`${c.tag_color} px-2 py-0.5 rounded-full text-xs font-bold`}>{c.tag}</span>}
                      <span className="text-xs text-muted-foreground">{c.category}</span>
                    </div>
                    <h3 className="font-bold text-foreground mb-1">{c.name}</h3>
                    <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{c.description}</p>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(c.original_price)}</span>
                      <span className="text-sm font-black text-coral">{formatPrice(c.combo_price)}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => toggleComboActive(c)} className={`text-xs font-medium px-2 py-1 rounded ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                        {c.is_active ? '✅ Hiện' : '⬜ Ẩn'}
                      </button>
                      <button onClick={() => { setEditingCombo(c); setShowComboForm(true); }} className="text-xs text-primary font-medium hover:underline flex items-center gap-1"><Edit className="h-3 w-3" /> Sửa</button>
                      <button onClick={() => deleteCombo(c.id)} className="text-xs text-destructive font-medium hover:underline flex items-center gap-1"><Trash2 className="h-3 w-3" /> Xóa</button>
                    </div>
                  </div>
                </div>
              ))}
              {combos.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  <Gift className="h-12 w-12 mx-auto mb-3 opacity-30" />
                  <p>Chưa có combo nào. Bấm "Thêm Combo" để tạo!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== HOTELS ===== */}
        {tab === 'hotels' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-foreground">Quản lý khách sạn liên kết ({hotels.length})</h2>
              <button onClick={() => { setEditingHotel(null); setShowHotelForm(true); }}
                className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:opacity-90">
                <Plus className="h-4 w-4" /> Thêm KS
              </button>
            </div>
            {showHotelForm && (
              <HotelForm hotel={editingHotel} onSave={() => { setShowHotelForm(false); fetchHotels(); }} onCancel={() => setShowHotelForm(false)} />
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {hotels.map(h => (
                <div key={h.id} className={`bg-card rounded-xl border border-border p-4 ${!h.is_active ? 'opacity-50' : ''}`}>
                  {h.images[0] && <img src={h.images[0]} alt={h.name} className="w-full h-32 object-cover rounded-lg mb-3" />}
                  <h3 className="font-bold text-foreground">{h.name}</h3>
                  <p className="text-xs text-muted-foreground mb-1">📍 {h.address}</p>
                  <p className="text-xs text-muted-foreground mb-1">📞 {h.phone}</p>
                  <p className="text-xs text-primary font-bold mb-3">Giảm {h.discount_percent}% cho khách</p>
                  <div className="flex gap-2">
                    <button onClick={() => toggleHotelActive(h)} className={`text-xs font-medium px-2 py-1 rounded ${h.is_active ? 'bg-green-100 text-green-800' : 'bg-muted text-muted-foreground'}`}>
                      {h.is_active ? '✅ Hiện' : '⬜ Ẩn'}
                    </button>
                    <button onClick={() => { setEditingHotel(h); setShowHotelForm(true); }} className="text-xs text-primary font-medium hover:underline flex items-center gap-1"><Edit className="h-3 w-3" /> Sửa</button>
                    <button onClick={() => deleteHotel(h.id)} className="text-xs text-destructive font-medium hover:underline flex items-center gap-1"><Trash2 className="h-3 w-3" /> Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== MEMBERS ===== */}
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
                        <td className="px-3 py-2 text-center text-xs text-muted-foreground">{new Date(m.created_at).toLocaleDateString('vi-VN')}</td>
                      </tr>
                    ))}
                    {members.length === 0 && <tr><td colSpan={5} className="text-center py-8 text-muted-foreground">Chưa có thành viên</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ===== STORES ===== */}
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
                    <button onClick={() => { setEditingStore(s); setShowStoreForm(true); }} className="text-xs text-primary font-medium hover:underline flex items-center gap-1"><Edit className="h-3 w-3" /> Sửa</button>
                    <button onClick={() => deleteStore(s.id)} className="text-xs text-destructive font-medium hover:underline flex items-center gap-1"><Trash2 className="h-3 w-3" /> Xóa</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== COUPONS ===== */}
        {tab === 'coupons' && <CouponManager coupons={coupons} fetchCoupons={fetchCoupons} />}

        {/* ===== CONTENT ===== */}
        {tab === 'content' && <ContentManager />}

        {/* ===== SETTINGS ===== */}
        {tab === 'settings' && <SettingsTab user={user} products={products} stores={stores} members={members} hotels={hotels} />}
      </div>
    </div>
  );
}

// =================== PRODUCT FORM (FULL) ===================
function ProductForm({ product, onSave, onCancel }: { product: DBProduct | null; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: product?.name || '', slug: product?.slug || '', price: product?.price || 0,
    unit: product?.unit || 'kg', category: product?.category || '', grade: product?.grade || 'Cao cấp',
    stock: product?.stock || 50, badges: product?.badges?.join(', ') || '', needs: product?.needs?.join(', ') || '',
    rating: product?.rating || 5,
  });

  // Structured description state
  const desc = product?.description as any || {};
  const [hook, setHook] = useState(desc.hook || '');
  const [intro, setIntro] = useState(desc.intro || '');
  const [benefits, setBenefits] = useState<string[]>(Array.isArray(desc.benefits) ? desc.benefits : []);
  const [highlights, setHighlights] = useState({ origin: desc.highlights?.origin || '', process: desc.highlights?.process || '', packaging: desc.highlights?.packaging || '' });
  const [cookingMethods, setCookingMethods] = useState<{name:string;detail:string}[]>(
    Array.isArray(desc.cooking?.methods) ? desc.cooking.methods : []
  );
  const [cookingSuggestions, setCookingSuggestions] = useState<string[]>(
    Array.isArray(desc.cooking?.suggestions) ? desc.cooking.suggestions : []
  );
  const [choosingTips, setChoosingTips] = useState<string[]>(Array.isArray(desc.choosingTips) ? desc.choosingTips : []);
  const [realVsFakeReal, setRealVsFakeReal] = useState<string[]>(Array.isArray(desc.realVsFake?.real) ? desc.realVsFake.real : []);
  const [realVsFakeFake, setRealVsFakeFake] = useState<string[]>(Array.isArray(desc.realVsFake?.fake) ? desc.realVsFake.fake : []);
  const [storage, setStorage] = useState<string[]>(Array.isArray(desc.storage) ? desc.storage : []);
  const [suitableFor, setSuitableFor] = useState<string[]>(Array.isArray(desc.suitableFor) ? desc.suitableFor : []);
  const [specs, setSpecs] = useState({ origin: desc.specs?.origin || 'Sầm Sơn, Thanh Hóa', weight: desc.specs?.weight || '500g – 1kg', expiry: desc.specs?.expiry || '6 tháng' });
  const [commitment, setCommitment] = useState<string[]>(Array.isArray(desc.commitment) ? desc.commitment : []);
  const [cta, setCta] = useState(desc.cta || '');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const [images, setImages] = useState<string[]>(product?.images || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const toggleSection = (s: string) => setExpandedSections(prev => ({ ...prev, [s]: !prev[s] }));

  // Helper for string[] fields
  const ListEditor = ({ items, setItems, placeholder }: { items: string[]; setItems: (v: string[]) => void; placeholder: string }) => (
    <div className="space-y-1.5">
      {items.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input value={item} onChange={e => { const n = [...items]; n[i] = e.target.value; setItems(n); }}
            className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder={placeholder} />
          <button type="button" onClick={() => setItems(items.filter((_, j) => j !== i))} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><X className="h-3.5 w-3.5" /></button>
        </div>
      ))}
      <button type="button" onClick={() => setItems([...items, ''])} className="text-xs text-primary font-medium hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Thêm</button>
    </div>
  );

  const SectionHeader = ({ id, title, icon }: { id: string; title: string; icon: string }) => (
    <button type="button" onClick={() => toggleSection(id)}
      className="w-full flex items-center justify-between py-2 text-sm font-bold text-foreground hover:text-primary transition-colors">
      <span>{icon} {title}</span>
      {expandedSections[id] ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
    </button>
  );

  const uploadImages = async (files: File[]): Promise<string[]> => {
    const urls: string[] = [];
    for (const file of files) {
      const ext = file.name.split('.').pop();
      const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]);
  };
  const removeImage = (idx: number) => setImages(prev => prev.filter((_, i) => i !== idx));
  const removeNewFile = (idx: number) => setNewFiles(prev => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let allImages = [...images];
    if (newFiles.length > 0) {
      setUploading(true);
      const uploaded = await uploadImages(newFiles);
      allImages = [...allImages, ...uploaded];
      setUploading(false);
    }

    const descObj = {
      hook, intro,
      benefits: benefits.filter(Boolean),
      highlights,
      cooking: { methods: cookingMethods.filter(m => m.name), suggestions: cookingSuggestions.filter(Boolean) },
      choosingTips: choosingTips.filter(Boolean),
      realVsFake: { real: realVsFakeReal.filter(Boolean), fake: realVsFakeFake.filter(Boolean) },
      storage: storage.filter(Boolean),
      suitableFor: suitableFor.filter(Boolean),
      specs, commitment: commitment.filter(Boolean), cta,
    };

    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      price: Number(form.price), unit: form.unit, category: form.category, grade: form.grade,
      stock: Number(form.stock), rating: Number(form.rating),
      badges: form.badges ? form.badges.split(',').map(b => b.trim()).filter(Boolean) : [],
      needs: form.needs ? form.needs.split(',').map(n => n.trim()).filter(Boolean) : [],
      images: allImages, description: descObj,
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
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-5">
      <h3 className="font-bold text-foreground text-lg">{product ? '✏️ Sửa sản phẩm' : '➕ Thêm sản phẩm mới'}</h3>

      {/* Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-foreground mb-1">Tên sản phẩm *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Slug (URL)</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="tự động tạo"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Giá (₫) *</label>
          <input type="number" value={form.price} onChange={e => setForm(f => ({ ...f, price: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Đơn vị</label>
          <select value={form.unit} onChange={e => setForm(f => ({ ...f, unit: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
            {['kg', '500g', '250g', 'gói', 'hộp', 'combo'].map(u => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Danh mục *</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" required>
            <option value="">-- Chọn --</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Tồn kho</label>
          <input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Hạng</label>
          <select value={form.grade} onChange={e => setForm(f => ({ ...f, grade: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
            {['Cao cấp', 'Đặc biệt', 'Tiêu chuẩn', 'Premium'].map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Badges (phẩy ngăn)</label>
          <input value={form.badges} onChange={e => setForm(f => ({ ...f, badges: e.target.value }))} placeholder="hot, gift, new, sale"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Nhu cầu (phẩy ngăn)</label>
          <input value={form.needs} onChange={e => setForm(f => ({ ...f, needs: e.target.value }))} placeholder="nhậu, quà biếu"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
        </div>
      </div>

      {/* ===== STRUCTURED DESCRIPTION ===== */}
      <div className="border border-border rounded-xl overflow-hidden">
        <div className="bg-muted px-4 py-2.5">
          <h4 className="font-bold text-sm text-foreground">📝 Mô tả chi tiết sản phẩm</h4>
          <p className="text-xs text-muted-foreground">Bấm vào từng mục để chỉnh sửa</p>
        </div>

        <div className="divide-y divide-border">
          {/* Hook */}
          <div className="px-4">
            <SectionHeader id="hook" title="Câu hook (tiêu đề hấp dẫn)" icon="🔥" />
            {expandedSections.hook && (
              <div className="pb-3">
                <textarea value={hook} onChange={e => setHook(e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y"
                  placeholder="🔥 Mực khô Sầm Sơn loại 1 – Thịt dày, ngọt tự nhiên!" />
              </div>
            )}
          </div>

          {/* Intro */}
          <div className="px-4">
            <SectionHeader id="intro" title="Giới thiệu" icon="📖" />
            {expandedSections.intro && (
              <div className="pb-3">
                <textarea value={intro} onChange={e => setIntro(e.target.value)} rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y"
                  placeholder="Mô tả chi tiết về sản phẩm..." />
              </div>
            )}
          </div>

          {/* Benefits */}
          <div className="px-4">
            <SectionHeader id="benefits" title={`Lợi ích nổi bật (${benefits.length})`} icon="💪" />
            {expandedSections.benefits && (
              <div className="pb-3">
                <ListEditor items={benefits} setItems={setBenefits} placeholder="VD: Thịt dày, dai, ngọt tự nhiên" />
              </div>
            )}
          </div>

          {/* Highlights */}
          <div className="px-4">
            <SectionHeader id="highlights" title="Điểm nổi bật" icon="✨" />
            {expandedSections.highlights && (
              <div className="pb-3 space-y-2">
                <div>
                  <label className="text-xs text-muted-foreground">📍 Nguồn gốc</label>
                  <input value={highlights.origin} onChange={e => setHighlights(h => ({ ...h, origin: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Sầm Sơn, Thanh Hóa" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">🌞 Quy trình</label>
                  <input value={highlights.process} onChange={e => setHighlights(h => ({ ...h, process: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Phơi nắng tự nhiên 3 ngày" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground">📦 Đóng gói</label>
                  <input value={highlights.packaging} onChange={e => setHighlights(h => ({ ...h, packaging: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Hút chân không" />
                </div>
              </div>
            )}
          </div>

          {/* Cooking */}
          <div className="px-4">
            <SectionHeader id="cooking" title={`Cách chế biến (${cookingMethods.length} cách)`} icon="🍳" />
            {expandedSections.cooking && (
              <div className="pb-3 space-y-3">
                <p className="text-xs font-medium text-foreground">Cách chế biến:</p>
                {cookingMethods.map((m, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={m.name} onChange={e => { const n = [...cookingMethods]; n[i] = { ...n[i], name: e.target.value }; setCookingMethods(n); }}
                      className="w-1/3 px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Tên (VD: Nướng)" />
                    <input value={m.detail} onChange={e => { const n = [...cookingMethods]; n[i] = { ...n[i], detail: e.target.value }; setCookingMethods(n); }}
                      className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm" placeholder="Chi tiết cách làm" />
                    <button type="button" onClick={() => setCookingMethods(cookingMethods.filter((_, j) => j !== i))} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
                <button type="button" onClick={() => setCookingMethods([...cookingMethods, { name: '', detail: '' }])} className="text-xs text-primary font-medium hover:underline flex items-center gap-1"><Plus className="h-3 w-3" /> Thêm cách chế biến</button>

                <p className="text-xs font-medium text-foreground mt-3">Gợi ý ăn kèm:</p>
                <ListEditor items={cookingSuggestions} setItems={setCookingSuggestions} placeholder="VD: Xé khô nhậm bia" />
              </div>
            )}
          </div>

          {/* Choosing Tips */}
          <div className="px-4">
            <SectionHeader id="choosing" title={`Cách chọn hàng ngon (${choosingTips.length})`} icon="🔍" />
            {expandedSections.choosing && (
              <div className="pb-3">
                <ListEditor items={choosingTips} setItems={setChoosingTips} placeholder="VD: Thân mực đều, không gãy nát" />
              </div>
            )}
          </div>

          {/* Real vs Fake */}
          <div className="px-4">
            <SectionHeader id="realvsfake" title="Phân biệt thật – giả" icon="⚠️" />
            {expandedSections.realvsfake && (
              <div className="pb-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-bold text-green-700 mb-2">✅ Hàng ngon chuẩn</p>
                  <ListEditor items={realVsFakeReal} setItems={setRealVsFakeReal} placeholder="VD: Vàng nâu tự nhiên" />
                </div>
                <div>
                  <p className="text-xs font-bold text-destructive mb-2">⚠️ Hàng kém chất lượng</p>
                  <ListEditor items={realVsFakeFake} setItems={setRealVsFakeFake} placeholder="VD: Trắng đục bất thường" />
                </div>
              </div>
            )}
          </div>

          {/* Storage */}
          <div className="px-4">
            <SectionHeader id="storage" title={`Cách bảo quản (${storage.length})`} icon="❄️" />
            {expandedSections.storage && (
              <div className="pb-3">
                <ListEditor items={storage} setItems={setStorage} placeholder="VD: Ngăn mát: 45 ngày" />
              </div>
            )}
          </div>

          {/* Suitable For */}
          <div className="px-4">
            <SectionHeader id="suitable" title={`Phù hợp với (${suitableFor.length})`} icon="👥" />
            {expandedSections.suitable && (
              <div className="pb-3">
                <ListEditor items={suitableFor} setItems={setSuitableFor} placeholder="VD: Bữa cơm gia đình" />
              </div>
            )}
          </div>

          {/* Specs */}
          <div className="px-4">
            <SectionHeader id="specs" title="Thông tin sản phẩm" icon="📋" />
            {expandedSections.specs && (
              <div className="pb-3 space-y-2">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground">Xuất xứ</label>
                    <input value={specs.origin} onChange={e => setSpecs(s => ({ ...s, origin: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Quy cách</label>
                    <input value={specs.weight} onChange={e => setSpecs(s => ({ ...s, weight: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground">Hạn dùng</label>
                    <input value={specs.expiry} onChange={e => setSpecs(s => ({ ...s, expiry: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Commitment */}
          <div className="px-4">
            <SectionHeader id="commitment" title={`Cam kết của shop (${commitment.length})`} icon="🛡️" />
            {expandedSections.commitment && (
              <div className="pb-3">
                <ListEditor items={commitment} setItems={setCommitment} placeholder="VD: Mực Sầm Sơn 100%" />
              </div>
            )}
          </div>

          {/* CTA */}
          <div className="px-4">
            <SectionHeader id="cta" title="Lời kêu gọi mua hàng (CTA)" icon="🛒" />
            {expandedSections.cta && (
              <div className="pb-3">
                <textarea value={cta} onChange={e => setCta(e.target.value)} rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-y"
                  placeholder="Đặt hàng ngay hôm nay để nhận ưu đãi!" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-xs font-bold text-foreground mb-2">🖼️ Ảnh sản phẩm (chọn nhiều ảnh cùng lúc)</label>
        {images.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
                {i === 0 && <span className="absolute bottom-0 left-0 right-0 bg-primary text-primary-foreground text-[10px] text-center rounded-b-lg">Chính</span>}
              </div>
            ))}
          </div>
        )}
        {newFiles.length > 0 && (
          <div className="flex gap-2 flex-wrap mb-3">
            {newFiles.map((f, i) => (
              <div key={i} className="relative group">
                <img src={URL.createObjectURL(f)} alt="" className="w-20 h-20 object-cover rounded-lg border-2 border-dashed border-primary" />
                <button type="button" onClick={() => removeNewFile(i)}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <X className="h-3 w-3" />
                </button>
                <span className="absolute bottom-0 left-0 right-0 bg-primary/80 text-primary-foreground text-[10px] text-center rounded-b-lg">Mới</span>
              </div>
            ))}
          </div>
        )}
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Chọn nhiều ảnh</span>
          <input type="file" accept="image/*" multiple onChange={handleAddFiles} className="hidden" />
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving}
          className="ocean-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {uploading ? 'Đang upload ảnh...' : saving ? 'Đang lưu...' : 'Lưu sản phẩm'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
      </div>
    </form>
  );
}

// =================== COMBO FORM ===================
function ComboForm({ combo, products, onSave, onCancel }: { combo: DBCombo | null; products: DBProduct[]; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: combo?.name || '', slug: combo?.slug || '', tag: combo?.tag || '🔥 HOT',
    tag_color: combo?.tag_color || 'bg-coral text-primary-foreground',
    category: combo?.category || 'Quà biếu', description: combo?.description || '',
    original_price: combo?.original_price || 0, combo_price: combo?.combo_price || 0,
  });
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(combo?.product_ids || []);
  const [images, setImages] = useState<string[]>(combo?.images || []);
  const [mainImage, setMainImage] = useState(combo?.image || '');
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const COMBO_CATEGORIES = ['Quà Tết', 'Quà biếu sếp', 'Quà gia đình', 'Combo tiết kiệm', 'Quà biếu'];
  const TAG_COLORS = [
    { value: 'bg-coral text-primary-foreground', label: 'Đỏ coral' },
    { value: 'bg-purple-600 text-primary-foreground', label: 'Tím' },
    { value: 'bg-accent text-accent-foreground', label: 'Vàng' },
    { value: 'bg-green-600 text-primary-foreground', label: 'Xanh lá' },
    { value: 'bg-primary text-primary-foreground', label: 'Xanh biển' },
  ];

  const toggleProduct = (id: string) => {
    setSelectedProductIds(prev => prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]);
  };

  // Auto-calc original price
  useEffect(() => {
    const total = selectedProductIds.reduce((sum, id) => {
      const p = products.find(pr => pr.id === id);
      return sum + (p?.price || 0);
    }, 0);
    setForm(f => ({ ...f, original_price: total }));
  }, [selectedProductIds, products]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let allImages = [...images];
    for (const file of newFiles) {
      const ext = file.name.split('.').pop();
      const path = `combos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        allImages.push(data.publicUrl);
      }
    }

    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      tag: form.tag, tag_color: form.tag_color, category: form.category,
      description: form.description,
      product_ids: selectedProductIds,
      original_price: Number(form.original_price),
      combo_price: Number(form.combo_price),
      image: mainImage || allImages[0] || '',
      images: allImages,
    };

    if (combo) {
      const { error } = await supabase.from('combos').update(payload).eq('id', combo.id);
      if (error) toast.error('Lỗi: ' + error.message); else toast.success('Đã cập nhật combo!');
    } else {
      const { error } = await supabase.from('combos').insert(payload);
      if (error) toast.error('Lỗi: ' + error.message); else toast.success('Đã thêm combo!');
    }
    setSaving(false); onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-5">
      <h3 className="font-bold text-foreground text-lg">{combo ? '✏️ Sửa combo' : '➕ Thêm combo mới'}</h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-foreground mb-1">Tên combo *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Slug (URL)</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="tự động"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Tag</label>
          <input value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))} placeholder="🔥 HOT"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Màu tag</label>
          <select value={form.tag_color} onChange={e => setForm(f => ({ ...f, tag_color: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
            {TAG_COLORS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Danh mục</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
            {COMBO_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Giá combo (₫) *</label>
          <input type="number" value={form.combo_price} onChange={e => setForm(f => ({ ...f, combo_price: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" required />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-foreground mb-1">Mô tả</label>
        <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm resize-y" />
      </div>

      {/* Product selection */}
      <div>
        <label className="block text-xs font-bold text-foreground mb-2">🛒 Chọn sản phẩm trong combo (giá gốc tự tính: {formatPrice(form.original_price)})</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {products.filter(p => p.is_active).map(p => (
            <label key={p.id} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${selectedProductIds.includes(p.id) ? 'border-primary bg-primary/5' : 'border-border hover:bg-muted'}`}>
              <input type="checkbox" checked={selectedProductIds.includes(p.id)} onChange={() => toggleProduct(p.id)} className="rounded" />
              {p.images[0] && <img src={p.images[0]} alt="" className="w-10 h-10 rounded-lg object-cover" />}
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{p.name}</p>
                <p className="text-xs text-muted-foreground">{formatPrice(p.price)}/{p.unit}</p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Images */}
      <div>
        <label className="block text-xs font-bold text-foreground mb-2">🖼️ Ảnh combo</label>
        <div className="flex gap-2 flex-wrap mb-3">
          {images.map((url, i) => (
            <div key={i} className="relative group">
              <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
              <button type="button" onClick={() => { setImages(prev => prev.filter((_, idx) => idx !== i)); if (mainImage === url) setMainImage(''); }}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
              <button type="button" onClick={() => setMainImage(url)}
                className={`absolute bottom-0 left-0 right-0 text-[10px] text-center rounded-b-lg ${mainImage === url ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                {mainImage === url ? 'Chính' : 'Set chính'}
              </button>
            </div>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-border hover:border-primary cursor-pointer transition-colors">
          <Upload className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Chọn ảnh</span>
          <input type="file" accept="image/*" multiple onChange={e => { if (e.target.files) setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]); }} className="hidden" />
        </label>
      </div>

      <div className="flex gap-2 pt-2">
        <button type="submit" disabled={saving}
          className="ocean-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu combo'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
      </div>
    </form>
  );
}

function HotelForm({ hotel, onSave, onCancel }: { hotel: DBHotel | null; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: hotel?.name || '', slug: hotel?.slug || '', address: hotel?.address || '',
    phone: hotel?.phone || '', description: hotel?.description || '',
    category: hotel?.category || 'Cao cấp', discount_percent: hotel?.discount_percent || 10,
    amenities: hotel?.amenities?.join(', ') || '',
  });
  const [images, setImages] = useState<string[]>(hotel?.images || []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    let allImages = [...images];
    for (const file of newFiles) {
      const ext = file.name.split('.').pop();
      const path = `hotels/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage.from('product-images').upload(path, file);
      if (!error) {
        const { data } = supabase.storage.from('product-images').getPublicUrl(path);
        allImages.push(data.publicUrl);
      }
    }

    const payload = {
      name: form.name,
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, ''),
      address: form.address, phone: form.phone, description: form.description,
      category: form.category, discount_percent: Number(form.discount_percent),
      amenities: form.amenities ? form.amenities.split(',').map(a => a.trim()).filter(Boolean) : [],
      images: allImages,
    };

    if (hotel) {
      const { error } = await supabase.from('hotels').update(payload).eq('id', hotel.id);
      if (error) toast.error('Lỗi: ' + error.message); else toast.success('Đã cập nhật!');
    } else {
      const { error } = await supabase.from('hotels').insert(payload);
      if (error) toast.error('Lỗi: ' + error.message); else toast.success('Đã thêm!');
    }
    setSaving(false); onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-4">
      <h3 className="font-bold text-foreground text-lg">{hotel ? '✏️ Sửa khách sạn' : '➕ Thêm khách sạn mới'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Tên khách sạn *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Slug</label>
          <input value={form.slug} onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="tự động"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-foreground mb-1">Địa chỉ *</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Điện thoại</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Hạng</label>
          <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm">
            {['Cao cấp', 'Trung cấp', 'Bình dân', 'Resort'].map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">% Giảm giá cho khách</label>
          <input type="number" value={form.discount_percent} onChange={e => setForm(f => ({ ...f, discount_percent: Number(e.target.value) }))}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div>
          <label className="block text-xs font-bold text-foreground mb-1">Tiện ích (phẩy ngăn)</label>
          <input value={form.amenities} onChange={e => setForm(f => ({ ...f, amenities: e.target.value }))} placeholder="Wifi, Hồ bơi, Spa"
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-foreground mb-1">Mô tả</label>
          <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={4}
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm resize-y" />
        </div>
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-foreground mb-1">Ảnh</label>
          <div className="flex gap-2 flex-wrap mb-2">
            {images.map((url, i) => (
              <div key={i} className="relative group">
                <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border border-border" />
                <button type="button" onClick={() => setImages(prev => prev.filter((_, idx) => idx !== i))}
                  className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"><X className="h-3 w-3" /></button>
              </div>
            ))}
          </div>
          <input type="file" accept="image/*" multiple onChange={e => { if (e.target.files) setNewFiles(prev => [...prev, ...Array.from(e.target.files!)]); }} className="text-sm" />
        </div>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="ocean-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
      </div>
    </form>
  );
}

// =================== STORE FORM ===================
function StoreForm({ store, onSave, onCancel }: { store: DBStore | null; onSave: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    name: store?.name || '', address: store?.address || '',
    lat: store?.lat || 19.755, lng: store?.lng || 105.904,
    phone: store?.phone || '', hours: store?.hours || '7:00 – 21:00',
  });
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const mapPreviewSrc = `https://maps.google.com/maps?q=${form.lat},${form.lng}&z=16&output=embed`;

  const handleSearchLocation = () => {
    if (!searchQuery.trim()) return;
    // Try to parse "lat, lng" format
    const match = searchQuery.match(/^(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)$/);
    if (match) {
      setForm(f => ({ ...f, lat: Number(match[1]), lng: Number(match[2]) }));
    } else {
      // Open Google Maps search in new tab for user to find coordinates
      window.open(`https://www.google.com/maps/search/${encodeURIComponent(searchQuery)}`, '_blank');
    }
  };

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
      <h3 className="font-bold text-foreground text-lg">{store ? '✏️ Sửa cửa hàng' : '➕ Thêm cửa hàng mới'}</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div><label className="block text-xs font-bold text-foreground mb-1">Tên *</label>
          <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" required /></div>
        <div><label className="block text-xs font-bold text-foreground mb-1">Điện thoại *</label>
          <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" required /></div>
        <div className="md:col-span-2"><label className="block text-xs font-bold text-foreground mb-1">Địa chỉ *</label>
          <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" required /></div>
        
        {/* Paste iframe embed from Google Maps */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-foreground mb-1">📋 Dán iframe từ Google Maps</label>
          <textarea
            placeholder='Dán mã <iframe src="https://www.google.com/maps/embed?..."></iframe> vào đây'
            className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm font-mono h-20"
            onChange={e => {
              const val = e.target.value;
              // Extract src from iframe
              const srcMatch = val.match(/src=["']([^"']+)["']/);
              if (srcMatch) {
                const url = srcMatch[1];
                // Try !2d (lng) and !3d (lat) pattern
                const latMatch = url.match(/!3d(-?\d+\.?\d*)/);
                const lngMatch = url.match(/!2d(-?\d+\.?\d*)/);
                if (latMatch && lngMatch) {
                  setForm(f => ({ ...f, lat: Number(latMatch[1]), lng: Number(lngMatch[1]) }));
                  toast.success('Đã lấy tọa độ từ iframe!');
                  return;
                }
                // Try q=lat,lng pattern
                const qMatch = url.match(/[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/);
                if (qMatch) {
                  setForm(f => ({ ...f, lat: Number(qMatch[1]), lng: Number(qMatch[2]) }));
                  toast.success('Đã lấy tọa độ từ iframe!');
                  return;
                }
                // Try pb= pattern with @lat,lng
                const atMatch = url.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
                if (atMatch) {
                  setForm(f => ({ ...f, lat: Number(atMatch[1]), lng: Number(atMatch[2]) }));
                  toast.success('Đã lấy tọa độ từ iframe!');
                  return;
                }
              }
              // Try direct coordinate paste
              const coordMatch = val.match(/(-?\d+\.?\d*)\s*,\s*(-?\d+\.?\d*)/);
              if (coordMatch) {
                setForm(f => ({ ...f, lat: Number(coordMatch[1]), lng: Number(coordMatch[2]) }));
                toast.success('Đã lấy tọa độ!');
                return;
              }
            }}
          />
          <p className="text-[10px] text-muted-foreground mt-1">
            💡 Vào Google Maps → Tìm địa điểm → Chia sẻ → Nhúng bản đồ → Copy iframe → Dán vào đây
          </p>
        </div>

        {/* Manual coordinate input */}
        <div className="md:col-span-2">
          <label className="block text-xs font-bold text-foreground mb-1">🔍 Hoặc nhập tọa độ thủ công</label>
          <div className="flex gap-2">
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
              placeholder="Nhập tọa độ (VD: 19.758, 105.904) hoặc tên địa điểm"
              className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm"
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleSearchLocation())} />
            <button type="button" onClick={handleSearchLocation}
              className="px-4 py-2.5 rounded-lg text-sm font-bold bg-primary text-primary-foreground hover:opacity-90">
              Tìm
            </button>
          </div>
        </div>

        <div><label className="block text-xs font-bold text-foreground mb-1">📍 Vĩ độ (Latitude)</label>
          <input type="number" step="any" value={form.lat} onChange={e => setForm(f => ({ ...f, lat: Number(e.target.value) }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" /></div>
        <div><label className="block text-xs font-bold text-foreground mb-1">📍 Kinh độ (Longitude)</label>
          <input type="number" step="any" value={form.lng} onChange={e => setForm(f => ({ ...f, lng: Number(e.target.value) }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" /></div>
        <div><label className="block text-xs font-bold text-foreground mb-1">Giờ mở cửa</label>
          <input value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" /></div>
      </div>

      {/* Map Preview */}
      <div>
        <label className="block text-xs font-bold text-foreground mb-2">🗺️ Xem trước vị trí trên bản đồ</label>
        <div className="rounded-xl overflow-hidden border border-border h-[250px] md:h-[300px]">
          <iframe
            src={mapPreviewSrc}
            className="w-full h-full border-0"
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Xem trước vị trí cửa hàng"
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">
          Tọa độ hiện tại: <span className="font-mono font-bold">{form.lat}, {form.lng}</span>
        </p>
      </div>

      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="ocean-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50">
          <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
        </button>
        <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
      </div>
    </form>
  );
}
// =================== CONTENT MANAGER ===================
function ContentManager() {
  const [contentKey, setContentKey] = useState('banner');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const contentKeys = [
    { key: 'banner', label: '🖼️ Banner trang chủ', desc: 'Tiêu đề, slogan, ảnh banner' },
    { key: 'about', label: '📖 Giới thiệu', desc: 'Nội dung trang giới thiệu' },
    { key: 'policy', label: '📋 Chính sách', desc: 'Chính sách bán hàng' },
    { key: 'contact', label: '📞 Liên hệ', desc: 'Thông tin liên hệ' },
    { key: 'footer', label: '🔻 Footer', desc: 'Nội dung chân trang' },
    { key: 'promotions', label: '🎉 Khuyến mãi', desc: 'Nội dung khuyến mãi' },
  ];

  useEffect(() => { loadContent(); }, [contentKey]);

  const loadContent = async () => {
    setLoading(true);
    const { data } = await supabase.from('site_settings').select('value').eq('key', contentKey).maybeSingle();
    setContent(data ? (typeof data.value === 'string' ? data.value : JSON.stringify(data.value, null, 2)) : '');
    setLoading(false);
  };

  const saveContent = async () => {
    setSaving(true);
    let val: any;
    try { val = JSON.parse(content); } catch { val = content; }

    const { data: existing } = await supabase.from('site_settings').select('id').eq('key', contentKey).maybeSingle();
    if (existing) {
      await supabase.from('site_settings').update({ value: val }).eq('key', contentKey);
    } else {
      await supabase.from('site_settings').insert({ key: contentKey, value: val });
    }
    toast.success('Đã lưu nội dung!');
    setSaving(false);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <div className="space-y-1">
        <h3 className="font-bold text-foreground mb-3">Quản lý nội dung</h3>
        {contentKeys.map(ck => (
          <button key={ck.key} onClick={() => setContentKey(ck.key)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${contentKey === ck.key ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted text-foreground'}`}>
            <p className="font-medium">{ck.label}</p>
            <p className="text-xs opacity-70">{ck.desc}</p>
          </button>
        ))}
      </div>
      <div className="md:col-span-3">
        <div className="bg-card rounded-xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-foreground">{contentKeys.find(c => c.key === contentKey)?.label}</h3>
            <button onClick={saveContent} disabled={saving}
              className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-12"><RefreshCw className="h-5 w-5 animate-spin text-primary" /></div>
          ) : (
            <textarea value={content} onChange={e => setContent(e.target.value)} rows={20}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background text-sm font-mono resize-y"
              placeholder="Nhập nội dung JSON hoặc text..." />
          )}
        </div>
      </div>
    </div>
  );
}

// =================== SETTINGS ===================
function SettingsTab({ user, products, stores, members, hotels }: any) {
  const [changingPw, setChangingPw] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [addAdminEmail, setAddAdminEmail] = useState('');
  const [addingAdmin, setAddingAdmin] = useState(false);

  const changePassword = async () => {
    if (newPassword.length < 6) { toast.error('Mật khẩu tối thiểu 6 ký tự'); return; }
    if (newPassword !== confirmPassword) { toast.error('Mật khẩu không khớp'); return; }
    setPwLoading(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error('Lỗi: ' + error.message);
    else { toast.success('Đã đổi mật khẩu!'); setChangingPw(false); setNewPassword(''); setConfirmPassword(''); }
    setPwLoading(false);
  };

  const addAdmin = async () => {
    if (!addAdminEmail.trim()) return;
    setAddingAdmin(true);
    // Look up user by email in profiles
    const { data: profile } = await supabase.from('profiles').select('id').eq('email', addAdminEmail.trim()).maybeSingle();
    if (!profile) {
      toast.error('Không tìm thấy user với email này. User cần đăng ký trước.');
      setAddingAdmin(false); return;
    }
    const { error } = await supabase.from('user_roles').insert({ user_id: profile.id, role: 'admin' as any });
    if (error) {
      if (error.message.includes('duplicate')) toast.error('User đã là admin');
      else toast.error('Lỗi: ' + error.message);
    } else {
      toast.success('Đã thêm admin: ' + addAdminEmail);
      setAddAdminEmail('');
    }
    setAddingAdmin(false);
  };

  return (
    <div className="max-w-2xl space-y-6">
      <h2 className="text-lg font-bold text-foreground">Cài đặt hệ thống</h2>

      {/* Stats */}
      <div className="bg-card rounded-xl border border-border p-6 space-y-3">
        <h3 className="font-bold text-foreground mb-3">📊 Tổng quan</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Admin</p><p className="font-bold text-foreground">{user?.email}</p></div>
          <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Sản phẩm</p><p className="font-bold text-foreground">{products.length}</p></div>
          <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Cửa hàng</p><p className="font-bold text-foreground">{stores.length}</p></div>
          <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Khách sạn</p><p className="font-bold text-foreground">{hotels.length}</p></div>
          <div className="p-3 bg-muted rounded-lg"><p className="text-xs text-muted-foreground">Thành viên</p><p className="font-bold text-foreground">{members.length}</p></div>
        </div>
      </div>

      {/* Change password */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Lock className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">Đổi mật khẩu</h3>
        </div>
        {!changingPw ? (
          <button onClick={() => setChangingPw(true)} className="text-sm text-primary font-medium hover:underline">Đổi mật khẩu →</button>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Mật khẩu mới</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" placeholder="Tối thiểu 6 ký tự" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Xác nhận mật khẩu</label>
              <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div className="flex gap-2">
              <button onClick={changePassword} disabled={pwLoading}
                className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
                {pwLoading ? 'Đang đổi...' : 'Xác nhận đổi'}
              </button>
              <button onClick={() => setChangingPw(false)} className="px-4 py-2 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
            </div>
          </div>
        )}
      </div>

      {/* Add admin */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="font-bold text-foreground">Thêm Admin</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">User cần đăng ký tài khoản trước, sau đó nhập email để phân quyền admin.</p>
        <div className="flex gap-2">
          <input value={addAdminEmail} onChange={e => setAddAdminEmail(e.target.value)} placeholder="email@example.com"
            className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
          <button onClick={addAdmin} disabled={addingAdmin}
            className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 disabled:opacity-50">
            <UserPlus className="h-4 w-4" /> {addingAdmin ? 'Đang thêm...' : 'Thêm'}
          </button>
        </div>
      </div>
    </div>
  );
}

// =================== COUPON MANAGER ===================
function CouponManager({ coupons, fetchCoupons }: { coupons: DBCoupon[]; fetchCoupons: () => void }) {
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DBCoupon | null>(null);
  const [form, setForm] = useState({ code: '', discount_percent: 10, max_uses: 100, min_order: 0, expires_at: '' });
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setEditing(null);
    setForm({ code: '', discount_percent: 10, max_uses: 100, min_order: 0, expires_at: '' });
    setShowForm(true);
  };

  const openEdit = (c: DBCoupon) => {
    setEditing(c);
    setForm({
      code: c.code, discount_percent: c.discount_percent, max_uses: c.max_uses,
      min_order: c.min_order, expires_at: c.expires_at ? c.expires_at.slice(0, 16) : '',
    });
    setShowForm(true);
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = 'GN';
    for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
    setForm(f => ({ ...f, code }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.code.trim()) { toast.error('Nhập mã giảm giá'); return; }
    setSaving(true);

    const payload: any = {
      code: form.code.toUpperCase().trim(),
      discount_percent: Number(form.discount_percent),
      max_uses: Number(form.max_uses),
      min_order: Number(form.min_order),
      expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
    };

    if (editing) {
      const { error } = await supabase.from('coupons').update(payload).eq('id', editing.id);
      if (error) toast.error('Lỗi: ' + error.message); else toast.success('Đã cập nhật mã!');
    } else {
      const { error } = await supabase.from('coupons').insert(payload);
      if (error) {
        if (error.message.includes('duplicate')) toast.error('Mã này đã tồn tại!');
        else toast.error('Lỗi: ' + error.message);
      } else toast.success('Đã tạo mã giảm giá!');
    }
    setSaving(false); setShowForm(false); fetchCoupons();
  };

  const toggleActive = async (c: DBCoupon) => {
    await supabase.from('coupons').update({ is_active: !c.is_active }).eq('id', c.id);
    fetchCoupons();
  };

  const deleteCoupon = async (id: string) => {
    if (!confirm('Xóa mã giảm giá này?')) return;
    await supabase.from('coupons').delete().eq('id', id);
    toast.success('Đã xóa'); fetchCoupons();
  };

  const isExpired = (c: DBCoupon) => c.expires_at && new Date(c.expires_at) < new Date();
  const isUsedUp = (c: DBCoupon) => c.used_count >= c.max_uses;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-foreground">Quản lý mã giảm giá ({coupons.length})</h2>
        <button onClick={openNew}
          className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-1.5 hover:opacity-90">
          <Plus className="h-4 w-4" /> Tạo mã mới
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-6 mb-6 space-y-4">
          <h3 className="font-bold text-foreground text-lg">{editing ? '✏️ Sửa mã giảm giá' : '➕ Tạo mã giảm giá mới'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Mã giảm giá *</label>
              <div className="flex gap-2">
                <input value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                  placeholder="VD: GNSALE10" className="flex-1 px-3 py-2.5 rounded-lg border border-border bg-background text-sm font-mono font-bold uppercase" required />
                <button type="button" onClick={generateCode} className="px-3 py-2 rounded-lg border border-border hover:bg-muted text-xs font-medium">Tự tạo</button>
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">% Giảm giá *</label>
              <div className="relative">
                <input type="number" min="1" max="100" value={form.discount_percent}
                  onChange={e => setForm(f => ({ ...f, discount_percent: Number(e.target.value) }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm pr-8" required />
                <Percent className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Số lần dùng tối đa</label>
              <input type="number" min="1" value={form.max_uses}
                onChange={e => setForm(f => ({ ...f, max_uses: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Đơn tối thiểu (₫)</label>
              <input type="number" min="0" value={form.min_order}
                onChange={e => setForm(f => ({ ...f, min_order: Number(e.target.value) }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
            </div>
            <div>
              <label className="block text-xs font-bold text-foreground mb-1">Hạn sử dụng</label>
              <input type="datetime-local" value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm" />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={saving}
              className="ocean-gradient text-primary-foreground px-6 py-2.5 rounded-lg text-sm font-bold hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50">
              <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Lưu mã'}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2.5 rounded-lg text-sm border border-border hover:bg-muted">Hủy</button>
          </div>
        </form>
      )}

      {/* Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted text-muted-foreground">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Mã</th>
                <th className="text-center px-4 py-3 font-medium">Giảm</th>
                <th className="text-center px-4 py-3 font-medium">Đã dùng</th>
                <th className="text-right px-4 py-3 font-medium">Đơn tối thiểu</th>
                <th className="text-center px-4 py-3 font-medium">Hạn dùng</th>
                <th className="text-center px-4 py-3 font-medium">Trạng thái</th>
                <th className="text-center px-4 py-3 font-medium">Hành động</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {coupons.map(c => {
                const expired = isExpired(c);
                const usedUp = isUsedUp(c);
                return (
                  <tr key={c.id} className={`hover:bg-muted/50 ${(!c.is_active || expired || usedUp) ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-primary text-base">{c.code}</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="text-coral font-black text-lg">{c.discount_percent}%</span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`font-bold ${c.used_count >= c.max_uses ? 'text-destructive' : 'text-foreground'}`}>
                        {c.used_count}/{c.max_uses}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">
                      {c.min_order > 0 ? formatPrice(c.min_order) : 'Không'}
                    </td>
                    <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                      {c.expires_at ? (
                        <span className={expired ? 'text-destructive font-bold' : ''}>
                          {expired ? '⏰ Hết hạn' : new Date(c.expires_at).toLocaleDateString('vi-VN')}
                        </span>
                      ) : 'Không giới hạn'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => toggleActive(c)}>
                        {c.is_active && !expired && !usedUp ? (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold">✅ Hoạt động</span>
                        ) : (
                          <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full font-bold">
                            {expired ? '⏰ Hết hạn' : usedUp ? '🔴 Hết lượt' : '⬜ Tắt'}
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button onClick={() => openEdit(c)} className="p-1.5 hover:bg-muted rounded-lg text-primary"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => deleteCoupon(c.id)} className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {coupons.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-muted-foreground">Chưa có mã giảm giá. Bấm "Tạo mã mới" để bắt đầu!</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
