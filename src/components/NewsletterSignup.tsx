import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';

export default function NewsletterSignup() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }
    setSubmitted(true);
    try {
      const list = JSON.parse(localStorage.getItem('gn-newsletter') || '[]');
      list.push({ email, date: new Date().toISOString() });
      localStorage.setItem('gn-newsletter', JSON.stringify(list));
    } catch {}
  };

  return (
    <section
      className="py-14 md:py-16 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
    >
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Mail className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </div>
          <h2 className="text-2xl md:text-4xl font-black text-white mb-2 drop-shadow">
            Đăng Ký Nhận Ưu Đãi Độc Quyền
          </h2>
          <p className="text-white/90 text-sm md:text-base mb-6">
            Nhận ngay voucher <strong>50,000đ</strong> khi đăng ký email
          </p>

          {submitted ? (
            <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-5 border border-white/30 max-w-md mx-auto">
              <CheckCircle className="h-10 w-10 text-white mx-auto mb-2" />
              <p className="text-white font-bold text-base md:text-lg">
                ✅ Đăng ký thành công! Kiểm tra email nhé
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto">
              <div className="flex h-12 md:h-14 shadow-xl rounded-full overflow-hidden bg-white">
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                  placeholder="Nhập email của bạn..."
                  className="flex-1 px-5 text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:outline-none min-w-0 bg-white"
                />
                <button
                  type="submit"
                  className="bg-primary hover:opacity-90 text-primary-foreground font-black px-5 md:px-7 text-sm md:text-base transition-opacity"
                >
                  Đăng Ký
                </button>
              </div>
              {error && (
                <p className="text-white bg-destructive/80 inline-block px-3 py-1 rounded-full text-xs mt-3 font-semibold">
                  ⚠ {error}
                </p>
              )}
            </form>
          )}

          <p className="text-white/70 text-[11px] md:text-xs mt-4">
            🔒 Chúng tôi cam kết không spam
          </p>
        </div>
      </div>
    </section>
  );
}
