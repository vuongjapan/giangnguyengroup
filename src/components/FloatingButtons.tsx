import { Phone, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function FloatingButtons() {
  const { totalItems, setIsOpen } = useCart();

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2.5">
      {/* Quick buy button */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative coral-gradient text-primary-foreground p-3.5 rounded-full shadow-lg hover:scale-110 transition-transform animate-bounce-soft"
          aria-label="Mở giỏ hàng"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
            {totalItems}
          </span>
        </button>
      )}

      {/* Phone */}
      <a
        href="tel:0123456789"
        className="bg-success text-primary-foreground p-3.5 rounded-full shadow-lg hover:scale-110 transition-transform animate-pulse-soft"
        aria-label="Gọi điện"
      >
        <Phone className="h-5 w-5" />
      </a>

      {/* Zalo */}
      <a
        href="https://zalo.me/0123456789"
        target="_blank"
        rel="noopener noreferrer"
        className="bg-primary text-primary-foreground p-3.5 rounded-full shadow-lg hover:scale-110 transition-transform text-xs font-bold flex items-center justify-center w-[46px] h-[46px]"
        aria-label="Zalo"
      >
        Zalo
      </a>

      {/* Facebook */}
      <a
        href="https://facebook.com"
        target="_blank"
        rel="noopener noreferrer"
        className="ocean-gradient text-primary-foreground p-3.5 rounded-full shadow-lg hover:scale-110 transition-transform text-xs font-bold flex items-center justify-center w-[46px] h-[46px]"
        aria-label="Facebook"
      >
        FB
      </a>
    </div>
  );
}
