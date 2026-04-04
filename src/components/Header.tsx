import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Phone, Menu, X, MapPin, Clock, ChevronDown, User } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { products, formatPrice, categories } from '@/data/products';

export default function Header() {
  const { totalItems, totalPrice, setIsOpen } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const suggestions = searchQuery.length > 0
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <header className={`sticky top-0 z-50 transition-shadow duration-300 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}>
      {/* Promo ticker bar */}
      <div className="bg-coral text-primary-foreground py-1 overflow-hidden">
        <div className="promo-ticker">
          <div className="promo-ticker-content text-xs font-medium">
            🔥 FLASH SALE hải sản khô Sầm Sơn – Giảm 10% đơn đầu tiên &nbsp;&nbsp;|&nbsp;&nbsp;
            🚚 FREE SHIP toàn quốc đơn từ 500K &nbsp;&nbsp;|&nbsp;&nbsp;
            ⭐ Cam kết 100% hải sản sạch, hoàn tiền nếu không hài lòng &nbsp;&nbsp;|&nbsp;&nbsp;
            🎁 Mua 2 tặng 1 Nem chua Thanh Hóa &nbsp;&nbsp;|&nbsp;&nbsp;
            🔥 FLASH SALE hải sản khô Sầm Sơn – Giảm 10% đơn đầu tiên &nbsp;&nbsp;|&nbsp;&nbsp;
            🚚 FREE SHIP toàn quốc đơn từ 500K &nbsp;&nbsp;|&nbsp;&nbsp;
            ⭐ Cam kết 100% hải sản sạch, hoàn tiền nếu không hài lòng &nbsp;&nbsp;|&nbsp;&nbsp;
            🎁 Mua 2 tặng 1 Nem chua Thanh Hóa &nbsp;&nbsp;|&nbsp;&nbsp;
          </div>
        </div>
      </div>

      {/* Top info bar */}
      <div className="ocean-gradient py-1.5 px-4 hidden md:block">
        <div className="container mx-auto flex items-center justify-between text-[11px] text-primary-foreground/90">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Sầm Sơn, Thanh Hóa</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 7:00 – 21:00 hàng ngày</span>
          </div>
          <div className="flex items-center gap-4">
            <span>✅ Sơ chế miễn phí</span>
            <span>🔄 Đổi trả 24h</span>
            <a href="tel:0123456789" className="font-bold text-primary-foreground flex items-center gap-1 hover:underline">
              <Phone className="h-3 w-3" /> Hotline: 0123.456.789
            </a>
          </div>
        </div>
      </div>

      {/* Main header */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-2 flex items-center gap-3">
          {/* Mobile menu toggle */}
          <button className="md:hidden p-1.5 hover:bg-muted rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>

          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="leading-none">
              <div className="flex items-baseline gap-1">
                <span className="text-lg md:text-xl font-black text-primary tracking-tight">GIANG NGUYEN</span>
                <span className="text-lg md:text-xl font-black text-coral tracking-tight">SEAFOOD</span>
              </div>
              <p className="text-[9px] md:text-[10px] text-muted-foreground tracking-wider font-medium">ĐẶC SẢN BIỂN SẦM SƠN</p>
            </div>
          </Link>

          {/* Search bar */}
          <div className="hidden md:flex flex-1 max-w-xl relative mx-4">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="Tìm mực khô, cá thu, nem chua..."
                className="w-full pl-4 pr-12 py-2.5 rounded-full border border-border bg-muted/50 text-sm focus:outline-none focus:border-primary focus:bg-card transition-colors"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
              <button className="absolute right-1 top-1/2 -translate-y-1/2 ocean-gradient text-primary-foreground p-2 rounded-full hover:opacity-90">
                <Search className="h-4 w-4" />
              </button>
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-xl shadow-2xl border border-border overflow-hidden z-50">
                {suggestions.map(p => (
                  <button
                    key={p.id}
                    className="w-full px-4 py-2.5 text-left hover:bg-muted flex items-center gap-3 text-sm border-b border-border last:border-0 transition-colors"
                    onMouseDown={() => { navigate(`/product/${p.slug}`); setSearchQuery(''); }}
                  >
                    <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-lg" loading="lazy" width={48} height={48} />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm truncate">{p.name}</p>
                      <p className="text-coral font-bold text-xs">{formatPrice(p.price)}/{p.unit}</p>
                    </div>
                    {p.badges.includes('hot') && <span className="badge-hot">🔥 Hot</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Hotline mobile */}
            <a href="tel:0123456789" className="md:hidden p-2 hover:bg-muted rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
            </a>

            {/* Cart */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-coral text-primary-foreground text-[10px] font-bold rounded-full h-4.5 w-4.5 min-w-[18px] h-[18px] flex items-center justify-center animate-pulse-soft">
                    {totalItems}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left leading-tight">
                <span className="text-[10px] text-muted-foreground block">Giỏ hàng</span>
                <span className="text-xs font-bold text-coral">{totalItems > 0 ? formatPrice(totalPrice) : '(0)'}</span>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Category navigation bar - desktop */}
      <nav className="bg-card border-b border-border hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-1">
            <Link to="/" className="flex items-center gap-1.5 px-4 py-2.5 ocean-gradient text-primary-foreground text-sm font-bold rounded-t-lg">
              <Menu className="h-4 w-4" /> DANH MỤC
            </Link>
            {categories.map(cat => (
              <Link
                key={cat}
                to={`/?category=${encodeURIComponent(cat)}`}
                className="px-3 py-2.5 text-sm text-foreground hover:text-primary font-medium transition-colors relative group"
              >
                {cat}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-0.5 bg-primary transition-all duration-300" />
              </Link>
            ))}
            <Link
              to="/ve-chung-toi"
              className="px-3 py-2.5 text-sm text-foreground hover:text-primary font-medium transition-colors relative group"
            >
              Về chúng tôi
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-0.5 bg-primary transition-all duration-300" />
            </Link>
            <Link
              to="/blog"
              className="px-3 py-2.5 text-sm text-foreground hover:text-primary font-medium transition-colors relative group"
            >
              Ẩm thực
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 group-hover:w-full h-0.5 bg-primary transition-all duration-300" />
            </Link>
            <Link
              to="/?status=hot"
              className="px-3 py-2.5 text-sm text-coral font-bold flex items-center gap-1 animate-pulse-soft"
            >
              🔥 Bán chạy
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 top-0">
          <div className="absolute inset-0 bg-foreground/30" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-card shadow-2xl animate-slide-right overflow-y-auto">
            <div className="ocean-gradient p-4 flex items-center justify-between">
              <div>
                <p className="font-black text-primary-foreground">GIANG NGUYEN SEAFOOD</p>
                <p className="text-[10px] text-primary-foreground/80">Đặc sản biển Sầm Sơn</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-primary-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Mobile search */}
            <div className="p-3 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-muted/50 text-sm focus:outline-none focus:border-primary"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              {suggestions.length > 0 && (
                <div className="mt-2 space-y-1">
                  {suggestions.map(p => (
                    <button
                      key={p.id}
                      className="w-full px-3 py-2 text-left hover:bg-muted rounded-lg flex items-center gap-3 text-sm"
                      onClick={() => { navigate(`/product/${p.slug}`); setMobileMenuOpen(false); setSearchQuery(''); }}
                    >
                      <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded-lg" loading="lazy" width={40} height={40} />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium truncate block">{p.name}</span>
                        <span className="text-coral font-bold text-xs">{formatPrice(p.price)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile categories */}
            <div className="p-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Danh mục</p>
              {categories.map(cat => (
                <button
                  key={cat}
                  className="w-full text-left px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted rounded-lg transition-colors"
                  onClick={() => { navigate(`/?category=${encodeURIComponent(cat)}`); setMobileMenuOpen(false); }}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Mobile contact */}
            <div className="p-3 border-t border-border mt-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Liên hệ</p>
              <a href="tel:0123456789" className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-primary hover:bg-muted rounded-lg">
                <Phone className="h-4 w-4" /> 0123.456.789
              </a>
              <div className="px-3 py-2 text-xs text-muted-foreground">
                <p>📍 Sầm Sơn, Thanh Hóa</p>
                <p>🕐 7:00 – 21:00 hàng ngày</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
