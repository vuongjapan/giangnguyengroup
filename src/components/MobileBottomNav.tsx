import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutGrid, Phone, MessageCircle, User, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const categories = [
  { label: 'Tất cả sản phẩm', href: '/san-pham' },
  { label: 'Mực khô', href: '/san-pham?category=Mực+khô' },
  { label: 'Hải sản 1 nắng', href: '/san-pham?category=Hải+sản+1+nắng' },
  { label: 'Combo quà biếu', href: '/combo' },
  { label: 'Khuyến mãi', href: '/khuyen-mai' },
  { label: 'Món ngon', href: '/mon-ngon' },
  { label: 'Tin tức', href: '/tin-tuc' },
  { label: 'Blog', href: '/blog' },
  { label: 'Giới thiệu', href: '/gioi-thieu' },
];

export default function MobileBottomNav() {
  const isMobile = useIsMobile();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!isMobile) return null;

  return (
    <>
      {/* Category overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-[60] bg-foreground/50" onClick={() => setMenuOpen(false)}>
          <div className="absolute bottom-[60px] left-0 right-0 bg-card rounded-t-2xl p-4 max-h-[60vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-foreground text-base">Danh mục</h3>
              <button onClick={() => setMenuOpen(false)} className="p-1"><X className="h-5 w-5 text-muted-foreground" /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {categories.map(cat => (
                <Link
                  key={cat.href}
                  to={cat.href}
                  onClick={() => setMenuOpen(false)}
                  className="px-3 py-3 bg-secondary/60 rounded-xl text-sm font-medium text-foreground hover:bg-primary/10 transition-colors text-center"
                >
                  {cat.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bottom bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-[0_-2px_10px_rgba(0,0,0,0.1)] safe-area-bottom">
        <div className="flex items-center justify-around h-[60px]">
          <button onClick={() => setMenuOpen(!menuOpen)} className="flex flex-col items-center gap-0.5 min-w-[56px]">
            <LayoutGrid className="h-5 w-5 text-primary" />
            <span className="text-[10px] font-medium text-foreground">Danh mục</span>
          </button>

          <a href="tel:0933562286" className="flex flex-col items-center gap-0.5 min-w-[56px]">
            <div className="relative">
              <Phone className="h-5 w-5 text-[#FF6B35]" />
              <span className="absolute -top-1 -right-2 bg-[#FF6B35] text-[7px] text-white px-1 rounded-full font-bold">8-21h</span>
            </div>
            <span className="text-[10px] font-medium text-foreground">Hotline</span>
          </a>

          <a href="https://m.me/giangnguyengroup" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-0.5 min-w-[56px]">
            <MessageCircle className="h-5 w-5 text-[#0084FF]" />
            <span className="text-[10px] font-medium text-foreground">Messenger</span>
          </a>

          <a href="https://zalo.me/0933562286" target="_blank" rel="noopener noreferrer" className="flex flex-col items-center gap-0.5 min-w-[56px]">
            <div className="w-5 h-5 bg-[#0068FF] rounded-full flex items-center justify-center">
              <span className="text-[8px] font-black text-white">Zalo</span>
            </div>
            <span className="text-[10px] font-medium text-foreground">Zalo</span>
          </a>

          <Link to="/auth" className="flex flex-col items-center gap-0.5 min-w-[56px]">
            <User className="h-5 w-5 text-[#00BCD4]" />
            <span className="text-[10px] font-medium text-foreground">Tài Khoản</span>
          </Link>
        </div>
      </nav>
    </>
  );
}
