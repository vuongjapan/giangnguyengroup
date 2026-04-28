import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Home, ShoppingBag, ShoppingCart, Phone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useCart } from '@/contexts/CartContext';

export default function MobileBottomNav() {
  const isMobile = useIsMobile();
  const { totalItems, setIsOpen } = useCart();
  const [active, setActive] = useState<string>('home');

  useEffect(() => {
    const onScroll = () => {
      if (window.scrollY < 200) setActive('home');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!isMobile) return null;

  const goTop = () => {
    setActive('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goProducts = () => {
    setActive('products');
    const el = document.getElementById('products');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    else window.location.href = '/san-pham';
  };

  const openCart = () => {
    setActive('cart');
    setIsOpen(true);
  };

  const goContact = () => {
    setActive('contact');
    const el = document.getElementById('map-section');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const itemBase = 'flex flex-col items-center justify-center gap-0.5 flex-1 transition-colors';
  const cls = (k: string) => `${itemBase} ${active === k ? 'text-primary' : 'text-foreground/70'}`;

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[55] bg-card border-t border-border"
      style={{
        boxShadow: '0 -2px 12px rgba(0,0,0,0.08)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      <div className="flex items-stretch h-[60px]">
        <button onClick={goTop} className={cls('home')} aria-label="Trang chủ">
          <Home className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Trang Chủ</span>
        </button>

        <button onClick={goProducts} className={cls('products')} aria-label="Sản phẩm">
          <ShoppingBag className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Sản Phẩm</span>
        </button>

        <button onClick={openCart} className={cls('cart')} aria-label="Giỏ hàng">
          <div className="relative">
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-coral text-white text-[9px] font-bold rounded-full min-w-[16px] h-[16px] px-1 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-semibold">Giỏ Hàng</span>
        </button>

        <a href="tel:0933562286" onClick={() => setActive('contact')} className={cls('contact')} aria-label="Liên hệ">
          <Phone className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Liên Hệ</span>
        </a>
      </div>
    </nav>
  );
}
