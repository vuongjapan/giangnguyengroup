import { useState } from 'react';
import { MessageCircle, Phone, X, Facebook } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export default function FloatingButtons() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();
  const size = isMobile ? 48 : 56;

  return (
    <div
      className="fixed z-[9999]"
      style={{ bottom: isMobile ? '76px' : '16px', right: '16px' }}
    >
      {/* Contact options card */}
      {open && (
        <div
          className="absolute bottom-full right-0 mb-3 w-72 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-slide-up"
          style={{ animation: 'slideUp 0.3s ease-out' }}
        >
          <div className="ocean-gradient px-4 py-3 flex items-center justify-between">
            <h3 className="text-primary-foreground font-black text-base">💬 Liên Hệ Hỗ Trợ</h3>
            <button
              onClick={() => setOpen(false)}
              className="text-primary-foreground hover:bg-white/20 rounded-full w-7 h-7 flex items-center justify-center transition-colors"
              aria-label="Đóng"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4 space-y-2.5">
            <a
              href="https://zalo.me/0933562286"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-green-500 hover:bg-green-600 text-white font-bold text-sm transition-colors shadow"
            >
              <span className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-xs font-black">Z</span>
              <span>Chat Zalo Ngay</span>
            </a>
            <a
              href="tel:0933562286"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-blue-500 hover:bg-blue-600 text-white font-bold text-sm transition-colors shadow"
            >
              <Phone className="h-5 w-5" />
              <span>Gọi Hotline</span>
            </a>
            <a
              href="https://m.me/giangnguyengroup"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white font-bold text-sm transition-colors shadow"
            >
              <Facebook className="h-5 w-5" />
              <span>Nhắn Facebook</span>
            </a>
          </div>
          <p className="text-[11px] text-center text-muted-foreground pb-3">
            Phản hồi trong vòng 5 phút ⚡
          </p>
        </div>
      )}

      {/* Main floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="ocean-gradient rounded-full shadow-2xl flex items-center justify-center text-primary-foreground hover:scale-110 transition-transform animate-pulse-soft"
        style={{ width: size, height: size }}
        aria-label="Mở menu liên hệ"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
