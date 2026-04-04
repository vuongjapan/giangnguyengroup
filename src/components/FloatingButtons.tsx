import { Phone, ShoppingCart, MessageCircle } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';

export default function FloatingButtons() {
  const { totalItems, setIsOpen } = useCart();

  const buttons = [
    {
      href: 'tel:0123456789',
      label: 'Gọi điện',
      icon: <Phone className="h-5 w-5" />,
      className: 'bg-success text-primary-foreground animate-pulse-soft',
      tooltip: '📞 Gọi điện',
    },
    {
      href: 'https://zalo.me/0123456789',
      label: 'Zalo',
      icon: <span className="text-xs font-black">Zalo</span>,
      className: 'bg-primary text-primary-foreground',
      tooltip: '💬 Zalo',
      external: true,
    },
    {
      href: 'https://facebook.com',
      label: 'Facebook',
      icon: <span className="text-xs font-black">FB</span>,
      className: 'ocean-gradient text-primary-foreground',
      tooltip: '📘 Facebook',
      external: true,
    },
  ];

  return (
    <div className="fixed bottom-4 left-4 z-30 flex flex-col gap-2.5">
      {buttons.map(btn => (
        <a
          key={btn.label}
          href={btn.href}
          target={btn.external ? '_blank' : undefined}
          rel={btn.external ? 'noopener noreferrer' : undefined}
          className={`relative group w-[46px] h-[46px] rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center ${btn.className}`}
          aria-label={btn.label}
        >
          {btn.icon}
          <span className="absolute left-full ml-2 px-2.5 py-1 bg-foreground text-primary-foreground text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {btn.tooltip}
          </span>
        </a>
      ))}

      {/* Cart quick access */}
      {totalItems > 0 && (
        <button
          onClick={() => setIsOpen(true)}
          className="relative coral-gradient text-primary-foreground w-[46px] h-[46px] rounded-full shadow-lg hover:scale-110 transition-transform flex items-center justify-center animate-bounce-soft group"
          aria-label="Mở giỏ hàng"
        >
          <ShoppingCart className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center">
            {totalItems}
          </span>
          <span className="absolute left-full ml-2 px-2.5 py-1 bg-foreground text-primary-foreground text-[10px] font-bold rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            🛒 Mua nhanh
          </span>
        </button>
      )}
    </div>
  );
}
