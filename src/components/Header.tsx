import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Phone, Menu, X, MapPin, Clock, ChevronDown, ChevronRight, User, Gift, BookOpen, ShieldCheck, Package, Tag, Newspaper, UtensilsCrossed, Hotel, Store, MessageCircle, Mail } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { formatPrice, categories } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import { useSiteContent } from '@/hooks/useSiteContent';

const DEFAULT_TICKER = [
  '🔥 FLASH SALE hải sản khô Sầm Sơn – Giảm 10% đơn đầu tiên',
  '🚚 FREE SHIP toàn quốc đơn từ 1500K',
  '⭐ Cam kết 100% hải sản sạch, hoàn tiền nếu không hài lòng',
  '🎁 Mua 2 tặng 1 Nem chua Thanh Hóa',
];

const BEST_SELLERS = [
  { name: 'Mực khô loại 1', slug: 'muc-kho-loai-1' },
  { name: 'Cá chỉ vàng', slug: 'ca-chi-vang' },
  { name: 'Mực 1 nắng', slug: 'muc-1-nang' },
];

const LEFT_MENU = [
  { label: 'SẢN PHẨM', to: '/san-pham', icon: Package, hasDropdown: true },
  { label: 'COMBO QUÀ BIẾU', to: '/combo', icon: Gift },
  { label: 'KHUYẾN MÃI', to: '/khuyen-mai', icon: Tag },
  { label: 'MÓN NGON', to: '/mon-ngon', icon: UtensilsCrossed },
  { label: 'TIN TỨC', to: '/tin-tuc', icon: Newspaper },
];

const RIGHT_MENU = [
  { label: 'BLOG', to: '/blog', icon: BookOpen },
  { label: 'GIỚI THIỆU', to: '/gioi-thieu', icon: BookOpen },
  { label: 'CỬA HÀNG', to: '/he-thong-cua-hang', icon: Store },
  { label: 'CHÍNH SÁCH', to: '/chinh-sach', icon: ShieldCheck },
  { label: 'KHÁCH SẠN', to: '/khach-san', icon: Hotel },
];

const ALL_MENU = [...LEFT_MENU, ...RIGHT_MENU];

