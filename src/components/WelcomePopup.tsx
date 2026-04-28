import { useState, useEffect } from 'react';
import { X, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const DISCOUNT_CODE = 'SAMSONTUOI';
const POPUP_KEY = 'gn_popup_shown';

export default function WelcomePopup() {
  const [show, setShow] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const shown = sessionStorage.getItem(POPUP_KEY);
    if (!shown) {
      const timer = setTimeout(() => setShow(true), 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setShow(false);
    sessionStorage.setItem(POPUP_KEY, '1');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(DISCOUNT_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 animate-fade-in"
      style={{ backgroundColor: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)' }}
      onClick={handleClose}
    >
      <div
        className="relative max-w-md w-full rounded-3xl shadow-2xl overflow-hidden animate-scale-in"
        style={{ background: 'linear-gradient(135deg, hsl(180, 70%, 25%) 0%, hsl(200, 80%, 40%) 100%)' }}
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-colors"
          aria-label="Đóng"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8 text-center text-white">
          <div className="text-5xl mb-3">🎁</div>
          <h3 className="text-2xl md:text-3xl font-black mb-2">Ưu Đãi Chào Mừng!</h3>
          <p className="text-white/90 text-sm md:text-base mb-5">
            Nhập mã <strong>{DISCOUNT_CODE}</strong> – Giảm ngay <strong>15%</strong> đơn hàng đầu tiên
          </p>

          <div className="bg-white/15 border-2 border-dashed border-white/40 rounded-xl p-4 mb-5 flex items-center justify-between gap-3">
            <span className="font-mono font-black text-xl md:text-2xl text-white tracking-wider flex-1 text-center">
              {DISCOUNT_CODE}
            </span>
            <button
              onClick={handleCopy}
              className="bg-white text-primary font-bold px-3 py-2 rounded-lg flex items-center gap-1.5 hover:scale-105 transition-transform text-sm"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Đã copy' : 'Copy'}
            </button>
          </div>

          <Link
            to="/san-pham"
            onClick={handleClose}
            className="block w-full bg-accent text-accent-foreground font-black py-3.5 rounded-full text-base hover:opacity-90 transition-opacity shadow-lg"
          >
            🛒 MUA NGAY
          </Link>

          <p className="text-[11px] text-white/60 mt-4">
            * Áp dụng cho đơn từ 300.000₫. Không kèm khuyến mãi khác.
          </p>
        </div>
      </div>
    </div>
  );
}
