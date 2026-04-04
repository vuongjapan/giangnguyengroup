import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Building2 } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { useHotel } from '@/contexts/HotelContext';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { toast } from 'sonner';

function generateOrderCode() {
  const num = Math.floor(Math.random() * 9999) + 1;
  return `SEVQR GN${String(num).padStart(4, '0')}`;
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

  const discount = hotelSession ? Math.round(totalPrice * hotelSession.discountPercent / 100) : 0;
  const finalPrice = totalPrice - discount;

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

  const handleSubmit = async () => {
    if (!validate()) return;
    setSaving(true);
    const code = generateOrderCode();
    setOrderCode(code);

    // Save order to database
    const orderData: any = {
      order_code: code,
      customer_name: form.name.trim(),
      customer_phone: form.phone.trim(),
      customer_email: form.email.trim(),
      customer_address: form.address.trim(),
      items: items.map(i => ({ productId: i.productId, name: i.name, price: i.price, quantity: i.quantity, image: i.image, unit: i.unit })),
      total: totalPrice,
      status: 'pending',
    };

    if (user) {
      orderData.user_id = user.id;
      // Calculate points: based on level
      const { data: profile } = await supabase.from('profiles').select('level').eq('id', user.id).maybeSingle();
      const cashbackRate = profile?.level === 'PRO' ? 0.1 : profile?.level === 'VIP' ? 0.05 : 0.02;
      orderData.points_earned = Math.floor(totalPrice * cashbackRate);
    }

    const { error } = await supabase.from('orders').insert(orderData);
    if (error) {
      console.error('Order error:', error);
      toast.error('Lỗi lưu đơn hàng, vui lòng thử lại');
      setSaving(false);
      return;
    }

    // Update profile total_spent and points if logged in
    if (user && orderData.points_earned) {
      const { data: currentProfile } = await supabase.from('profiles').select('total_spent, points, level').eq('id', user.id).maybeSingle();
      if (currentProfile) {
        const newTotalSpent = (currentProfile.total_spent || 0) + totalPrice;
        const newPoints = (currentProfile.points || 0) + orderData.points_earned;
        // Auto upgrade level
        let newLevel = 'Thường';
        if (newTotalSpent >= 10000000) newLevel = 'PRO';
        else if (newTotalSpent >= 3000000) newLevel = 'VIP';

        await supabase.from('profiles').update({
          total_spent: newTotalSpent,
          points: newPoints,
          level: newLevel,
        }).eq('id', user.id);
      }
    }

    setSaving(false);
    setStep('payment');
  };

  const handleConfirmPayment = () => {
    clearCart();
    setStep('done');
  };

  const qrUrl = `https://qr.sepay.vn/img?acc=104002912582&bank=VietinBank&amount=${totalPrice}&des=${encodeURIComponent(orderCode)}`;

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

            <div className="bg-card rounded-xl border border-border p-4">
              <h3 className="font-bold text-foreground mb-3">Đơn hàng</h3>
              {items.map(item => (
                <div key={item.productId} className="flex justify-between text-sm py-1.5 border-b border-border last:border-0">
                  <span className="text-foreground">{item.name} x{item.quantity}</span>
                  <span className="font-bold text-foreground">{formatPrice(item.price * item.quantity)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-3 mt-2 border-t border-border">
                <span className="font-extrabold text-foreground">Tổng cộng</span>
                <span className="text-xl font-extrabold text-primary">{formatPrice(totalPrice)}</span>
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
            <div className="bg-card rounded-xl border border-border p-6 text-center space-y-4">
              <h2 className="font-extrabold text-foreground text-lg">Quét QR để thanh toán</h2>
              <p className="text-sm text-muted-foreground">Mã đơn hàng: <span className="font-bold text-primary">{orderCode}</span></p>
              <p className="text-2xl font-extrabold text-primary">{formatPrice(totalPrice)}</p>
              <div className="flex justify-center">
                <img src={qrUrl} alt="QR thanh toán" className="w-64 h-64 rounded-xl border border-border" width={256} height={256} />
              </div>
              <div className="bg-secondary/60 rounded-lg p-3 text-sm">
                <p className="text-foreground">Ngân hàng: <span className="font-bold">VietinBank</span></p>
                <p className="text-foreground">STK: <span className="font-bold">104002912582</span></p>
                <p className="text-foreground">Nội dung CK: <span className="font-bold text-primary">{orderCode}</span></p>
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
