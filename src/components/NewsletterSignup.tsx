import { useState } from 'react';
import { Send, Gift, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export default function NewsletterSignup() {
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.match(/^0\d{9}$/)) {
      toast.error('Vui lòng nhập số điện thoại hợp lệ (10 số)');
      return;
    }
    setSubmitted(true);
    toast.success('Đăng ký thành công! Mã giảm giá: THANHVIEN5');
  };

  return (
    <section className="py-8 md:py-10 ocean-gradient relative overflow-hidden">
      {/* Decorative bubbles */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-4 left-[10%] w-20 h-20 rounded-full bg-primary-foreground animate-pulse-soft" />
        <div className="absolute bottom-6 right-[15%] w-14 h-14 rounded-full bg-primary-foreground animate-bounce-soft" />
        <div className="absolute top-1/2 left-[60%] w-8 h-8 rounded-full bg-primary-foreground animate-pulse-soft" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-1.5 rounded-full text-xs font-bold mb-4">
            <Gift className="h-4 w-4" /> NHẬN ƯU ĐÃI ĐỘC QUYỀN
          </div>

          <h2 className="text-xl md:text-2xl font-black text-primary-foreground mb-2">
            Đăng ký nhận tin – Giảm ngay 5%
          </h2>
          <p className="text-primary-foreground/80 text-sm mb-5">
            Nhận mã giảm giá, khuyến mãi flash sale, và tin tức hải sản mới nhất
          </p>

          {submitted ? (
            <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-2xl p-6 border border-primary-foreground/20">
              <CheckCircle className="h-10 w-10 text-accent mx-auto mb-3" />
              <p className="text-primary-foreground font-bold text-lg mb-1">Đăng ký thành công!</p>
              <p className="text-primary-foreground/80 text-sm mb-3">Mã giảm giá của bạn:</p>
              <div className="bg-accent text-accent-foreground font-black text-xl px-6 py-3 rounded-xl inline-block tracking-wider">
                THANHVIEN5
              </div>
              <p className="text-primary-foreground/60 text-xs mt-3">Áp dụng cho đơn từ 300.000₫</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2 max-w-md mx-auto">
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại..."
                className="flex-1 px-4 py-3 rounded-full bg-primary-foreground/10 border border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/50 text-sm focus:outline-none focus:ring-2 focus:ring-accent backdrop-blur-sm"
              />
              <button
                type="submit"
                className="bg-accent text-accent-foreground font-bold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity flex items-center gap-1.5 flex-shrink-0"
              >
                <Send className="h-4 w-4" /> Nhận mã
              </button>
            </form>
          )}

          <p className="text-primary-foreground/50 text-[10px] mt-3">
            🔒 Thông tin được bảo mật 100% • Hủy đăng ký bất cứ lúc nào
          </p>
        </div>
      </div>
    </section>
  );
}
