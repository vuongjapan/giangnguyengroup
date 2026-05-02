import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Package, Search, Clock, CheckCircle2, Truck, XCircle, ArrowLeft, Phone, Loader2, Hash, Mail, UserPlus } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

const STATUS_MAP: Record<string, { label: string; color: string; icon: any; step: number }> = {
  pending:      { label: 'Đơn mới – Chờ xác nhận', color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: Clock, step: 1 },
  confirmed:    { label: 'Đã xác nhận',             color: 'bg-blue-100 text-blue-800 border-blue-300', icon: CheckCircle2, step: 2 },
  deposit_paid: { label: 'Đã cọc 50%',                color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: CheckCircle2, step: 3 },
  shipping:     { label: 'Đang giao hàng',            color: 'bg-purple-100 text-purple-800 border-purple-300', icon: Truck, step: 4 },
  delivered:    { label: 'Hoàn tất',                  color: 'bg-green-100 text-green-800 border-green-300', icon: CheckCircle2, step: 5 },
  cancelled:    { label: 'Đã huỷ',                    color: 'bg-red-100 text-red-800 border-red-300', icon: XCircle, step: 0 },
};

const STEPS = [
  { key: 'pending', label: 'Tạo đơn' },
  { key: 'confirmed', label: 'Xác nhận' },
  { key: 'deposit_paid', label: 'Đã cọc' },
  { key: 'shipping', label: 'Đang giao' },
  { key: 'delivered', label: 'Hoàn tất' },
];

type Tab = 'code' | 'phone' | 'email';

function formatPrice(n: number) { return (n || 0).toLocaleString('vi-VN') + '₫'; }
function formatDate(s: string) {
  try { return new Date(s).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return s; }
}

