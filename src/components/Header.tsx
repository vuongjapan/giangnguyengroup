import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Phone, Menu, X, MapPin, Clock, ChevronDown, ChevronRight, User, Gift, BookOpen, ShieldCheck, Package, Tag, Newspaper, UtensilsCrossed, Hotel, Store, MessageCircle, Mail } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { products, formatPrice, categories } from '@/data/products';

const BEST_SELLERS = [
  { name: 'Mực khô loại 1', slug: 'muc-kho-loai-1' },
  { name: 'Cá chỉ vàng', slug: 'ca-chi-vang' },
  { name: 'Mực 1 nắng', slug: 'muc-1-nang' },
];

const MAIN_MENU = [
  { label: 'SẢN PHẨM', to: '/san-pham', icon: Package, hasDropdown: true },
  { label: 'COMBO QUÀ BIẾU', to: '/combo', icon: Gift },
  { label: 'KHUYẾN MÃI', to: '/khuyen-mai', icon: Tag },
  { label: 'MÓN NGON', to: '/mon-ngon', icon: UtensilsCrossed },
  { label: 'TIN TỨC', to: '/tin-tuc', icon: Newspaper },
  { label: 'BLOG', to: '/blog', icon: BookOpen },
  { label: 'GIỚI THIỆU', to: '/gioi-thieu', icon: BookOpen },
  { label: 'HỆ THỐNG CỬA HÀNG', to: '/he-thong-cua-hang', icon: Store },
  { label: 'CHÍNH SÁCH', to: '/chinh-sach', icon: ShieldCheck },
  { label: 'KHÁCH SẠN LIÊN KẾT', to: '/khach-san', icon: Hotel },
];

