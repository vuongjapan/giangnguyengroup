import { useState, useEffect } from 'react';
import { X, Gift, Copy, Check } from 'lucide-react';

const DISCOUNT_CODE = 'CHAOMOI10';
const POPUP_KEY = 'gn-welcome-shown';

export default function WelcomePopup() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);
  const [phone, setPhone] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const shown = localStorage.getItem(POPUP_KEY);
    if (!shown) {
      const timer = setTimeout(() => setShow(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    localStorage.setItem(POPUP_KEY, '1');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(DISCOUNT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = () => {
    if (phone.length >= 9) {
      // Save lead to localStorage (can be synced to DB later)
      const leads = JSON.parse(localStorage.getItem('gn-leads') || '[]');
      leads.push({ phone, source: 'welcome-popup', date: new Date().toISOString() });
      localStorage.setItem('gn-leads', JSON.stringify(leads));
      setSubmitted(true);
    }
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 animate-fade-in p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative animate-slide-up">
        <button onClick={handleClose} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10">
          <X className="h-5 w-5" />
        </button>

        <div className="ocean-gradient p-6 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-3">
            <Gift className="h-8 w-8 text-primary-foreground" />
          </div>
          <h3 className="text-xl font-black text-primary-foreground">CHÀO MỪNG BẠN MỚI!</h3>
          <p className="text-primary-foreground/80 text-sm mt-1">Giang Nguyen Seafood tặng bạn</p>
        </div>

        <div className="p-6">
          {!submitted ? (
            <>
              <div className="text-center mb-4">
                <p className="text-3xl font-black text-primary">GIẢM 10%</p>
                <p className="text-sm text-muted-foreground">cho đơn hàng đầu tiên</p>
              </div>

              <div className="flex items-center justify-center gap-2 bg-secondary rounded-lg p-3 mb-4">
                <span className="font-mono font-bold text-lg text-foreground tracking-wider">{DISCOUNT_CODE}</span>
                <button onClick={handleCopy} className="text-primary hover:text-primary/80">
                  {copied ? <Check className="h-5 w-5 text-green-600" /> : <Copy className="h-5 w-5" />}
                </button>
              </div>

              <div className="space-y-3">
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="Nhập SĐT để nhận thêm ưu đãi..."
                  className="w-full border border-border rounded-lg px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                />
                <button
                  onClick={handleSubmit}
                  disabled={phone.length < 9}
                  className="w-full ocean-gradient text-primary-foreground font-bold py-2.5 rounded-lg text-sm hover:opacity-90 disabled:opacity-50 transition-all"
                >
                  NHẬN MÃ GIẢM GIÁ
                </button>
              </div>

              <p className="text-[10px] text-muted-foreground text-center mt-3">
                * Áp dụng cho đơn từ 300.000₫. Không kèm KM khác.
              </p>
            </>
          ) : (
            <div className="text-center py-4">
              <div className="text-4xl mb-3">🎉</div>
              <p className="font-bold text-foreground text-lg mb-1">Tuyệt vời!</p>
              <p className="text-sm text-muted-foreground mb-3">Mã <strong>{DISCOUNT_CODE}</strong> đã sẵn sàng.</p>
              <button
                onClick={handleClose}
                className="ocean-gradient text-primary-foreground font-bold px-6 py-2 rounded-full text-sm hover:opacity-90"
              >
                MUA SẮM NGAY
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
