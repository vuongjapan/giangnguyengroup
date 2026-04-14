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

const CHECKOUT_SESSION_KEY = 'gn_checkout_pending_order';

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
  const [sessionReady, setSessionReady] = useState(false);

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
  const displayItems = Array.isArray(orderData?.items) ? orderData.items : items.map(i => ({ ...i }));
  const displaySubtotal = Number(orderData?.subtotal ?? totalPrice);
  const displayHotelDiscount = Number(orderData?.hotel_discount ?? hotelDiscount);
  const displayCouponDiscount = Number(orderData?.coupon_discount ?? couponDiscount);
  const displayTotal = Number(orderData?.total ?? finalPrice);
  const displayDepositAmount = Math.round(displayTotal * 0.5);
  const displayRemainingAmount = displayTotal - displayDepositAmount;
  const displayCustomer = {
    name: orderData?.customer_name ?? form.name,
    phone: orderData?.customer_phone ?? form.phone,
    email: orderData?.customer_email ?? form.email,
    address: orderData?.customer_address ?? form.address,
  };

  useEffect(() => {
    try {
      const saved = localStorage.getItem(CHECKOUT_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed?.orderCode && parsed?.orderData) {
          setOrderCode(parsed.orderCode);
          setOrderData(parsed.orderData);
          setPaymentStatus(parsed.orderData.status || 'pending');
          setStep('payment');
          if (parsed.form) setForm(parsed.form);
          if (parsed.appliedCoupon) setAppliedCoupon(parsed.appliedCoupon);
        }
      }
    } catch (error) {
      console.error('Restore checkout session failed:', error);
      localStorage.removeItem(CHECKOUT_SESSION_KEY);
    } finally {
      setSessionReady(true);
    }
  }, []);

  // Poll payment status
  useEffect(() => {
    if (step !== 'payment' || !orderCode) return;
    let active = true;

    const checkPaymentStatus = async () => {
      const { data, error } = await supabase.functions.invoke('order-status', {
        body: {
          orderCode,
          customerPhone: displayCustomer.phone,
          customerEmail: displayCustomer.email,
        },
      });

      if (!active || error || !data?.status) return;

      setPaymentStatus(data.status);
      setOrderData((prev: any) => prev ? { ...prev, status: data.status } : prev);

      if (data.status === 'deposit_paid') {
        localStorage.removeItem(CHECKOUT_SESSION_KEY);
      }
    };

    checkPaymentStatus();
    const interval = setInterval(checkPaymentStatus, 5000);
    return () => clearInterval(interval);
  }, [step, orderCode, displayCustomer.phone, displayCustomer.email]);

  useEffect(() => {
    if (step !== 'payment' || paymentStatus !== 'deposit_paid') return;

    const timeout = setTimeout(() => {
      clearCart();
      localStorage.removeItem(CHECKOUT_SESSION_KEY);
      setStep('done');
    }, 1500);

    return () => clearTimeout(timeout);
  }, [step, paymentStatus, clearCart]);

  if (!sessionReady) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (items.length === 0 && step === 'info') {
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

    const orderItems = items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, image: i.image, unit: i.unit }));
    let pointsEarned = 0;

    if (user) {
      const { data: profile } = await supabase.from('profiles').select('level').eq('id', user.id).maybeSingle();
      const cashbackRate = profile?.level === 'PRO' ? 0.1 : profile?.level === 'VIP' ? 0.05 : 0.02;
      pointsEarned = Math.floor(finalPrice * cashbackRate);
    }

    const { data, error } = await supabase.functions.invoke('create-order', {
      body: {
        customer: form,
        items: orderItems,
        totalPrice,
        hotelDiscount,
        couponCode: appliedCoupon?.code || null,
        pointsEarned,
      },
    });

    if (error || !data?.order) {
      console.error('Create order error:', error || data);
      toast.error(data?.error || 'Lỗi tạo đơn hàng, vui lòng thử lại');
      setSaving(false);
      return;
    }

    setOrderCode(data.order.order_code);
    setPaymentStatus(data.order.status || 'pending');
    setOrderData(data.order);
    localStorage.setItem(CHECKOUT_SESSION_KEY, JSON.stringify({
      orderCode: data.order.order_code,
      orderData: data.order,
      form,
      appliedCoupon,
    }));

    // Update profile
    if (user && pointsEarned) {
      const { data: currentProfile } = await supabase.from('profiles').select('total_spent, points, level').eq('id', user.id).maybeSingle();
      if (currentProfile) {
        const newTotalSpent = (currentProfile.total_spent || 0) + Number(data.order.total || finalPrice);
        const newPoints = (currentProfile.points || 0) + pointsEarned;
        let newLevel = 'Thường';
        if (newTotalSpent >= 10000000) newLevel = 'PRO';
        else if (newTotalSpent >= 3000000) newLevel = 'VIP';
        await supabase.from('profiles').update({ total_spent: newTotalSpent, points: newPoints, level: newLevel }).eq('id', user.id);
      }
    }

    if (!data.emailSent) {
      toast.warning('Đơn đã tạo nhưng email đang tạm lỗi, shop vẫn đã nhận được đơn hàng.');
    }

    setSaving(false);
    setStep('payment');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Đã sao chép!');
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = `https://qr.sepay.vn/img?acc=104002912582&bank=VietinBank&amount=${displayDepositAmount}&des=${encodeURIComponent(orderCode)}`;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1 max-w-2xl pb-24 md:pb-6">
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
                       {displayItems.map((item: any) => (
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

            <div className="bg-card rounded-2xl border-2 border-primary/20 overflow-hidden shadow-xl">
              {/* Invoice Header - Premium 5 Star */}
              <div className="ocean-gradient p-6 text-center relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'url(/images/giang-nguyen-banner.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }} />
                <div className="relative z-10">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-accent text-lg">⭐</span>
                    <h2 className="text-xl md:text-2xl font-black text-primary-foreground tracking-wide">GIANG NGUYÊN GROUP</h2>
                    <span className="text-accent text-lg">⭐</span>
                  </div>
                  <p className="text-primary-foreground/80 text-xs">CÔNG TY TNHH GIANG NGUYÊN GROUP</p>
                  <p className="text-primary-foreground/70 text-[10px] mt-1">Hải sản khô & 1 nắng cao cấp Sầm Sơn, Thanh Hóa</p>
                  <div className="flex items-center justify-center gap-4 mt-2 text-[10px] text-primary-foreground/70">
                    <span>📞 093.356.2286</span>
                    <span>📍 Sầm Sơn, Thanh Hóa</span>
                  </div>
                </div>
              </div>

              <div className="p-5 md:p-6 space-y-4">
                {/* Invoice Title */}
                <div className="text-center border-b-2 border-dashed border-primary/20 pb-4">
                  <div className="inline-block bg-primary/10 rounded-full px-6 py-1.5 mb-2">
                    <h3 className="text-base font-black text-primary tracking-wider">HÓA ĐƠN ĐẶT HÀNG</h3>
                  </div>
                  <div className="flex items-center justify-center gap-3 text-sm">
                    <span className="text-muted-foreground">Mã đơn:</span>
                    <span className="font-black text-primary text-base bg-primary/5 px-3 py-0.5 rounded-lg">{orderCode}</span>
                    <button onClick={() => copyToClipboard(orderCode)} className="inline-flex items-center">
                      {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">📅 {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                {/* Status Badge */}
                <div className="text-center">
                  <span className={`inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold shadow-sm ${
                    paymentStatus === 'deposit_paid' 
                      ? 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-300' 
                      : 'bg-gradient-to-r from-orange-100 to-amber-100 text-orange-700 border border-orange-300'
                  }`}>
                    {paymentStatus === 'deposit_paid' ? '✅ ĐÃ CỌC 50% – XÁC NHẬN' : '⏳ CHỜ THANH TOÁN CỌC'}
                  </span>
                </div>

                {/* Customer Info - Premium Card */}
                <div className="bg-gradient-to-br from-muted/60 to-muted/30 rounded-xl p-4 border border-border/50">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Thông tin khách hàng</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <p className="text-foreground flex items-center gap-2"><span className="text-primary">👤</span> <strong>{displayCustomer.name}</strong></p>
                    <p className="text-foreground flex items-center gap-2"><span className="text-primary">📞</span> {displayCustomer.phone}</p>
                    {displayCustomer.email && <p className="text-foreground flex items-center gap-2"><span className="text-primary">📧</span> {displayCustomer.email}</p>}
                    <p className="text-foreground flex items-center gap-2 sm:col-span-2"><span className="text-primary">📍</span> {displayCustomer.address}</p>
                  </div>
                </div>

                {/* Products Table - Premium */}
                <div>
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Chi tiết đơn hàng</p>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="ocean-gradient text-primary-foreground">
                          <th className="py-2.5 px-3 text-left font-bold text-xs">Sản phẩm</th>
                          <th className="py-2.5 px-2 text-center font-bold text-xs">SL</th>
                          <th className="py-2.5 px-2 text-right font-bold text-xs">Đơn giá</th>
                          <th className="py-2.5 px-3 text-right font-bold text-xs">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody>
                        {displayItems.map((item: any, i: number) => (
                          <tr key={i} className={`border-b border-border/50 ${i % 2 === 0 ? 'bg-muted/20' : ''}`}>
                            <td className="py-2.5 px-3 text-foreground font-medium">{item.name}</td>
                            <td className="py-2.5 px-2 text-center text-foreground">{item.quantity}</td>
                            <td className="py-2.5 px-2 text-right text-muted-foreground">{formatPrice(item.price)}</td>
                            <td className="py-2.5 px-3 text-right font-bold text-foreground">{formatPrice(item.price * item.quantity)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Totals - Premium */}
                <div className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-4 border border-primary/10 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tổng tiền hàng:</span>
                    <span className="font-bold text-foreground">{formatPrice(displaySubtotal)}</span>
                  </div>
                  {displayHotelDiscount > 0 && (
                    <div className="flex justify-between text-primary">
                      <span>🏨 Giảm khách sạn:</span>
                      <span className="font-bold">-{formatPrice(displayHotelDiscount)}</span>
                    </div>
                  )}
                  {displayCouponDiscount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>🎫 Mã {orderData?.coupon_code || appliedCoupon?.code}:</span>
                      <span className="font-bold">-{formatPrice(displayCouponDiscount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between border-t-2 border-primary/20 pt-2">
                    <span className="font-black text-foreground text-base">TỔNG THANH TOÁN</span>
                    <span className="font-black text-primary text-xl">{formatPrice(displayTotal)}</span>
                  </div>
                  <div className="flex justify-between bg-orange-50 rounded-lg px-3 py-2 border border-orange-200">
                    <span className="text-orange-700 font-bold">🔸 Cọc 50%:</span>
                    <span className="font-black text-orange-700 text-lg">{formatPrice(displayDepositAmount)}</span>
                  </div>
                  <div className="flex justify-between text-muted-foreground text-xs">
                    <span>Còn lại khi nhận hàng:</span>
                    <span className="font-bold">{formatPrice(displayRemainingAmount)}</span>
                  </div>
                </div>

                {/* QR Payment */}
                {paymentStatus !== 'deposit_paid' && (
                <div className="text-center space-y-3 border-t-2 border-dashed border-primary/20 pt-4">
                  <h4 className="font-black text-foreground text-lg flex items-center justify-center gap-2">
                    <span className="text-primary">💳</span> Quét QR để thanh toán cọc
                  </h4>
                  <div className="flex justify-center">
                    <div className="p-3 bg-card rounded-2xl border-2 border-primary/20 shadow-lg">
                      <img src={qrUrl} alt="QR thanh toán SePay" className="w-52 h-52 md:w-56 md:h-56 rounded-xl" width={224} height={224} />
                    </div>
                  </div>
                  <div className="bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-300 rounded-xl p-4 text-sm space-y-1.5 max-w-sm mx-auto shadow-sm">
                    <p className="text-amber-900">🏦 Ngân hàng: <strong>VietinBank</strong></p>
                    <p className="text-amber-900">👤 Chủ TK: <strong>VAN THI MINH LINH</strong></p>
                    <p className="text-amber-900">💳 STK: <strong>104002912582</strong></p>
                    <p className="text-amber-900">📝 Nội dung CK: <strong className="text-destructive text-base">{orderCode}</strong>
                      <button onClick={() => copyToClipboard(orderCode)} className="ml-1 inline-flex">
                        <Copy className="h-3.5 w-3.5 text-amber-600 hover:text-primary" />
                      </button>
                    </p>
                    <p className="text-amber-900">💰 Số tiền cọc: <strong className="text-destructive text-base">{formatPrice(displayDepositAmount)}</strong></p>
                  </div>
                  <p className="text-xs text-muted-foreground italic">Hệ thống tự xác nhận sau khi nhận tiền qua SePay webhook</p>
                </div>
                )}
              </div>

              {/* Invoice Footer - Premium */}
              <div className="ocean-gradient p-4 text-center">
                <p className="text-primary-foreground/90 text-xs font-medium">Cảm ơn quý khách đã tin tưởng Giang Nguyên Group!</p>
                <div className="flex items-center justify-center gap-3 mt-1.5 text-[10px] text-primary-foreground/70">
                  <span>📞 093.356.2286</span>
                  <span>•</span>
                  <span>Zalo: 093.356.2286</span>
                  <span>•</span>
                  <span>📍 Sầm Sơn, Thanh Hóa</span>
                </div>
                <p className="text-[9px] text-primary-foreground/50 mt-1">© {new Date().getFullYear()} CÔNG TY TNHH GIANG NGUYÊN GROUP</p>
              </div>
            </div>

            {paymentStatus === 'deposit_paid' ? (
              <div className="w-full rounded-xl border border-primary/20 bg-primary/10 p-4 text-center">
                <p className="font-bold text-primary">Thanh toán đã được xác nhận, hệ thống đang hoàn tất đơn hàng...</p>
              </div>
            ) : (
              <div className="w-full rounded-xl border border-border bg-muted/40 p-4 text-center text-sm text-muted-foreground">
                Hệ thống kiểm tra thanh toán tự động mỗi 5 giây. Sau khi chuyển khoản đúng nội dung, hóa đơn sẽ tự cập nhật và gửi email xác nhận cho khách.
              </div>
            )}
          </div>
        )}

        {step === 'done' && (
          <div className="text-center py-12 space-y-4 animate-fade-in">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
            <h2 className="text-2xl font-extrabold text-foreground">Đặt hàng thành công!</h2>
            <p className="text-muted-foreground">Mã đơn: <span className="font-bold text-primary">{orderCode}</span></p>
            <p className="text-sm text-muted-foreground">Chúng tôi sẽ liên hệ xác nhận đơn hàng trong vòng 30 phút.</p>
            <p className="text-sm text-green-600 font-medium">📧 Email hóa đơn sẽ được gửi tự động nếu khách có nhập địa chỉ email</p>
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