export default function OrderTracking() {
  const { user } = useAuth();
  const [params, setParams] = useSearchParams();
  const initialTab: Tab = (params.get('tab') as Tab) || (params.get('email') ? 'email' : params.get('phone') ? 'phone' : 'code');
  const [tab, setTab] = useState<Tab>(initialTab);
  const [code, setCode] = useState(params.get('code') || '');
  const [phone, setPhone] = useState(params.get('phone') || '');
  const [email, setEmail] = useState(params.get('email') || '');
  const [order, setOrder] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);
  const [showRegisterHint, setShowRegisterHint] = useState(false);
  const [searchedValue, setSearchedValue] = useState<{ type: Tab; value: string } | null>(null);

  const logSearch = async (type: Tab, value: string, found: boolean) => {
    try {
      await supabase.from('search_logs').insert({ search_type: type, search_value: value, result_found: found });
    } catch {}
  };

  const confirmDeposit = async () => {
    if (!order) return;
    const alreadyConfirmed = history.some((h) => (h.note || '').includes('[Khách xác nhận đã chuyển cọc]'));
    if (alreadyConfirmed) {
      toast.info('Bạn đã xác nhận trước đó. Cửa hàng sẽ kiểm tra và cập nhật sớm.');
      return;
    }
    setConfirming(true);
    try {
      const { error: insErr } = await supabase.from('order_status_history').insert({
        order_id: order.id,
        order_code: order.order_code,
        from_status: order.status,
        to_status: order.status,
        note: `[Khách xác nhận đã chuyển cọc] ${order.customer_name} – ${order.customer_phone} báo đã chuyển khoản cọc ${formatPrice(deposit)} lúc ${new Date().toLocaleString('vi-VN')}.`,
      });
      if (insErr) throw insErr;
      toast.success('Đã gửi xác nhận! Cửa hàng sẽ kiểm tra trong 5–10 phút.', { duration: 5000 });
    } catch (err: any) {
      toast.error(err.message || 'Không gửi được xác nhận');
    } finally {
      setConfirming(false);
    }
  };

  const search = async (overrideTab?: Tab, overrideValue?: string, overrideSecond?: string) => {
    const t = overrideTab || tab;
    setLoading(true); setError(''); setOrder(null); setOrders([]); setHistory([]); setShowRegisterHint(false);

    try {
      let query = supabase.from('orders').select('*').eq('is_hidden', false).order('created_at', { ascending: false });
      let value = '';

      if (t === 'code') {
        const c = (overrideValue ?? code).trim();
        const p = (overrideSecond ?? phone).trim();
        if (!c || !p) { setError('Nhập mã đơn và số điện thoại'); setLoading(false); return; }
        query = query.eq('order_code', c).eq('customer_phone', p);
        value = `${c} | ${p}`;
      } else if (t === 'phone') {
        const p = (overrideValue ?? phone).trim();
        if (!p || p.length < 8) { setError('Nhập số điện thoại hợp lệ'); setLoading(false); return; }
        query = query.eq('customer_phone', p);
        value = p;
      } else {
        const e = (overrideValue ?? email).trim().toLowerCase();
        if (!e || !e.includes('@')) { setError('Nhập email hợp lệ'); setLoading(false); return; }
        query = query.ilike('customer_email', e);
        value = e;
      }

      const { data, error: e1 } = await query;
      if (e1) throw e1;

      const found = !!(data && data.length);
      setSearchedValue({ type: t, value });
      await logSearch(t, value, found);

      if (!found) {
        setError('Không tìm thấy đơn hàng phù hợp.');
        setShowRegisterHint(t !== 'code' && !user);
        const np = new URLSearchParams(); np.set('tab', t);
        if (t === 'code') { np.set('code', code); np.set('phone', phone); }
        else if (t === 'phone') np.set('phone', phone);
        else np.set('email', email);
        setParams(np);
        return;
      }

      if (data!.length === 1) {
        setOrder(data![0]);
        const { data: hist } = await supabase
          .from('order_status_history').select('*')
          .eq('order_id', data![0].id).order('created_at', { ascending: true });
        setHistory(hist || []);
      } else {
        setOrders(data!);
      }
      setShowRegisterHint(t !== 'code' && !user && data!.length > 0);

      const np = new URLSearchParams(); np.set('tab', t);
      if (t === 'code') { np.set('code', code); np.set('phone', phone); }
      else if (t === 'phone') np.set('phone', phone);
      else np.set('email', email);
      setParams(np);
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  const openOrder = async (o: any) => {
    setOrder(o); setOrders([]);
    const { data: hist } = await supabase
      .from('order_status_history').select('*')
      .eq('order_id', o.id).order('created_at', { ascending: true });
    setHistory(hist || []);
  };

  useEffect(() => {
    if (params.get('code') && params.get('phone')) search('code', params.get('code')!, params.get('phone')!);
    else if (params.get('phone')) search('phone', params.get('phone')!);
    else if (params.get('email')) search('email', params.get('email')!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime
  useEffect(() => {
    if (!order?.id) return;
    const ch = supabase
      .channel(`order-${order.id}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'orders', filter: `id=eq.${order.id}` },
        (payload) => setOrder((prev: any) => ({ ...prev, ...payload.new })))
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'order_status_history', filter: `order_id=eq.${order.id}` },
        (payload) => setHistory((prev) => [...prev, payload.new]))
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [order?.id]);

  const st = order ? (STATUS_MAP[order.status] || STATUS_MAP.pending) : null;
  const items = order ? ((order.items as any[]) || []) : [];
  const total = order?.total || 0;
  const deposit = Math.round(total * 0.5);
  const remaining = total - deposit;

  const estDelivery = order ? (() => {
    const d = new Date(order.created_at);
    const min = new Date(d); min.setDate(min.getDate() + 1);
    const max = new Date(d); max.setDate(max.getDate() + 3);
    return `${min.toLocaleDateString('vi-VN')} – ${max.toLocaleDateString('vi-VN')}`;
  })() : '';

  const TabButton = ({ id, icon: Icon, label }: { id: Tab; icon: any; label: string }) => (
    <button onClick={() => { setTab(id); setOrder(null); setOrders([]); setError(''); }}
      className={`flex-1 px-3 py-2.5 text-sm font-semibold inline-flex items-center justify-center gap-1.5 rounded-lg transition ${
        tab === id ? 'bg-primary text-primary-foreground shadow' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
      <Icon className="h-4 w-4" /> {label}
    </button>
  );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-4">
          <ArrowLeft className="h-4 w-4" /> Về trang chủ
        </Link>

        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-primary/10 p-2 rounded-xl"><Package className="h-6 w-6 text-primary" /></div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Tra cứu đơn hàng</h1>
              <p className="text-sm text-muted-foreground">Tìm theo mã đơn, số điện thoại hoặc email</p>
            </div>
          </div>

          <div className="flex gap-2 mb-4">
            <TabButton id="code" icon={Hash} label="Mã đơn" />
            <TabButton id="phone" icon={Phone} label="SĐT" />
            <TabButton id="email" icon={Mail} label="Email" />
          </div>

          {tab === 'code' && (
            <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
              <input value={code} onChange={(e) => setCode(e.target.value)}
                placeholder="Mã đơn (vd: GN-2026-001)"
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại đặt hàng"
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <button onClick={() => search()} disabled={loading}
                className="ocean-gradient text-primary-foreground font-semibold px-5 py-2.5 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-60">
                <Search className="h-4 w-4" />{loading ? 'Đang tìm...' : 'Tra cứu'}
              </button>
            </div>
          )}
          {tab === 'phone' && (
            <div className="grid sm:grid-cols-[1fr_auto] gap-2">
              <input value={phone} onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại đã dùng đặt hàng"
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <button onClick={() => search()} disabled={loading}
                className="ocean-gradient text-primary-foreground font-semibold px-5 py-2.5 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-60">
                <Search className="h-4 w-4" />{loading ? 'Đang tìm...' : 'Tra cứu'}
              </button>
            </div>
          )}
          {tab === 'email' && (
            <div className="grid sm:grid-cols-[1fr_auto] gap-2">
              <input value={email} onChange={(e) => setEmail(e.target.value)} type="email"
                placeholder="Email đã dùng đặt hàng"
                className="px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <button onClick={() => search()} disabled={loading}
                className="ocean-gradient text-primary-foreground font-semibold px-5 py-2.5 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-60">
                <Search className="h-4 w-4" />{loading ? 'Đang tìm...' : 'Tra cứu'}
              </button>
            </div>
          )}

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        {/* Register hint */}
        {showRegisterHint && (
          <div className="mt-4 bg-gradient-to-r from-primary/10 to-amber-100/60 border border-primary/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="bg-primary/20 p-2 rounded-lg"><UserPlus className="h-5 w-5 text-primary" /></div>
              <div>
                <p className="font-bold text-foreground">Đăng ký tài khoản để quản lý đơn dễ dàng hơn!</p>
                <p className="text-sm text-muted-foreground">Lưu đơn vĩnh viễn, chat trực tiếp với cửa hàng, nhận voucher tích điểm.</p>
              </div>
            </div>
            <Link to={`/auth?email=${encodeURIComponent(email)}&phone=${encodeURIComponent(phone)}`}
              className="ocean-gradient text-primary-foreground font-bold px-5 py-2.5 rounded-lg whitespace-nowrap">
              Đăng ký miễn phí
            </Link>
          </div>
        )}

        {/* Multiple orders list */}
        {orders.length > 0 && !order && (
          <div className="mt-6 bg-card border border-border rounded-2xl p-5">
            <h3 className="font-bold mb-3">Tìm thấy {orders.length} đơn – chọn để xem chi tiết:</h3>
            <div className="divide-y divide-border">
              {orders.map(o => {
                const s = STATUS_MAP[o.status] || STATUS_MAP.pending;
                return (
                  <button key={o.id} onClick={() => openOrder(o)}
                    className="w-full text-left py-3 hover:bg-muted/50 px-2 rounded transition flex items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-primary">{o.order_code}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(o.created_at)} · {o.customer_name}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full border font-bold ${s.color}`}>{s.label}</span>
                      <p className="text-sm font-bold mt-1">{formatPrice(o.total)}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {order && st && (
          <div className="mt-6 space-y-5">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs text-muted-foreground">Mã đơn</p>
                  <p className="text-xl font-bold text-primary">{order.order_code}</p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-bold ${st.color}`}>
                  <st.icon className="h-4 w-4" /> {st.label}
                </span>
              </div>

              {order.status !== 'cancelled' && (
                <div className="flex items-center justify-between gap-1 mb-2">
                  {STEPS.map((s, i) => {
                    const reached = STATUS_MAP[order.status].step >= i + 1;
                    return (
                      <div key={s.key} className="flex-1 flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          reached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
                        <span className={`text-[10px] sm:text-xs text-center ${reached ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{s.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">💰 Tổng quan thanh toán</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tổng tiền:</span><span className="font-bold">{formatPrice(total)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cọc 50%:</span><span className="font-bold text-orange-600">{formatPrice(deposit)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Còn lại khi nhận:</span><span className="font-bold">{formatPrice(remaining)}</span></div>
                </div>
                {['pending', 'confirmed'].includes(order.status) && (
                  <button onClick={confirmDeposit} disabled={confirming}
                    className="mt-4 w-full ocean-gradient text-primary-foreground font-semibold px-4 py-2.5 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-60 hover:opacity-95 transition">
                    {confirming ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                    {confirming ? 'Đang gửi xác nhận...' : 'Tôi đã thanh toán cọc'}
                  </button>
                )}
                {order.status === 'deposit_paid' && (
                  <div className="mt-4 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-sm font-semibold">
                    <CheckCircle2 className="h-4 w-4" /> Cửa hàng đã nhận cọc – đang chuẩn bị hàng
                  </div>
                )}
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">🚚 Lịch giao dự kiến</h3>
                <p className="text-base font-semibold text-primary">{estDelivery}</p>
                <p className="text-xs text-muted-foreground mt-1">Giao toàn quốc 1–3 ngày sau khi xác nhận cọc</p>
                <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1"><Phone className="h-3 w-3" /> Hỗ trợ: <a href="tel:0933562286" className="text-primary font-semibold">0933.562.286</a></p>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-3">📋 Chi tiết đơn ({items.length} sản phẩm)</h3>
              <div className="divide-y divide-border">
                {items.map((it: any, i: number) => (
                  <div key={i} className="py-2.5 flex justify-between items-start gap-3 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{it.name}</p>
                      <p className="text-xs text-muted-foreground">{it.quantity} {it.unit || 'kg'} × {formatPrice(it.price || 0)}</p>
                    </div>
                    <p className="font-semibold text-foreground whitespace-nowrap">{formatPrice((it.price || 0) * (it.quantity || 1))}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-sm font-bold text-foreground mb-4">🕒 Lịch sử xử lý đơn</h3>
              {history.length === 0 ? (
                <p className="text-sm text-muted-foreground">Chưa có lịch sử.</p>
              ) : (
                <ol className="relative border-l-2 border-border ml-2 space-y-4">
                  {history.map((h, i) => {
                    const stm = STATUS_MAP[h.to_status] || STATUS_MAP.pending;
                    return (
                      <li key={h.id || i} className="ml-4">
                        <div className="absolute -left-[9px] w-4 h-4 rounded-full bg-primary border-2 border-background" />
                        <p className="text-sm font-semibold text-foreground">{stm.label}</p>
                        <p className="text-xs text-muted-foreground">{formatDate(h.created_at)}</p>
                        {h.note && <p className="text-xs text-muted-foreground italic mt-0.5">{h.note}</p>}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            {orders.length === 0 && searchedValue && searchedValue.type !== 'code' && (
              <button onClick={() => { setOrder(null); search(); }}
                className="w-full text-sm text-muted-foreground hover:text-primary py-2">
                ← Xem lại danh sách đơn
              </button>
            )}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
