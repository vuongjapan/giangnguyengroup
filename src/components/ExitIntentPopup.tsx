import { useState, useEffect } from 'react';
import { X, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

const EXIT_KEY = 'gn-exit-shown';

export default function ExitIntentPopup() {
  const [show, setShow] = useState(false);
  const { items, totalPrice, setIsOpen } = useCart();

  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !localStorage.getItem(EXIT_KEY)) {
        setShow(true);
        localStorage.setItem(EXIT_KEY, Date.now().toString());
      }
    };

    // Reset every 24h
    const lastShown = localStorage.getItem(EXIT_KEY);
    if (lastShown && Date.now() - parseInt(lastShown) > 86400000) {
      localStorage.removeItem(EXIT_KEY);
    }

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => document.removeEventListener('mouseleave', handleMouseLeave);
  }, []);

  if (!show) return null;

  const hasCartItems = items.length > 0;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 animate-fade-in p-4">
      <div className="bg-card rounded-2xl shadow-2xl max-w-sm w-full overflow-hidden relative animate-slide-up">
        <button onClick={() => setShow(false)} className="absolute top-3 right-3 text-muted-foreground hover:text-foreground z-10">
          <X className="h-5 w-5" />
        </button>

        <div className="coral-gradient p-6 text-center">
          <p className="text-4xl mb-2">😢</p>
          <h3 className="text-xl font-black text-primary-foreground">KHOAN ĐÃ!</h3>
          <p className="text-primary-foreground/80 text-sm mt-1">Đừng bỏ lỡ ưu đãi này nhé!</p>
        </div>

        <div className="p-6 text-center">
          {hasCartItems ? (
            <>
              <p className="text-sm text-muted-foreground mb-2">Bạn còn <strong>{items.length}</strong> sản phẩm trong giỏ</p>
              <p className="text-2xl font-black text-primary mb-4">
                {totalPrice.toLocaleString('vi-VN')}₫
              </p>
              <button
                onClick={() => { setShow(false); setIsOpen(true); }}
                className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg text-sm hover:opacity-90 flex items-center justify-center gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                XEM GIỎ HÀNG & ĐẶT MUA
              </button>
            </>
          ) : (
            <>
              <p className="text-lg font-bold text-foreground mb-2">Giảm thêm 5% cho bạn!</p>
              <p className="text-sm text-muted-foreground mb-4">Dùng mã <strong className="text-primary">QUAYLAIGIAM5</strong> khi đặt hàng</p>
              <a
                href="#products"
                onClick={() => setShow(false)}
                className="inline-block w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg text-sm hover:opacity-90 text-center"
              >
                XEM SẢN PHẨM NGAY
              </a>
            </>
          )}

          <button onClick={() => setShow(false)} className="text-xs text-muted-foreground hover:underline mt-3 block mx-auto">
            Để lần sau
          </button>
        </div>
      </div>
    </div>
  );
}
