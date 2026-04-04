import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { User, ShoppingBag, Gift, LogOut, Crown, Star, ArrowLeft, RefreshCw, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatPrice } from '@/data/products';

interface Profile {
  id: string;
  name: string;
  phone: string;
  email: string;
  birthday: string | null;
  level: string;
  points: number;
  total_spent: number;
}

interface Order {
  id: string;
  order_code: string;
  items: any[];
  total: number;
  points_earned: number;
  status: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

const LEVEL_CONFIG: Record<string, { icon: string; color: string; cashback: number; next: string; nextAmount: number }> = {
  'Thường': { icon: '⭐', color: 'bg-muted text-foreground', cashback: 2, next: 'VIP', nextAmount: 3000000 },
  'VIP': { icon: '🥇', color: 'bg-yellow-100 text-yellow-800', cashback: 5, next: 'PRO', nextAmount: 10000000 },
  'PRO': { icon: '💎', color: 'bg-purple-100 text-purple-800', cashback: 10, next: '', nextAmount: 0 },
};

export default function Account() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [tab, setTab] = useState<'dashboard' | 'orders' | 'profile'>('dashboard');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', birthday: '' });

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchOrders();
    }
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle();
    if (data) {
      setProfile(data as unknown as Profile);
      setProfileForm({ name: data.name || '', phone: data.phone || '', birthday: data.birthday || '' });
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    const { data } = await supabase.from('orders').select('*').eq('user_id', user!.id).order('created_at', { ascending: false });
    if (data) setOrders(data as unknown as Order[]);
  };

  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').update({
      name: profileForm.name,
      phone: profileForm.phone,
      birthday: profileForm.birthday || null,
    }).eq('id', user!.id);
    if (error) toast.error('Lỗi cập nhật');
    else { toast.success('Đã cập nhật!'); fetchProfile(); setEditingProfile(false); }
  };

  const reorder = (order: Order) => {
    (order.items as any[]).forEach((item: any) => {
      addItem({ productId: item.productId || item.id, name: item.name, price: item.price, image: item.image || '', unit: item.unit || 'kg' });
    });
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  if (!user || !profile) return null;

  const levelConfig = LEVEL_CONFIG[profile.level] || LEVEL_CONFIG['Thường'];
  const progress = levelConfig.nextAmount > 0 ? Math.min((profile.total_spent / levelConfig.nextAmount) * 100, 100) : 100;

  const tabs = [
    { id: 'dashboard' as const, label: 'Tổng quan', icon: User },
    { id: 'orders' as const, label: 'Đơn hàng', icon: ShoppingBag },
    { id: 'profile' as const, label: 'Hồ sơ', icon: Crown },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Về trang chủ
        </Link>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 w-fit">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
          <button onClick={handleSignOut} className="flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium text-destructive hover:bg-destructive/10">
            <LogOut className="h-4 w-4" /> Thoát
          </button>
        </div>

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div className="space-y-4">
            {/* Welcome card */}
            <div className="ocean-gradient rounded-2xl p-6 text-primary-foreground">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-80">Xin chào</p>
                  <h1 className="text-2xl font-black">{profile.name || profile.email}</h1>
                  <div className="flex items-center gap-2 mt-2">
                    <span className={`${levelConfig.color} px-3 py-1 rounded-full text-xs font-bold`}>
                      {levelConfig.icon} {profile.level}
                    </span>
                    <span className="text-xs opacity-80">Hoàn tiền {levelConfig.cashback}%</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{profile.points.toLocaleString()}</p>
                  <p className="text-xs opacity-80">Điểm tích lũy</p>
                  <p className="text-[10px] opacity-60">1 điểm = 1₫</p>
                </div>
              </div>

              {/* Level progress */}
              {levelConfig.next && (
                <div className="mt-4">
                  <div className="flex justify-between text-xs opacity-80 mb-1">
                    <span>{profile.level}</span>
                    <span>{levelConfig.next} ({formatPrice(levelConfig.nextAmount)})</span>
                  </div>
                  <div className="bg-primary-foreground/20 rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[10px] opacity-60 mt-1">
                    Còn {formatPrice(Math.max(0, levelConfig.nextAmount - profile.total_spent))} nữa để lên {levelConfig.next}
                  </p>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-black text-primary">{orders.length}</p>
                <p className="text-xs text-muted-foreground">Đơn hàng</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-black text-coral">{formatPrice(profile.total_spent)}</p>
                <p className="text-xs text-muted-foreground">Tổng chi tiêu</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-black text-accent">{profile.points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Điểm hiện có</p>
              </div>
            </div>

            {/* Recent orders */}
            {orders.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-bold text-foreground mb-3">Đơn hàng gần đây</h3>
                {orders.slice(0, 3).map(order => {
                  const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                  return (
                    <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="font-bold text-foreground text-sm">{order.order_code}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                        <span className="font-bold text-sm text-foreground">{formatPrice(order.total)}</span>
                      </div>
                    </div>
                  );
                })}
                <button onClick={() => setTab('orders')} className="text-primary text-xs font-bold mt-2 hover:underline">
                  Xem tất cả →
                </button>
              </div>
            )}

            {/* Birthday benefit */}
            {!profile.birthday && (
              <div className="bg-accent/10 rounded-xl border border-accent/30 p-4 flex items-center gap-3">
                <Gift className="h-8 w-8 text-accent flex-shrink-0" />
                <div>
                  <p className="font-bold text-foreground text-sm">Nhập ngày sinh nhận mã giảm 10%!</p>
                  <button onClick={() => { setTab('profile'); setEditingProfile(true); }}
                    className="text-accent text-xs font-bold hover:underline">Cập nhật ngay →</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Lịch sử đơn hàng ({orders.length})</h2>
            {orders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Chưa có đơn hàng nào</p>
                <Link to="/" className="text-primary text-sm font-bold hover:underline mt-2 inline-block">Mua sắm ngay →</Link>
              </div>
            ) : (
              orders.map(order => {
                const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                return (
                  <div key={order.id} className="bg-card rounded-xl border border-border p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-foreground">{order.order_code}</p>
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {(order.items as any[]).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-foreground">{item.name} x{item.quantity}</span>
                          <span className="text-muted-foreground">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-black text-primary">{formatPrice(order.total)}</span>
                        {order.points_earned > 0 && (
                          <span className="text-xs text-accent font-medium">+{order.points_earned} điểm</span>
                        )}
                      </div>
                      <button onClick={() => reorder(order)}
                        className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                        <RefreshCw className="h-3 w-3" /> Mua lại
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Profile edit */}
        {tab === 'profile' && (
          <div className="max-w-lg space-y-4">
            <h2 className="text-lg font-bold text-foreground">Thông tin cá nhân</h2>
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Họ tên</label>
                <input value={profileForm.name} onChange={e => setProfileForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Email</label>
                <input value={profile.email} disabled
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-muted text-sm text-muted-foreground" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Số điện thoại</label>
                <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-1">
                  <Calendar className="h-3 w-3" /> Ngày sinh (nhận mã giảm 10%)
                </label>
                <input type="date" value={profileForm.birthday} onChange={e => setProfileForm(f => ({ ...f, birthday: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <button onClick={saveProfile}
                className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg text-sm hover:opacity-90">
                LƯU THAY ĐỔI
              </button>
            </div>

            {/* Level info */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-bold text-foreground mb-3">Hạng thành viên</h3>
              <div className="space-y-3">
                {Object.entries(LEVEL_CONFIG).map(([level, config]) => (
                  <div key={level} className={`flex items-center justify-between p-3 rounded-lg ${profile.level === level ? 'bg-primary/10 border border-primary/30' : 'bg-muted'}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{config.icon}</span>
                      <div>
                        <p className={`font-bold text-sm ${profile.level === level ? 'text-primary' : 'text-foreground'}`}>{level}</p>
                        <p className="text-[10px] text-muted-foreground">
                          {level === 'Thường' ? 'Mặc định' : level === 'VIP' ? 'Chi tiêu ≥ 3.000.000₫' : 'Chi tiêu ≥ 10.000.000₫'}
                        </p>
                      </div>
                    </div>
                    <span className={`text-xs font-bold ${profile.level === level ? 'text-primary' : 'text-muted-foreground'}`}>
                      Hoàn {config.cashback}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
