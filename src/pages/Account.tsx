import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { User, ShoppingBag, Gift, LogOut, Crown, ArrowLeft, RefreshCw, Calendar, MessageSquare, Send, Lock, Eye, EyeOff } from 'lucide-react';
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
  user_id: string | null;
}

interface ChatMsg {
  id: string;
  sender: 'customer' | 'admin';
  content: string;
  created_at: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  deposit_paid: { label: 'Đã cọc', color: 'bg-blue-100 text-blue-800' },
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
  const [tab, setTab] = useState<'dashboard' | 'orders' | 'profile' | 'chat' | 'security'>('dashboard');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '', birthday: '' });

  // Chat
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Password
  const [oldPwd, setOldPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  // After profile loads, fetch orders matched by user_id, email, phone
  useEffect(() => {
    if (profile) fetchOrders();
  }, [profile]);

  // Realtime chat
  useEffect(() => {
    if (!user) return;
    fetchMessages();
    const ch = supabase
      .channel(`customer-chat-${user.id}`)
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'customer_chat_messages', filter: `user_id=eq.${user.id}` },
        () => fetchMessages())
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [user]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, tab]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle();
    if (data) {
      setProfile(data as unknown as Profile);
      setProfileForm({ name: data.name || '', phone: data.phone || '', birthday: data.birthday || '' });
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    if (!profile) return;
    // Try fetching all orders matching user_id OR email OR phone (RLS allows it)
    const filters: string[] = [`user_id.eq.${user!.id}`];
    if (profile.email) filters.push(`customer_email.ilike.${profile.email}`);
    if (profile.phone) filters.push(`customer_phone.eq.${profile.phone}`);

    const { data } = await supabase
      .from('orders')
      .select('*')
      .or(filters.join(','))
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });
    if (data) setOrders(data as unknown as Order[]);
  };

  const fetchMessages = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('customer_chat_messages')
      .select('id,sender,content,created_at')
      .eq('user_id', user.id)
      .order('created_at');
    if (data) setMessages(data as ChatMsg[]);
  };

  const sendMessage = async () => {
    if (!chatInput.trim() || sending || !user) return;
    setSending(true);
    const { error } = await supabase.from('customer_chat_messages').insert({
      user_id: user.id,
      sender: 'customer',
      content: chatInput.trim(),
    } as any);
    if (error) toast.error('Lỗi gửi: ' + error.message);
    else setChatInput('');
    setSending(false);
  };

  const saveProfile = async () => {
    const { error } = await supabase.from('profiles').update({
      name: profileForm.name,
      phone: profileForm.phone,
      birthday: profileForm.birthday || null,
    }).eq('id', user!.id);
    if (error) toast.error('Lỗi cập nhật');
    else { toast.success('Đã cập nhật! Đơn hàng cũ sẽ tự đồng bộ.'); fetchProfile(); }
  };

  const changePassword = async () => {
    if (newPwd.length < 6) { toast.error('Mật khẩu mới tối thiểu 6 ký tự'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) toast.error('Lỗi: ' + error.message);
    else { toast.success('Đã đổi mật khẩu!'); setOldPwd(''); setNewPwd(''); }
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
  const initials = (profile.name || profile.email || 'U').slice(0, 2).toUpperCase();

  const tabs = [
    { id: 'dashboard' as const, label: 'Tổng quan', icon: User },
    { id: 'orders' as const, label: `Đơn hàng (${orders.length})`, icon: ShoppingBag },
    { id: 'chat' as const, label: 'Chat Admin', icon: MessageSquare },
    { id: 'profile' as const, label: 'Hồ sơ', icon: Crown },
    { id: 'security' as const, label: 'Bảo mật', icon: Lock },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Về trang chủ
        </Link>

        {/* Profile header (FB/TikTok-like) */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4">
          <div className="ocean-gradient h-20" />
          <div className="px-4 pb-4 -mt-10">
            <div className="flex items-end gap-3">
              <div className="w-20 h-20 rounded-full bg-accent text-accent-foreground border-4 border-card flex items-center justify-center text-2xl font-black shadow-md">
                {initials}
              </div>
              <div className="flex-1 pb-1">
                <h1 className="text-lg font-black text-foreground leading-tight">{profile.name || 'Chưa đặt tên'}</h1>
                <p className="text-xs text-muted-foreground">{profile.email}</p>
                <span className={`${levelConfig.color} px-2 py-0.5 rounded-full text-[10px] font-bold inline-block mt-1`}>
                  {levelConfig.icon} {profile.level}
                </span>
              </div>
              <button onClick={handleSignOut}
                className="text-xs text-destructive hover:underline flex items-center gap-1">
                <LogOut className="h-3.5 w-3.5" /> Thoát
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-muted rounded-lg p-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors whitespace-nowrap ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* Dashboard */}
        {tab === 'dashboard' && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-black text-primary">{orders.length}</p>
                <p className="text-xs text-muted-foreground">Đơn đã đặt</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-xl font-black text-coral">{formatPrice(profile.total_spent)}</p>
                <p className="text-xs text-muted-foreground">Tổng chi tiêu</p>
              </div>
              <div className="bg-card rounded-xl border border-border p-4 text-center">
                <p className="text-2xl font-black text-accent">{profile.points.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Điểm</p>
              </div>
            </div>

            {levelConfig.next && (
              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-bold">{profile.level}</span>
                  <span className="text-muted-foreground">{levelConfig.next} ({formatPrice(levelConfig.nextAmount)})</span>
                </div>
                <div className="bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">
                  Còn {formatPrice(Math.max(0, levelConfig.nextAmount - profile.total_spent))} để lên {levelConfig.next}
                </p>
              </div>
            )}

            {orders.length > 0 && (
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-bold text-foreground mb-3">Đơn gần đây</h3>
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
          </div>
        )}

        {/* Orders */}
        {tab === 'orders' && (
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-foreground">Lịch sử đơn hàng ({orders.length})</h2>
            <p className="text-xs text-muted-foreground">
              Tự động đồng bộ tất cả đơn theo email <strong>{profile.email}</strong>
              {profile.phone && <> và SĐT <strong>{profile.phone}</strong></>}.
              {!profile.phone && <span className="text-coral"> (Cập nhật SĐT để đồng bộ thêm đơn cũ)</span>}
            </p>
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
                        <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
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
                      <div className="flex items-center gap-3">
                        <Link to={`/tra-cuu-don?code=${order.order_code}`} className="text-xs font-bold text-muted-foreground hover:text-primary hover:underline">
                          Theo dõi
                        </Link>
                        <button onClick={() => reorder(order)}
                          className="flex items-center gap-1 text-xs font-bold text-primary hover:underline">
                          <RefreshCw className="h-3 w-3" /> Mua lại
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        {/* Chat with admin */}
        {tab === 'chat' && (
          <div className="bg-card rounded-xl border border-border flex flex-col h-[500px] overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30">
              <p className="font-bold text-sm flex items-center gap-2"><MessageSquare className="h-4 w-4 text-primary" /> Chat với Admin</p>
              <p className="text-[11px] text-muted-foreground">Hỗ trợ trong giờ 7:00 – 21:00. Phản hồi trung bình 5–10 phút.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Chưa có tin nhắn. Gửi câu hỏi đầu tiên!</p>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${msg.sender === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'customer' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {msg.sender === 'admin' && '👨‍💼 Admin · '}
                      {new Date(msg.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input value={chatInput} onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); } }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <button onClick={sendMessage} disabled={!chatInput.trim() || sending}
                className="px-4 py-2 ocean-gradient text-primary-foreground rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-1">
                <Send className="h-4 w-4" /> Gửi
              </button>
            </div>
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
                <label className="block text-xs font-medium text-foreground mb-1">Số điện thoại (để đồng bộ đơn cũ)</label>
                <input value={profileForm.phone} onChange={e => setProfileForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0912345678"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="text-xs font-medium text-foreground mb-1 flex items-center gap-1">
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
          </div>
        )}

        {/* Security: change password */}
        {tab === 'security' && (
          <div className="max-w-lg space-y-4">
            <h2 className="text-lg font-bold text-foreground">Đổi mật khẩu</h2>
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Mật khẩu mới</label>
                <div className="relative">
                  <input type={showPwd ? 'text' : 'password'} value={newPwd} onChange={e => setNewPwd(e.target.value)}
                    placeholder="Tối thiểu 6 ký tự"
                    className="w-full px-3 py-2.5 pr-10 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  <button type="button" onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              <button onClick={changePassword}
                className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg text-sm hover:opacity-90">
                ĐỔI MẬT KHẨU
              </button>
            </div>
            <button onClick={handleSignOut}
              className="w-full bg-destructive/10 text-destructive font-bold py-3 rounded-lg text-sm hover:bg-destructive/20 flex items-center justify-center gap-2">
              <LogOut className="h-4 w-4" /> Đăng xuất
            </button>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
