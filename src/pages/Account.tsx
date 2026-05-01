import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import {
  User, ShoppingBag, LogOut, Crown, ArrowLeft, RefreshCw, Calendar,
  MessageSquare, Send, Lock, Eye, EyeOff, Camera, Upload, Save, MapPin,
  Phone as PhoneIcon, Mail as MailIcon, Cake, FileText, X, Loader2, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { formatPrice } from '@/data/products';

interface Profile {
  id: string;
  name: string;
  full_name: string;
  phone: string;
  email: string;
  birthday: string | null;
  address: string;
  bio: string;
  avatar_url: string;
  cover_url: string;
  level: string;
  points: number;
  total_spent: number;
  created_at: string;
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
  customer_note?: string;
}

interface ChatMsg {
  id: string;
  sender: 'customer' | 'admin';
  content: string;
  created_at: string;
  is_read: boolean;
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  pending: { label: 'Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800' },
  deposit_paid: { label: 'Đã cọc', color: 'bg-blue-100 text-blue-800' },
  confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-800' },
  shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-800' },
  delivered: { label: 'Hoàn thành', color: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', color: 'bg-red-100 text-red-800' },
};

const LEVEL_CONFIG: Record<string, { icon: string; color: string; next: string; nextAmount: number }> = {
  'Thường': { icon: '⭐', color: 'bg-muted text-foreground', next: 'VIP', nextAmount: 3000000 },
  'VIP': { icon: '🥇', color: 'bg-yellow-100 text-yellow-800', next: 'PRO', nextAmount: 10000000 },
  'PRO': { icon: '💎', color: 'bg-purple-100 text-purple-800', next: '', nextAmount: 0 },
};

type TabKey = 'dashboard' | 'orders' | 'profile' | 'chat' | 'security';

export default function Account() {
  const { user, loading: authLoading, signOut, refreshProfile } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = (searchParams.get('tab') as TabKey) || 'dashboard';
  const [tab, setTab] = useState<TabKey>(tabParam);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);

  const avatarInput = useRef<HTMLInputElement>(null);
  const coverInput = useRef<HTMLInputElement>(null);

  // Edit form
  const [form, setForm] = useState({
    full_name: '', phone: '', birthday: '', address: '', bio: '',
  });

  // Chat
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Password
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);

  // Filter orders
  const [orderFilter, setOrderFilter] = useState<'all' | string>('all');

  useEffect(() => {
    if (!authLoading && !user) navigate('/auth');
  }, [user, authLoading, navigate]);

  useEffect(() => { setTab(tabParam); }, [tabParam]);

  useEffect(() => { if (user) fetchProfile(); }, [user]);
  useEffect(() => { if (profile) fetchOrders(); }, [profile]);

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

  // Auto mark-as-read khi vào tab chat
  useEffect(() => {
    if (tab === 'chat' && user && messages.some(m => m.sender === 'admin' && !m.is_read)) {
      supabase.from('customer_chat_messages')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('sender', 'admin')
        .eq('is_read', false)
        .then(() => fetchMessages());
    }
  }, [tab, messages, user]);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, tab]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('profiles').select('*').eq('id', user!.id).maybeSingle();
    if (data) {
      const p = data as unknown as Profile;
      setProfile(p);
      setForm({
        full_name: p.full_name || p.name || '',
        phone: p.phone || '',
        birthday: p.birthday || '',
        address: p.address || '',
        bio: p.bio || '',
      });
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    if (!profile) return;
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
      .select('id,sender,content,created_at,is_read')
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

  const uploadFile = async (file: File, kind: 'avatar' | 'cover'): Promise<string | null> => {
    if (!user) return null;
    if (file.size > 5 * 1024 * 1024) { toast.error('Ảnh tối đa 5MB'); return null; }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Chỉ chấp nhận JPG/PNG/WEBP'); return null;
    }
    const ext = file.name.split('.').pop() || 'jpg';
    const path = `${user.id}/${kind}-${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true });
    if (error) { toast.error('Lỗi tải ảnh: ' + error.message); return null; }
    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleAvatarPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingAvatar(true);
    const url = await uploadFile(file, 'avatar');
    if (url) {
      await supabase.from('profiles').update({ avatar_url: url }).eq('id', user!.id);
      toast.success('Đã cập nhật ảnh đại diện');
      fetchProfile(); refreshProfile();
    }
    setUploadingAvatar(false);
    e.target.value = '';
  };

  const handleCoverPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setUploadingCover(true);
    const url = await uploadFile(file, 'cover');
    if (url) {
      await supabase.from('profiles').update({ cover_url: url }).eq('id', user!.id);
      toast.success('Đã cập nhật ảnh bìa');
      fetchProfile(); refreshProfile();
    }
    setUploadingCover(false);
    e.target.value = '';
  };

  const saveProfile = async () => {
    if (form.phone && !form.phone.match(/^0\d{9,10}$/)) {
      toast.error('Số điện thoại không hợp lệ (vd: 0912345678)'); return;
    }
    setSavingProfile(true);
    const { error } = await supabase.from('profiles').update({
      full_name: form.full_name,
      name: form.full_name,
      phone: form.phone,
      birthday: form.birthday || null,
      address: form.address,
      bio: form.bio,
    }).eq('id', user!.id);
    setSavingProfile(false);
    if (error) toast.error('Lỗi: ' + error.message);
    else {
      toast.success('Đã lưu! Đơn cũ sẽ tự đồng bộ.');
      setEditOpen(false);
      fetchProfile(); refreshProfile();
    }
  };

  const changePassword = async () => {
    if (newPwd.length < 6) { toast.error('Mật khẩu mới tối thiểu 6 ký tự'); return; }
    if (newPwd !== confirmPwd) { toast.error('Hai mật khẩu không khớp'); return; }
    const { error } = await supabase.auth.updateUser({ password: newPwd });
    if (error) toast.error('Lỗi: ' + error.message);
    else { toast.success('Đã đổi mật khẩu!'); setNewPwd(''); setConfirmPwd(''); }
  };

  const reorder = (order: Order) => {
    (order.items as any[]).forEach((item: any) => {
      addItem({ productId: item.productId || item.id, name: item.name, price: item.price, image: item.image || '', unit: item.unit || 'kg' });
    });
    toast.success('Đã thêm vào giỏ hàng!');
  };

  const handleSignOut = async () => { await signOut(); navigate('/'); };

  const switchTab = (t: TabKey) => {
    setTab(t);
    setSearchParams(t === 'dashboard' ? {} : { tab: t });
  };

  if (authLoading || loading) return <div className="min-h-screen flex items-center justify-center">Đang tải...</div>;
  if (!user || !profile) return null;

  const displayName = profile.full_name || profile.name || 'Chưa đặt tên';
  const initials = displayName.trim().split(/\s+/).slice(-1)[0].slice(0, 1).toUpperCase() || 'U';
  const levelConfig = LEVEL_CONFIG[profile.level] || LEVEL_CONFIG['Thường'];
  const progress = levelConfig.nextAmount > 0 ? Math.min((profile.total_spent / levelConfig.nextAmount) * 100, 100) : 100;

  const filteredOrders = orderFilter === 'all' ? orders : orders.filter(o => o.status === orderFilter);
  const completedCount = orders.filter(o => o.status === 'delivered').length;
  const pendingCount = orders.filter(o => ['pending', 'confirmed', 'shipping', 'deposit_paid'].includes(o.status)).length;
  const memberSince = new Date(profile.created_at).toLocaleDateString('vi-VN', { month: '2-digit', year: 'numeric' });

  const tabs = [
    { id: 'dashboard' as const, label: 'Tổng quan', icon: User },
    { id: 'orders' as const, label: `Đơn hàng (${orders.length})`, icon: ShoppingBag },
    { id: 'chat' as const, label: 'Tin nhắn', icon: MessageSquare },
    { id: 'profile' as const, label: 'Hồ sơ', icon: Crown },
    { id: 'security' as const, label: 'Bảo mật', icon: Lock },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 flex-1 max-w-5xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-3">
          <ArrowLeft className="h-4 w-4" /> Về trang chủ
        </Link>

        {/* COVER + AVATAR */}
        <div className="bg-card rounded-2xl border border-border overflow-hidden mb-4 shadow-sm">
          <div
            className="relative h-44 md:h-56 bg-gradient-to-br from-primary to-primary/60"
            style={profile.cover_url ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : undefined}
          >
            <button
              onClick={() => coverInput.current?.click()}
              disabled={uploadingCover}
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 text-white text-xs font-medium px-3 py-1.5 rounded-lg flex items-center gap-1.5 backdrop-blur-sm disabled:opacity-50"
            >
              {uploadingCover ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Camera className="h-3.5 w-3.5" />}
              Đổi ảnh bìa
            </button>
            <input ref={coverInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleCoverPick} />
          </div>

          <div className="px-4 md:px-6 pb-4 -mt-14 md:-mt-16">
            <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-5">
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full bg-accent text-accent-foreground border-4 border-card flex items-center justify-center text-3xl font-black shadow-lg overflow-hidden">
                {profile.avatar_url
                  ? <img src={profile.avatar_url} alt={displayName} className="w-full h-full object-cover" />
                  : initials}
                <button
                  onClick={() => avatarInput.current?.click()}
                  disabled={uploadingAvatar}
                  className="absolute bottom-0 right-0 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-9 h-9 flex items-center justify-center shadow-md border-2 border-card disabled:opacity-50"
                  title="Đổi ảnh đại diện"
                >
                  {uploadingAvatar ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
                <input ref={avatarInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={handleAvatarPick} />
              </div>

              <div className="flex-1 min-w-0">
                <h1 className="text-xl md:text-2xl font-black text-foreground leading-tight truncate">{displayName}</h1>
                <p className="text-sm text-muted-foreground truncate">{profile.email}</p>
                <span className={`${levelConfig.color} px-2 py-0.5 rounded-full text-[11px] font-bold inline-block mt-1.5`}>
                  {levelConfig.icon} {profile.level}
                </span>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setEditOpen(true)}
                  className="text-xs font-bold px-4 py-2 bg-muted hover:bg-muted/70 text-foreground rounded-lg flex items-center gap-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
                </button>
                <button onClick={handleSignOut}
                  className="text-xs font-bold px-3 py-2 text-destructive hover:bg-destructive/10 rounded-lg flex items-center gap-1.5">
                  <LogOut className="h-3.5 w-3.5" /> Thoát
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-1 mb-5 bg-muted rounded-lg p-1 overflow-x-auto">
          {tabs.map(t => (
            <button key={t.id} onClick={() => switchTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs sm:text-sm font-medium transition-all whitespace-nowrap ${tab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              <t.icon className="h-4 w-4" /> {t.label}
            </button>
          ))}
        </div>

        {/* DASHBOARD */}
        {tab === 'dashboard' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-4">
            {/* Sidebar info */}
            <div className="space-y-4">
              <div className="bg-card rounded-xl border border-border p-4">
                <h3 className="font-bold text-sm text-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" /> Giới thiệu
                </h3>
                {profile.bio ? (
                  <p className="text-sm text-muted-foreground italic">"{profile.bio}"</p>
                ) : (
                  <button onClick={() => setEditOpen(true)} className="text-xs text-primary hover:underline">+ Thêm giới thiệu</button>
                )}
                <div className="space-y-2 mt-4 text-sm">
                  <p className="flex items-center gap-2 text-foreground"><PhoneIcon className="h-4 w-4 text-muted-foreground" /> {profile.phone || <span className="text-muted-foreground italic">Chưa có</span>}</p>
                  <p className="flex items-center gap-2 text-foreground"><MailIcon className="h-4 w-4 text-muted-foreground" /> <span className="truncate">{profile.email}</span></p>
                  <p className="flex items-center gap-2 text-foreground"><Cake className="h-4 w-4 text-muted-foreground" /> {profile.birthday ? new Date(profile.birthday).toLocaleDateString('vi-VN') : <span className="text-muted-foreground italic">Chưa có</span>}</p>
                  <p className="flex items-center gap-2 text-foreground"><MapPin className="h-4 w-4 text-muted-foreground" /> <span className="truncate">{profile.address || <span className="text-muted-foreground italic">Chưa có</span>}</span></p>
                  <p className="flex items-center gap-2 text-muted-foreground text-xs pt-2 border-t border-border"><Calendar className="h-3 w-3" /> Thành viên từ: {memberSince}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="bg-card rounded-xl border border-border p-3 text-center">
                  <p className="text-2xl font-black text-primary">{orders.length}</p>
                  <p className="text-[11px] text-muted-foreground">Tổng đơn</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-3 text-center">
                  <p className="text-2xl font-black text-green-600">{completedCount}</p>
                  <p className="text-[11px] text-muted-foreground">Hoàn tất</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-3 text-center">
                  <p className="text-2xl font-black text-yellow-600">{pendingCount}</p>
                  <p className="text-[11px] text-muted-foreground">Đang xử lý</p>
                </div>
                <div className="bg-card rounded-xl border border-border p-3 text-center">
                  <p className="text-lg font-black text-accent">{levelConfig.icon}</p>
                  <p className="text-[11px] text-muted-foreground">Hạng {profile.level}</p>
                </div>
              </div>
            </div>

            {/* Right column */}
            <div className="space-y-4">
              {levelConfig.next && (
                <div className="bg-card rounded-xl border border-border p-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="font-bold">{profile.level}</span>
                    <span className="text-muted-foreground">→ {levelConfig.next}</span>
                  </div>
                  <div className="bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-2">
                    Còn <strong>{formatPrice(Math.max(0, levelConfig.nextAmount - profile.total_spent))}</strong> để lên {levelConfig.next}
                  </p>
                </div>
              )}

              <div className="bg-card rounded-xl border border-border p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-foreground">Đơn gần đây</h3>
                  <button onClick={() => switchTab('orders')} className="text-primary text-xs font-bold hover:underline">Xem tất cả →</button>
                </div>
                {orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground py-4 text-center">Chưa có đơn nào</p>
                ) : (
                  orders.slice(0, 4).map(order => {
                    const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                    return (
                      <div key={order.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                        <div className="min-w-0">
                          <p className="font-bold text-foreground text-sm">{order.order_code}</p>
                          <p className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${st.color}`}>{st.label}</span>
                          <span className="font-bold text-sm text-foreground">{formatPrice(order.total)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab === 'orders' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="text-lg font-bold text-foreground">Lịch sử đơn hàng ({orders.length})</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Tự động đồng bộ theo email <strong>{profile.email}</strong>
              {profile.phone && <> và SĐT <strong>{profile.phone}</strong></>}.
              {!profile.phone && <span className="text-coral"> (Cập nhật SĐT để đồng bộ thêm đơn cũ)</span>}
            </p>
            {/* Filter tabs */}
            <div className="flex gap-1 overflow-x-auto pb-1">
              {[['all', 'Tất cả'], ['pending', 'Chờ XN'], ['confirmed', 'Đã XN'], ['shipping', 'Đang giao'], ['delivered', 'Hoàn tất'], ['cancelled', 'Đã hủy']].map(([k, l]) => (
                <button key={k} onClick={() => setOrderFilter(k)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${orderFilter === k ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
                  {l}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border border-border">
                <ShoppingBag className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">Không có đơn hàng nào</p>
                <Link to="/" className="text-primary text-sm font-bold hover:underline mt-2 inline-block">Mua sắm ngay →</Link>
              </div>
            ) : (
              filteredOrders.map(order => {
                const st = STATUS_LABELS[order.status] || STATUS_LABELS.pending;
                return (
                  <div key={order.id} className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <p className="font-bold text-foreground">{order.order_code}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(order.created_at).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <span className={`text-xs px-3 py-1 rounded-full font-bold ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="space-y-1.5 mb-3">
                      {(order.items as any[]).map((item: any, i: number) => (
                        <div key={i} className="flex justify-between text-sm">
                          <span className="text-foreground truncate pr-2">{item.name} x{item.quantity}</span>
                          <span className="text-muted-foreground flex-shrink-0">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                    {order.customer_note && (
                      <p className="text-xs bg-muted/50 rounded-md p-2 mb-3 text-foreground">📝 {order.customer_note}</p>
                    )}
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

        {/* CHAT */}
        {tab === 'chat' && (
          <div className="bg-card rounded-xl border border-border flex flex-col h-[600px] overflow-hidden">
            <div className="p-3 border-b border-border bg-muted/30">
              <p className="font-bold text-sm flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" /> Chat với Admin
              </p>
              <p className="text-[11px] text-muted-foreground">Hỗ trợ 7:00 – 21:00. Phản hồi trung bình 5–10 phút.</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-muted/10">
              {messages.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-8">Chưa có tin nhắn. Gửi câu hỏi đầu tiên!</p>
              )}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'customer' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm shadow-sm ${msg.sender === 'customer' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'}`}>
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

        {/* PROFILE */}
        {tab === 'profile' && (
          <div className="max-w-lg space-y-4">
            <h2 className="text-lg font-bold text-foreground">Thông tin hồ sơ</h2>
            <div className="bg-card rounded-xl border border-border p-6 space-y-4">
              <button onClick={() => setEditOpen(true)}
                className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg text-sm hover:opacity-90 flex items-center justify-center gap-2">
                <Pencil className="h-4 w-4" /> Mở trình chỉnh sửa đầy đủ
              </button>
              <div className="space-y-3 text-sm">
                <Row label="Họ và tên" value={profile.full_name || profile.name} />
                <Row label="Email" value={profile.email} />
                <Row label="Số điện thoại" value={profile.phone} />
                <Row label="Ngày sinh" value={profile.birthday ? new Date(profile.birthday).toLocaleDateString('vi-VN') : ''} />
                <Row label="Địa chỉ" value={profile.address} />
                <Row label="Giới thiệu" value={profile.bio} />
              </div>
            </div>
          </div>
        )}

        {/* SECURITY */}
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
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Xác nhận mật khẩu</label>
                <input type={showPwd ? 'text' : 'password'} value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
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

      {/* EDIT DRAWER */}
      {editOpen && (
        <>
          <div className="fixed inset-0 bg-black/40 z-40 animate-in fade-in duration-200" onClick={() => setEditOpen(false)} />
          <div className="fixed top-0 right-0 bottom-0 w-full max-w-md bg-card z-50 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h2 className="font-black text-foreground">Chỉnh sửa hồ sơ</h2>
              <button onClick={() => setEditOpen(false)} className="p-1 hover:bg-muted rounded-md">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Họ và tên</label>
                <input value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Số điện thoại</label>
                <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="0912345678" pattern="0\d{9,10}"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
                <p className="text-[10px] text-muted-foreground mt-1">Dùng để đồng bộ đơn hàng cũ</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Ngày sinh</label>
                <input type="date" value={form.birthday} onChange={e => setForm(f => ({ ...f, birthday: e.target.value }))}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Địa chỉ</label>
                <input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                  placeholder="Số nhà, đường, phường, quận, tỉnh"
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Giới thiệu bản thân</label>
                <textarea value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))}
                  placeholder="Vài dòng về bạn..." rows={3} maxLength={200}
                  className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
                <p className="text-[10px] text-muted-foreground text-right">{form.bio.length}/200</p>
              </div>
              <div className="bg-muted/50 rounded-lg p-3">
                <p className="text-xs text-foreground font-medium mb-2 flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" /> Ảnh đại diện & ảnh bìa</p>
                <p className="text-[11px] text-muted-foreground">Đóng ngăn này và bấm nút máy ảnh trên ảnh để đổi ảnh.</p>
              </div>
            </div>
            <div className="p-4 border-t border-border flex gap-2">
              <button onClick={() => setEditOpen(false)} className="flex-1 px-4 py-2.5 bg-muted text-foreground font-bold rounded-lg text-sm hover:bg-muted/70">
                Hủy
              </button>
              <button onClick={saveProfile} disabled={savingProfile}
                className="flex-1 ocean-gradient text-primary-foreground font-bold py-2.5 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-1.5">
                {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Lưu thay đổi
              </button>
            </div>
          </div>
        </>
      )}

      <Footer />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 py-2 border-b border-border last:border-0">
      <span className="text-muted-foreground text-xs flex-shrink-0">{label}</span>
      <span className="text-foreground text-sm text-right">{value || <span className="text-muted-foreground italic">Chưa có</span>}</span>
    </div>
  );
}