export default function Header() {
  const { totalItems, totalPrice, setIsOpen } = useCart();
  const { user } = useAuth();
  const { products } = useProducts();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showProductDropdown, setShowProductDropdown] = useState(false);
  const [mobileProductExpanded, setMobileProductExpanded] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { data: tickerItems } = useSiteContent<string[]>('ticker_banner', DEFAULT_TICKER);
  const { data: logoUrl } = useSiteContent<string>('site_logo', '/images/logo-giang-nguyen-group.jpg');

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

  const renderMenuItem = (item: typeof LEFT_MENU[0] & { hasDropdown?: boolean }, showDropdown = false) => (
    <div
      key={item.to}
      className="relative"
      onMouseEnter={() => item.hasDropdown && setShowProductDropdown(true)}
      onMouseLeave={() => item.hasDropdown && setShowProductDropdown(false)}
    >
      <Link
        to={item.to}
        className={`flex items-center gap-1 px-2.5 py-2.5 text-[11px] font-bold transition-colors relative group whitespace-nowrap ${
          isActive(item.to) ? 'text-primary' : 'text-gray-700 hover:text-primary'
        }`}
      >
        {item.label}
        {item.hasDropdown && <ChevronDown className="h-3 w-3" />}
        <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary transition-all duration-300 ${
          isActive(item.to) ? 'w-full' : 'w-0 group-hover:w-full'
        }`} />
      </Link>

      {item.hasDropdown && showProductDropdown && (
        <div className="absolute top-full left-0 w-72 bg-white rounded-b-xl shadow-2xl border border-gray-100 border-t-2 border-t-primary z-50">
          <div className="p-2">
            <p className="px-3 py-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Danh mục</p>
            {categories.map(cat => (
              <Link key={cat} to={`/san-pham?category=${encodeURIComponent(cat)}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary font-medium rounded-lg transition-colors">
                <ChevronRight className="h-3 w-3 text-gray-400" />{cat}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 p-2">
            <p className="px-3 py-1.5 text-[10px] font-bold text-coral uppercase tracking-wider">Bán chạy</p>
            {BEST_SELLERS.map(bs => (
              <Link key={bs.slug} to={`/product/${bs.slug}`}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-coral font-medium rounded-lg transition-colors">
                <span className="text-coral">→</span>{bs.name}
              </Link>
            ))}
          </div>
          <div className="border-t border-gray-100 p-2">
            <Link to="/san-pham" className="block text-center px-3 py-2 text-sm font-bold text-primary hover:bg-primary/10 rounded-lg transition-colors">
              Xem tất cả sản phẩm →
            </Link>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <header className="sticky top-0 z-50">
      {/* Promo ticker bar */}
      <div className="bg-coral text-primary-foreground py-1 overflow-hidden">
        <div className="promo-ticker">
          <div className="promo-ticker-content text-xs font-medium">
            {(tickerItems || DEFAULT_TICKER).map((t, i) => (
              <span key={i}>{t} &nbsp;&nbsp;|&nbsp;&nbsp;</span>
            ))}
            {(tickerItems || DEFAULT_TICKER).map((t, i) => (
              <span key={`dup-${i}`}>{t} &nbsp;&nbsp;|&nbsp;&nbsp;</span>
            ))}
          </div>
        </div>
      </div>

      {/* Company name bar */}
      <div className={`bg-white text-center transition-all duration-300 overflow-hidden ${scrolled ? 'max-h-0 py-0' : 'max-h-16 py-1.5'}`}>
        <p className="text-xs md:text-sm font-bold text-[#444] tracking-wider leading-tight">
          CÔNG TY TNHH GIANG NGUYÊN GROUP
        </p>
        <p className="text-[9px] md:text-[11px] text-[#777] tracking-widest leading-tight">
          Hải sản khô – Hải sản một nắng
        </p>
      </div>

      {/* Top info bar - desktop only */}
      <div className="ocean-gradient py-1.5 px-4 hidden md:block">
        <div className="container mx-auto flex items-center justify-between text-[11px] text-primary-foreground/90">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Sầm Sơn, Thanh Hóa</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> 7:00 – 17:00 hàng ngày</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="tel:0933562286" className="font-bold text-primary-foreground flex items-center gap-1 hover:underline">
              <Phone className="h-3 w-3" /> Hotline: 0933.562.286
            </a>
            <a href="https://zalo.me/0933562286" target="_blank" rel="noopener noreferrer" className="font-bold text-primary-foreground flex items-center gap-1 hover:underline">
              <MessageCircle className="h-3 w-3" /> Zalo: 0933.562.286
            </a>
            <a href="mailto:giangnguyendriedseafood@gmail.com" className="text-primary-foreground flex items-center gap-1 hover:underline">
              <Mail className="h-3 w-3" /> giangnguyendriedseafood@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* ===== MAIN HEADER - Desktop: Search/Account on sides ===== */}
      <div className={`bg-white border-b border-gray-100 transition-all duration-300 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
        <div className="container mx-auto px-4">
          {/* Desktop header */}
          <div className="hidden md:flex items-center justify-between py-1.5">
            {/* Left: Search */}
            <div className="flex items-center gap-3">
              <div className="relative w-52 lg:w-64">
                <input
                  type="text"
                  placeholder="Tìm sản phẩm..."
                  className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-primary focus:bg-white transition-colors"
                  value={searchQuery}
                  onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 overflow-hidden z-50">
                    {suggestions.map(p => (
                      <button key={p.id} className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center gap-3 text-sm border-b border-gray-50 last:border-0 transition-colors"
                        onMouseDown={() => { navigate(`/product/${p.slug}`); setSearchQuery(''); }}>
                        <img src={p.images[0]} alt={p.name} className="w-12 h-12 object-cover rounded-lg" loading="lazy" width={48} height={48} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-gray-800 text-sm truncate">{p.name}</p>
                          <p className="text-coral font-bold text-xs">{formatPrice(p.price)}/{p.unit}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Account + Phone + Cart */}
            <div className="flex items-center gap-2">
              <Link to={user ? '/account' : '/auth'} className="flex items-center gap-1.5 p-2 hover:bg-gray-50 rounded-lg transition-colors" title={user ? 'Tài khoản' : 'Đăng nhập'}>
                <User className="h-5 w-5 text-gray-600" />
                <span className="hidden lg:inline text-xs text-gray-600 font-medium">{user ? 'Tài khoản' : 'Đăng nhập'}</span>
              </Link>
              <a href="tel:0933562286" className="flex items-center gap-1.5 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <Phone className="h-5 w-5 text-primary" />
                <span className="hidden lg:inline text-xs text-primary font-bold">0933.562.286</span>
              </a>
              <button onClick={() => setIsOpen(true)} className="relative flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 text-gray-600 group-hover:text-primary transition-colors" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-coral text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse-soft">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden lg:block text-left leading-tight">
                  <span className="text-[10px] text-gray-500 block">Giỏ hàng</span>
                  <span className="text-xs font-bold text-coral">{totalItems > 0 ? formatPrice(totalPrice) : '(0)'}</span>
                </div>
              </button>
            </div>
          </div>

          {/* Mobile header: [Menu]  [Logo center]  [Cart] */}
          <div className="md:hidden flex items-center justify-between py-2">
            <button className="p-2 hover:bg-gray-50 rounded-lg" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5 text-gray-700" /> : <Menu className="h-5 w-5 text-gray-700" />}
            </button>
            <Link to="/" className="flex flex-col items-center flex-1 min-w-0">
              <img
                src={logoUrl || '/images/logo-giang-nguyen-group.jpg'}
                alt="Giang Nguyên Group"
                className={`rounded-lg transition-all duration-300 ${scrolled ? 'h-10' : 'h-14'}`}
                loading="eager"
              />
            </Link>
            <button onClick={() => setIsOpen(true)} className="relative p-2 hover:bg-gray-50 rounded-lg">
              <ShoppingCart className="h-5 w-5 text-gray-600" />
              {totalItems > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-coral text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center animate-pulse-soft">
                  {totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Desktop navigation bar with LOGO IN CENTER */}
      <nav className="bg-white border-b border-gray-100 hidden md:block">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center">
            {/* Left menu items */}
            <div className="flex items-center justify-end flex-1">
              {LEFT_MENU.map(item => renderMenuItem(item, true))}
            </div>

            {/* Center: Logo */}
            <Link to="/" className="flex-shrink-0 mx-4">
              <img
                src={logoUrl || '/images/logo-giang-nguyen-group.jpg'}
                alt="Giang Nguyên Group"
                className={`rounded-lg transition-all duration-300 ${scrolled ? 'h-12' : 'h-16 lg:h-20'}`}
                loading="eager"
              />
            </Link>

            {/* Right menu items */}
            <div className="flex items-center justify-start flex-1">
              {RIGHT_MENU.map(item => renderMenuItem(item))}
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile slide-out menu */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 top-0">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setMobileMenuOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-80 bg-white shadow-2xl animate-slide-right overflow-y-auto">
            <div className="ocean-gradient p-4 flex items-center justify-between">
              <div>
                <p className="text-[10px] text-primary-foreground/80 font-bold">CÔNG TY TNHH</p>
                <p className="font-black text-primary-foreground">GIANG NGUYÊN GROUP</p>
                <p className="text-[9px] text-primary-foreground/70">Hải sản khô – Hải sản một nắng</p>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} className="text-primary-foreground p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-3 border-b border-gray-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input type="text" placeholder="Tìm sản phẩm..." className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg text-sm bg-gray-50 focus:bg-white focus:border-primary focus:outline-none"
                  value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
              </div>
            </div>

            <div className="py-2">
              {ALL_MENU.map(item => (
                <div key={item.to}>
                  {item.hasDropdown ? (
                    <>
                      <button onClick={() => setMobileProductExpanded(!mobileProductExpanded)}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm font-bold transition-colors ${isActive(item.to) ? 'text-primary bg-primary/5' : 'text-gray-800 hover:bg-gray-50'}`}>
                        <span className="flex items-center gap-2"><item.icon className="h-4 w-4" /> {item.label}</span>
                        {mobileProductExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                      {mobileProductExpanded && (
                        <div className="bg-gray-50 border-y border-gray-100">
                          <Link to="/san-pham" className="block px-8 py-2.5 text-sm text-primary font-bold hover:bg-gray-100" onClick={() => setMobileMenuOpen(false)}>
                            Tất cả sản phẩm
                          </Link>
                          {categories.map(cat => (
                            <Link key={cat} to={`/san-pham?category=${encodeURIComponent(cat)}`}
                              className="block px-8 py-2.5 text-sm text-gray-700 hover:bg-gray-100 hover:text-primary" onClick={() => setMobileMenuOpen(false)}>
                              {cat}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link to={item.to}
                      className={`flex items-center gap-2 px-4 py-3 text-sm font-bold transition-colors ${isActive(item.to) ? 'text-primary bg-primary/5' : 'text-gray-800 hover:bg-gray-50'}`}
                      onClick={() => setMobileMenuOpen(false)}>
                      <item.icon className="h-4 w-4" /> {item.label}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-gray-100 p-4 space-y-3">
              <Link to={user ? '/account' : '/auth'} onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 bg-primary/5 rounded-xl text-sm font-bold text-primary">
                <User className="h-5 w-5" /> {user ? 'Tài khoản' : 'Đăng nhập / Đăng ký'}
              </Link>
              <a href="tel:0933562286" className="flex items-center gap-3 px-4 py-3 bg-coral/10 rounded-xl text-sm font-bold text-coral">
                <Phone className="h-5 w-5" /> 0933.562.286
              </a>
              <a href="https://zalo.me/0933562286" target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 bg-blue-50 rounded-xl text-sm font-bold text-blue-600">
                <MessageCircle className="h-5 w-5" /> Zalo: 0933.562.286
              </a>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
