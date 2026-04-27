import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Package, Search, Clock, CheckCircle2, Truck, XCircle, ArrowLeft, Phone } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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

function formatPrice(n: number) { return (n || 0).toLocaleString('vi-VN') + '₫'; }
function formatDate(s: string) {
  try { return new Date(s).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return s; }
}

export default function OrderTracking() {
  const [params, setParams] = useSearchParams();
  const [code, setCode] = useState(params.get('code') || '');
  const [phone, setPhone] = useState(params.get('phone') || '');
  const [order, setOrder] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async (c?: string, p?: string) => {
    const oc = (c ?? code).trim();
    const ph = (p ?? phone).trim();
    if (!oc || !ph) { setError('Nhập mã đơn và số điện thoại'); return; }
    setLoading(true); setError(''); setOrder(null); setHistory([]);
    try {
      const { data, error: e1 } = await supabase
        .from('orders').select('*')
        .eq('order_code', oc).eq('customer_phone', ph)
        .maybeSingle();
      if (e1) throw e1;
      if (!data) { setError('Không tìm thấy đơn. Vui lòng kiểm tra mã đơn và số điện thoại.'); return; }
      setOrder(data);
      const { data: hist } = await supabase
        .from('order_status_history').select('*')
        .eq('order_id', data.id).order('created_at', { ascending: true });
      setHistory(hist || []);
      setParams({ code: oc, phone: ph });
    } catch (err: any) {
      setError(err.message || 'Có lỗi xảy ra');
    } finally { setLoading(false); }
  };

  useEffect(() => {
    if (params.get('code') && params.get('phone')) search(params.get('code')!, params.get('phone')!);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Realtime updates
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

  // Estimated delivery: 1-3 days from order creation
  const estDelivery = order ? (() => {
    const d = new Date(order.created_at);
    const min = new Date(d); min.setDate(min.getDate() + 1);
    const max = new Date(d); max.setDate(max.getDate() + 3);
    return `${min.toLocaleDateString('vi-VN')} – ${max.toLocaleDateString('vi-VN')}`;
  })() : '';

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
              <h1 className="text-2xl font-bold text-foreground">Theo dõi đơn hàng</h1>
              <p className="text-sm text-muted-foreground">Nhập mã đơn + SĐT đặt hàng để tra cứu</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
            <input value={code} onChange={(e) => setCode(e.target.value)}
              placeholder="Mã đơn (vd: SEVQR GN20260427xxxx)"
              className="px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <input value={phone} onChange={(e) => setPhone(e.target.value)}
              placeholder="Số điện thoại đặt hàng"
              className="px-4 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <button onClick={() => search()} disabled={loading}
              className="ocean-gradient text-primary-foreground font-semibold px-5 py-2.5 rounded-lg inline-flex items-center justify-center gap-2 disabled:opacity-60">
              <Search className="h-4 w-4" />{loading ? 'Đang tìm...' : 'Tra cứu'}
            </button>
          </div>
          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
        </div>

        {order && st && (
          <div className="mt-6 space-y-5">
            {/* Status */}
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

              {/* Progress steps */}
              {order.status !== 'cancelled' && (
                <div className="flex items-center justify-between gap-1 mb-2">
                  {STEPS.map((s, i) => {
                    const reached = STATUS_MAP[order.status].step >= i + 1;
                    return (
                      <div key={s.key} className="flex-1 flex flex-col items-center gap-1">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                          reached ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>{i + 1}</div>
                        <span className={`text-[10px] sm:text-xs text-center ${reached ? 'text-foreground font-semibold' : 'text-muted-foreground'}`}>{s.label}</span>
                        {i < STEPS.length - 1 && <div className={`hidden sm:block h-0.5 w-full -mt-5 ${reached ? 'bg-primary/60' : 'bg-muted'}`} style={{ position: 'relative', top: '-14px', left: '50%', width: '100%', zIndex: -1 }} />}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Summary */}
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">💰 Tổng quan thanh toán</h3>
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Tổng tiền:</span><span className="font-bold">{formatPrice(total)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cọc 50%:</span><span className="font-bold text-orange-600">{formatPrice(deposit)}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Còn lại khi nhận:</span><span className="font-bold">{formatPrice(remaining)}</span></div>
                </div>
              </div>
              <div className="bg-card border border-border rounded-2xl p-5">
                <h3 className="text-sm font-bold text-foreground mb-3">🚚 Lịch giao dự kiến</h3>
                <p className="text-base font-semibold text-primary">{estDelivery}</p>
                <p className="text-xs text-muted-foreground mt-1">Giao toàn quốc 1–3 ngày sau khi xác nhận cọc</p>
                <p className="text-xs text-muted-foreground mt-2 inline-flex items-center gap-1"><Phone className="h-3 w-3" /> Hỗ trợ: <a href="tel:0933562286" className="text-primary font-semibold">0933.562.286</a></p>
              </div>
            </div>

            {/* Items */}
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

            {/* History timeline */}
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
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