export default function Header() {
  const { totalItems, totalPrice, setIsOpen } = useCart();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [mobileProductExpanded, setMobileProductExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const suggestions = searchQuery.length > 0
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  const isActive = (path: string) => location.pathname === path;

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
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 7:00 – 17:00 hàng ngày</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:0986617939" className="font-bold text-primary-foreground flex items-center gap-1 hover:underline">
              <Phone className="h-3 w-3" /> Hotline: 098.661.7939
            </a>
            <a href="https://zalo.me/0986617939" target="_blank" rel="noopener noreferrer" className="font-bold text-primary-foreground flex items-center gap-1 hover:underline">
              <MessageCircle className="h-3 w-3" /> Zalo: 098.661.7939
            </a>
            <a href="mailto:giangnguyendriedseafood@gmail.com" className="text-primary-foreground flex items-center gap-1 hover:underline">
              <Mail className="h-3 w-3" /> giangnguyendriedseafood@gmail.com
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
            <Link
              to={user ? '/account' : '/auth'}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title={user ? 'Tài khoản' : 'Đăng nhập'}
            >
              <User className="h-5 w-5 text-foreground hover:text-primary transition-colors" />
            </Link>
            <a href="tel:0986617939" className="md:hidden p-2 hover:bg-muted rounded-lg">
              <Phone className="h-5 w-5 text-primary" />
            </a>
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5 text-foreground group-hover:text-primary transition-colors" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-coral text-primary-foreground text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse-soft">
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

      {/* Main navigation bar - desktop */}
      <nav className="bg-card border-b border-border hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center flex-wrap">
            {MAIN_MENU.map(item => (
              <div
                key={item.to}
                className="relative"
                onMouseEnter={() => item.hasDropdown && setShowProductDropdown(true)}
                onMouseLeave={() => item.hasDropdown && setShowProductDropdown(false)}
              >
                <Link
                  to={item.to}
                  className={`flex items-center gap-1 px-3 py-2.5 text-sm font-bold transition-colors relative group whitespace-nowrap ${
                    isActive(item.to) ? 'text-primary' : 'text-foreground hover:text-primary'
                  }`}
                >
                  {item.label}
                  {item.hasDropdown && <ChevronDown className="h-3 w-3" />}
                  <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${
                    isActive(item.to) ? 'w-full' : 'w-0 group-hover:w-full'
                  }`} />
                </Link>

                {/* Product mega dropdown */}
                {item.hasDropdown && showProductDropdown && (
                  <div className="absolute top-full left-0 w-72 bg-card rounded-b-xl shadow-2xl border border-border border-t-2 border-t-primary z-50">
                    {/* Categories */}
                    <div className="p-2">
                      <p className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Danh mục</p>
                      {categories.map(cat => (
                        <Link
                          key={cat}
                          to={`/san-pham?category=${encodeURIComponent(cat)}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-primary font-medium rounded-lg transition-colors"
                        >
                          <ChevronRight className="h-3 w-3 text-muted-foreground" />
                          {cat}
                        </Link>
                      ))}
                    </div>
                    {/* Best sellers */}
                    <div className="border-t border-border p-2">
                      <p className="px-3 py-1.5 text-[10px] font-bold text-coral uppercase tracking-wider">🔥 Bán chạy</p>
                      {BEST_SELLERS.map(bs => (
                        <Link
                          key={bs.slug}
                          to={`/product/${bs.slug}`}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-coral font-medium rounded-lg transition-colors"
                        >
                          <span className="text-coral">→</span>
                          {bs.name}
                        </Link>
                      ))}
                    </div>
                    {/* View all */}
                    <div className="border-t border-border p-2">
                      <Link
                        to="/san-pham"
                        className="block text-center px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors"
                      >
                        Xem tất cả sản phẩm →
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
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
                      onClick={() => { navigate(`/product/${p.slug}`); setSearchQuery(''); }}
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

            {/* Mobile main menu */}
            <div className="p-3">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Menu chính</p>
              {MAIN_MENU.map(item => (
                <div key={item.to}>
                  {item.hasDropdown ? (
                    <>
                      <button
                        className={`w-full flex items-center justify-between px-3 py-3 text-sm font-bold rounded-lg transition-colors ${
                          isActive(item.to) ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                        }`}
                        onClick={() => setMobileProductExpanded(!mobileProductExpanded)}
                      >
                        <span className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </span>
                        <ChevronDown className={`h-4 w-4 transition-transform ${mobileProductExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {mobileProductExpanded && (
                        <div className="ml-4 border-l-2 border-primary/20 pl-3 mb-2">
                          <Link
                            to="/san-pham"
                            className="block px-3 py-2 text-sm font-bold text-primary hover:bg-muted rounded-lg"
                          >
                            Tất cả sản phẩm
                          </Link>
                          {categories.map(cat => (
                            <Link
                              key={cat}
                              to={`/san-pham?category=${encodeURIComponent(cat)}`}
                              className="block px-3 py-2 text-sm font-medium text-foreground hover:bg-muted rounded-lg"
                            >
                              {cat}
                            </Link>
                          ))}
                          <p className="px-3 pt-2 pb-1 text-[10px] font-bold text-coral uppercase">🔥 Bán chạy</p>
                          {BEST_SELLERS.map(bs => (
                            <Link
                              key={bs.slug}
                              to={`/product/${bs.slug}`}
                              className="block px-3 py-2 text-sm font-medium text-coral hover:bg-muted rounded-lg"
                            >
                              {bs.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={item.to}
                      className={`w-full flex items-center gap-3 px-3 py-3 text-sm font-bold rounded-lg transition-colors ${
                        isActive(item.to) ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <item.icon className="h-4 w-4" />
                      {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Mobile account */}
            <div className="p-3 border-t border-border">
              <Link
                to={user ? '/account' : '/auth'}
                className="w-full flex items-center gap-3 px-3 py-3 text-sm font-bold text-primary rounded-lg hover:bg-muted"
              >
                <User className="h-4 w-4" />
                {user ? 'TÀI KHOẢN CỦA TÔI' : 'ĐĂNG NHẬP / ĐĂNG KÝ'}
              </Link>
            </div>

            {/* Mobile contact */}
            <div className="p-3 border-t border-border">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Liên hệ</p>
              <a href="tel:0986617939" className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-primary hover:bg-muted rounded-lg">
                <Phone className="h-4 w-4" /> 098.661.7939
              </a>
              <a href="https://zalo.me/0986617939" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-2.5 text-sm font-bold text-primary hover:bg-muted rounded-lg">
                <MessageCircle className="h-4 w-4" /> Zalo: 098.661.7939
              </a>
              <a href="mailto:giangnguyendriedseafood@gmail.com" className="flex items-center gap-2 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg">
                <Mail className="h-4 w-4" /> giangnguyendriedseafood@gmail.com
              </a>
              <div className="px-3 py-2 text-xs text-muted-foreground">
                <p>📍 Sầm Sơn, Thanh Hóa</p>
                <p>🕐 7:00 – 17:00 hàng ngày</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
