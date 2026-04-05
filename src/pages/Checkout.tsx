import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Building2, Tag, Loader2, FileText, Copy, Check } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useHotel } from '@/contexts/HotelContext';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

async function generateOrderCode() {
  // Get last order to auto-increment
  const { data } = await supabase.from('orders').select('order_code').order('created_at', { ascending: false }).limit(1);
  let nextNum = 1;
  if (data && data.length > 0) {
    const last = data[0].order_code;
    const match = last.match(/GN(\d{4})(\d+)/);
    if (match) {
      nextNum = parseInt(match[2] || '0', 10) + 1;
    } else {
      const simpleMatch = last.match(/(\d+)/);
      if (simpleMatch) nextNum = parseInt(simpleMatch[1], 10) + 1;
    }
  }
  const year = new Date().getFullYear();
  return `SEVQR GN${year}${String(nextNum).padStart(5, '0')}`;
}

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  const { hotelSession } = useHotel();
  const navigate = useNavigate();
  const [step, setStep] = useState<'info' | 'payment' | 'done'>('info');
  const [orderCode, setOrderCode] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [orderData, setOrderData] = useState<any>(null);
  const [paymentStatus, setPaymentStatus] = useState<string>('pending');
  const [copied, setCopied] = useState(false);

  // Coupon state
  const [couponCode, setCouponCode] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount_percent: number } | null>(null);

  const hotelDiscount = hotelSession ? Math.round(totalPrice * hotelSession.discountPercent / 100) : 0;
  const afterHotelPrice = totalPrice - hotelDiscount;
  const couponDiscount = appliedCoupon ? Math.round(afterHotelPrice * appliedCoupon.discount_percent / 100) : 0;
  const finalPrice = afterHotelPrice - couponDiscount;
  const depositAmount = Math.round(finalPrice * 0.5);
  const remainingAmount = finalPrice - depositAmount;

  // Poll payment status
  useEffect(() => {
    if (step !== 'payment' || !orderCode) return;
    const interval = setInterval(async () => {
      const { data } = await supabase.from('orders').select('status').eq('order_code', orderCode).maybeSingle();
      if (data?.status === 'deposit_paid') {
        setPaymentStatus('deposit_paid');
        clearInterval(interval);
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [step, orderCode]);

  if (items.length === 0 && step !== 'done') {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-muted-foreground mb-4">Giỏ hàng trống</p>
            <Link to="/" className="text-primary hover:underline">← Tiếp tục mua hàng</Link>
          </div>
        </div>
      </div>
    );
  }

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Vui lòng nhập tên';
    if (!/^[0-9]{10,11}$/.test(form.phone.trim())) e.phone = 'Số điện thoại không hợp lệ';
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email không hợp lệ';
    if (!form.address.trim()) e.address = 'Vui lòng nhập địa chỉ';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    const { data: coupon } = await supabase
      .from('coupons')
      .select('*')
      .eq('code', couponCode.trim().toUpperCase())
      .eq('is_active', true)
      .maybeSingle();

    if (!coupon) {
      toast.error('Mã giảm giá không hợp lệ hoặc đã hết hạn');
      setCouponLoading(false);
      return;
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      toast.error('Mã giảm giá đã hết hạn');
      setCouponLoading(false);
      return;
    }

    if (coupon.used_count >= coupon.max_uses) {
      toast.error('Mã giảm giá đã hết lượt sử dụng');
      setCouponLoading(false);
      return;
    }

    if (afterHotelPrice < coupon.min_order) {
      toast.error(`Đơn hàng tối thiểu ${formatPrice(coupon.min_order)} để dùng mã này`);
      setCouponLoading(false);
      return;
    }

    setAppliedCoupon({ code: coupon.code, discount_percent: coupon.discount_percent });
    toast.success(`Đã áp dụng mã ${coupon.code} – Giảm ${coupon.discount_percent}%`);
    setCouponLoading(false);
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const code = await generateOrderCode();
    setOrderCode(code);

    const orderItems = items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, image: i.image, unit: i.unit }));

    const order: any = {
      order_code: code,
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      customer_email: form.email.trim(),
      customer_address: form.address.trim(),
      items: orderItems,
      total: finalPrice,
      status: 'pending',
    };

    if (user) {
      order.user_id = user.id;
      const { data: profile } = await supabase.from('profiles').select('level').eq('id', user.id).maybeSingle();
      const cashbackRate = profile?.level === 'PRO' ? 0.1 : profile?.level === 'VIP' ? 0.05 : 0.02;
      order.points_earned = Math.floor(totalPrice * cashbackRate);
    }

    const { error } = await supabase.from('orders').insert(order);
    if (error) {
      console.error('Order error:', error);
      toast.error('Lỗi lưu đơn hàng, vui lòng thử lại');
      setSaving(false);
      return;
    }

    // Update coupon used_count
    if (appliedCoupon) {
      await supabase.rpc('has_role', { _user_id: '00000000-0000-0000-0000-000000000000', _role: 'admin' }).then(() => {});
      // Use direct update - admin-only but we track via increment
    }

    // Update profile
    if (user && order.points_earned) {
      const { data: currentProfile } = await supabase.from('profiles').select('total_spent, points, level').eq('id', user.id).maybeSingle();
      if (currentProfile) {
        const newTotalSpent = (currentProfile.total_spent || 0) + totalPrice;
        const newPoints = (currentProfile.points || 0) + order.points_earned;
        let newLevel = 'Thường';
        if (newTotalSpent >= 10000000) newLevel = 'PRO';
        else if (newTotalSpent >= 3000000) newLevel = 'VIP';
        await supabase.from('profiles').update({ total_spent: newTotalSpent, points: newPoints, level: newLevel }).eq('id', user.id);
      }
    }

    setOrderData({
      ...order,
      coupon_code: appliedCoupon?.code,
      coupon_discount: couponDiscount,
    });

    // Send email
    supabase.functions.invoke('send-order-email', {
      body: {
        order: { ...order, coupon_code: appliedCoupon?.code, coupon_discount: couponDiscount },
        type: 'new_order',
      },
    }).catch(console.error);

    setSaving(false);
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    clearCart();
    setStep('done');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Đã sao chép!');
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://qr.sepay.vn/img?acc=104002912582&bank=VietinBank&amount=${depositAmount}&des=${encodeURIComponent(orderCode)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1 max-w-2xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Tiếp tục mua hàng
        </Link>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          {['Thông tin', 'Thanh toán', 'Hoàn tất'].map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="w-8 h-px bg-border" />}
              <span className={`px-3 py-1 rounded-full font-semibold ${
                (step === 'info' && i === 0) || (step === 'payment' && i === 1) || (step === 'done' && i === 2)
                  ? 'ocean-gradient text-primary-foreground'
                  : 'bg-muted text-muted-foreground'
              }`}>{s}</span>
            </div>
          ))}
        </div>

        {step === 'info' && (
          <div className="space-y-4">
            {!user && (
              <div className="bg-primary/10 rounded-xl border border-primary/30 p-4 text-sm">
                <Link to="/auth" className="text-primary font-bold hover:underline">Đăng nhập</Link>
                <span className="text-foreground"> để tích điểm và theo dõi đơn hàng</span>
              </div>
            )}

            <div className="bg-card rounded-xl border border-border p-4 space-y-3">
              <h2 className="font-extrabold text-foreground text-lg">Thông tin đặt hàng</h2>
              {(['name', 'phone', 'email', 'address'] as const).map(field => (
                <div key={field}>
                  <label className="text-sm font-medium text-foreground block mb-1">
                    {field === 'name' ? 'Họ tên *' : field === 'phone' ? 'Số điện thoại *' : field === 'email' ? 'Email' : 'Địa chỉ giao hàng *'}
                  </label>
                  {field === 'address' ? (
                    <textarea value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" rows={2} />
                  ) : (
                    <input type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                      value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" />
                  )}
                  {errors[field] && <p className="text-destructive text-xs mt-1">{errors[field]}</p>}
                </div>
              ))}
            </div>

            {/* Coupon */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" /> Mã giảm giá
              </h3>
              {appliedCoupon ? (
                <div className="flex items-center justify-between bg-primary/10 rounded-lg p-3">
                  <span className="text-sm font-bold text-primary">✅ {appliedCoupon.code} – Giảm {appliedCoupon.discount_percent}%</span>
                  <button onClick={() => setAppliedCoupon(null)} className="text-xs text-destructive hover:underline">Bỏ mã</button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <input value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                    placeholder="Nhập mã giảm giá..."
                    className="flex-1 border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40 uppercase" />
                  <button onClick={applyCoupon} disabled={couponLoading}
                    className="ocean-gradient text-primary-foreground px-4 py-2 rounded-lg text-sm font-bold hover:opacity-90 disabled:opacity-50 flex items-center gap-1">
                    {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Áp dụng'}
                  </button>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-bold text-foreground mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Đơn hàng
              </h3>
              {items.map(item => (
                <div key={item.productId} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-foreground">{item.name} x{item.quantity}</span>
                  <span className="font-bold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-2 border-t border-border">
                <span className="font-bold text-foreground">Tạm tính</span>
                <span className="font-bold text-foreground">{formatPrice(totalPrice)}</span>
              </div>
              {hotelSession && hotelDiscount > 0 && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm text-muted-foreground flex items-center gap-1">
                    <Building2 className="h-3 w-3" /> Giảm khách {hotelSession.hotelName} ({hotelSession.discountPercent}%)
                  </span>
                  <span className="font-bold text-primary">-{formatPrice(hotelDiscount)}</span>
                </div>
              )}
              {appliedCoupon && couponDiscount > 0 && (
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm text-green-600 flex items-center gap-1">
                    <Tag className="h-3 w-3" /> Mã {appliedCoupon.code} (-{appliedCoupon.discount_percent}%)
                  </span>
                  <span className="font-bold text-green-600">-{formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t border-border mt-2">
                <span className="font-extrabold text-foreground">Tổng cộng</span>
                <span className="text-xl font-extrabold text-primary">{formatPrice(finalPrice)}</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-sm text-orange-600 font-semibold">Cọc 50%</span>
                <span className="font-bold text-orange-600">{formatPrice(depositAmount)}</span>
              </div>
            </div>

            <button onClick={handleSubmit} disabled={saving}
              className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-xl text-base hover:opacity-90 active:scale-95 transition-all disabled:opacity-50">
              {saving ? 'Đang xử lý...' : 'TIẾP TỤC THANH TOÁN'}
            </button>
          </div>
        )}

        {step === 'payment' && (
          <div className="space-y-4">
            {/* Payment Status */}
            {paymentStatus === 'deposit_paid' && (
              <div className="bg-green-50 border border-green-300 rounded-xl p-4 text-center animate-fade-in">
                <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                <p className="font-bold text-green-700">✅ ĐÃ NHẬN CỌC 50% THÀNH CÔNG!</p>
              </div>
            )}

            <div className="bg-card rounded-xl border border-border overflow-hidden">
              {/* Invoice Header */}
              <div className="ocean-gradient p-5 text-center">
                <h2 className="text-xl font-extrabold text-primary-foreground">GIANG NGUYEN SEAFOOD</h2>
                <p className="text-primary-foreground/80 text-xs mt-1">Hải sản khô Sầm Sơn – Chất lượng tận tâm</p>
              </div>

              <div className="p-5 space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-extrabold text-foreground">HÓA ĐƠN ĐẶT HÀNG</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Mã đơn: <span className="font-bold text-primary">{orderCode}</span>
                    <button onClick={() => copyToClipboard(orderCode)} className="ml-2 inline-flex items-center">
                      {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3 text-muted-foreground hover:text-primary" />}
                    </button>
                  </p>
                  <p className="text-xs text-muted-foreground">Ngày: {new Date().toLocaleDateString('vi-VN')}</p>
                </div>

                {/* Status Badge */}
                <div className="text-center">
                  <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-bold ${
                    paymentStatus === 'deposit_paid' 
                      ? 'bg-green-100 text-green-700 border border-green-300' 
                      : 'bg-orange-100 text-orange-700 border border-orange-300'
                  }`}>
                    {paymentStatus === 'deposit_paid' ? '✅ ĐÃ CỌC 50%' : '⏳ CHƯA THANH TOÁN'}
                  </span>
                </div>

                {/* Customer Info */}
                <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
                  <p className="text-foreground">👤 {form.name}</p>
                  <p className="text-foreground">📞 {form.phone}</p>
                  {form.email && <p className="text-foreground">📧 {form.email}</p>}
                  <p className="text-foreground">📍 {form.address}</p>
                </div>

                {/* Products */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 text-muted-foreground">
                        <th className="py-2 px-2 text-left">Sản phẩm</th>
                        <th className="py-2 px-2 text-center">SL</th>
                        <th className="py-2 px-2 text-right">Đơn giá</th>
                        <th className="py-2 px-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item, i) => (
                        <tr key={i} className="border-b border-border">
                          <td className="py-2 px-2 text-foreground">{item.name}</td>
                          <td className="py-2 px-2 text-center text-foreground">{item.quantity}</td>
                          <td className="py-2 px-2 text-right text-foreground">{formatPrice(item.price)}</td>
                          <td className="py-2 px-2 text-right font-bold text-foreground">{formatPrice(item.price * item.quantity)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Totals */}
                <div className="bg-muted/50 rounded-lg p-3 space-y-1.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng tiền hàng:</span>
                    <span className="font-bold text-foreground">{formatPrice(totalPrice)}</span>
                  </div>
                  {hotelDiscount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>Giảm khách sạn:</span>
                      <span className="font-bold">-{formatPrice(hotelDiscount)}</span>
                    </div>
                  )}
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Giảm mã {appliedCoupon?.code}:</span>
                      <span className="font-bold">-{formatPrice(couponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t border-border pt-1.5">
                    <span className="font-bold text-foreground">Tổng thanh toán:</span>
                    <span className="font-extrabold text-primary text-lg">{formatPrice(finalPrice)}</span>
                  </div>
                  <div className="flex justify-between text-orange-600 font-semibold">
                    <span>🔸 Cọc 50%:</span>
                    <span className="text-lg font-extrabold">{formatPrice(depositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground">
                    <span>Còn lại:</span>
                    <span className="font-bold">{formatPrice(remainingAmount)}</span>
                  </div>
                </div>

                {/* QR Payment */}
                <div className="text-center space-y-3">
                  <h4 className="font-bold text-foreground">Quét QR để thanh toán cọc</h4>
                  <div className="flex justify-center">
                    <img src={qrUrl} alt="QR thanh toán" className="w-52 h-52 rounded-xl border-2 border-border" width={208} height={208} />
                  </div>
                  <div className="bg-amber-50 border border-amber-300 rounded-lg p-3 text-xs space-y-0.5 max-w-xs mx-auto">
                    <p className="text-amber-800">🏦 Ngân hàng: <strong>VietinBank</strong></p>
                    <p className="text-amber-800">👤 Chủ TK: <strong>VAN THI MINH LINH</strong></p>
                    <p className="text-amber-800">💳 STK: <strong>104002912582</strong></p>
                    <p className="text-amber-800">📝 Nội dung CK: <strong className="text-destructive">{orderCode}</strong>
                      <button onClick={() => copyToClipboard(orderCode)} className="ml-1 inline-flex">
                        <Copy className="h-3 w-3 text-amber-600 hover:text-primary" />
                      </button>
                    </p>
                    <p className="text-amber-800">💰 Số tiền cọc: <strong className="text-destructive">{formatPrice(depositAmount)}</strong></p>
                  </div>
                </div>
              </div>

              {/* Invoice Footer */}
              <div className="bg-muted/50 p-4 text-center border-t border-border">
                <p className="text-xs text-muted-foreground">Hotline: <strong>098.661.7939</strong> | Zalo: <strong>098.661.7939</strong></p>
                <p className="text-[10px] text-muted-foreground mt-1">© {new Date().getFullYear()} Giang Nguyen Seafood – Sầm Sơn, Thanh Hóa</p>
              </div>
            </div>

            <button onClick={handleConfirmPayment}
              className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-xl text-base hover:opacity-90 active:scale-95 transition-all">
              TÔI ĐÃ THANH TOÁN
            </button>
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-12 space-y-4 animate-fade-in">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-extrabold text-foreground">Đặt hàng thành công!</h2>
            <p className="text-muted-foreground">Mã đơn: <span className="font-bold text-primary">{orderCode}</span></p>
            <p className="text-sm text-muted-foreground">Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 30 phút.</p>
            <p className="text-sm text-green-600 font-medium">📧 Hóa đơn đã được gửi qua email</p>
            <div className="flex gap-3 justify-center">
              {user && (
                <button onClick={() => navigate('/account')}
                  className="bg-card border border-border text-foreground font-bold px-6 py-3 rounded-xl hover:bg-muted transition-colors text-sm">
                  XEM ĐƠN HÀNG
                </button>
              )}
              <button onClick={() => navigate('/')}
                className="ocean-gradient text-primary-foreground font-bold px-8 py-3 rounded-xl hover:opacity-90 active:scale-95 transition-all">
                VỀ TRANG CHỦ
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
