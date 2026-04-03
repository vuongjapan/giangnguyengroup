import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Phone, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { products, formatPrice } from '@/data/products';

export default function Header() {
  const { totalItems, setIsOpen } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const suggestions = searchQuery.length > 0
    ? products.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 5)
    : [];

  return (
    <header className="sticky top-0 z-50 bg-card shadow-sm">
      {/* Top bar - like Camudo */}
      <div className="ocean-gradient py-1 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4 text-[10px] md:text-xs text-primary-foreground/90">
            <span>✅ SƠ CHẾ MIỄN PHÍ</span>
            <span className="hidden sm:inline">🚚 FREE SHIP TỪ 500K</span>
            <span className="hidden md:inline">⭐ CAM KẾT CHẤT LƯỢNG</span>
          </div>
          <a href="tel:0123456789" className="text-xs md:text-sm font-bold text-primary-foreground flex items-center gap-1">
            <Phone className="h-3 w-3" /> 0123.456.789
          </a>
        </div>
      </div>

      {/* Main header - matching Camudo layout */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-2.5 flex items-center gap-3">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <div className="leading-none">
              <span className="text-lg md:text-xl font-black text-primary tracking-tight">GIANG NGUYEN</span>
              <span className="text-lg md:text-xl font-black text-coral tracking-tight"> SEAFOOD</span>
            </div>
          </Link>

          {/* Search bar - like Camudo centered search */}
          <div className="hidden md:flex flex-1 max-w-lg relative mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Nhập từ khóa tìm kiếm"
                className="w-full pl-10 pr-4 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-primary"
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              />
            </div>
            {showSuggestions && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-xl border border-border overflow-hidden z-50">
                {suggestions.map(p => (
                  <button
                    key={p.id}
                    className="w-full px-3 py-2 text-left hover:bg-ocean-light/50 flex items-center gap-3 text-sm border-b border-border last:border-0"
                    onMouseDown={() => { navigate(`/product/${p.slug}`); setSearchQuery(''); }}
                  >
                    <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded" loading="lazy" width={40} height={40} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-sm truncate">{p.name}</p>
                      <p className="text-coral font-bold text-xs">{formatPrice(p.price)}/{p.unit}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Cart - like Camudo */}
            <button
              onClick={() => setIsOpen(true)}
              className="relative flex items-center gap-1.5 px-3 py-1.5 rounded hover:bg-muted transition-colors"
            >
              <ShoppingCart className="h-5 w-5 text-foreground" />
              <div className="hidden sm:block text-left leading-tight">
                <span className="text-[10px] text-muted-foreground block">Giỏ hàng</span>
                <span className="text-xs font-bold text-foreground">({totalItems})</span>
              </div>
              {totalItems > 0 && (
                <span className="absolute -top-0.5 left-5 sm:hidden bg-coral text-primary-foreground text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </button>

            <button className="md:hidden p-2 hover:bg-muted rounded" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile search dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border p-3 bg-card animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              className="w-full pl-10 pr-4 py-2 rounded border border-border bg-background text-sm focus:outline-none focus:border-primary"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {suggestions.length > 0 && (
            <div className="mt-2 space-y-1">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  className="w-full px-3 py-2 text-left hover:bg-muted rounded flex items-center gap-3 text-sm"
                  onClick={() => { navigate(`/product/${p.slug}`); setMobileMenuOpen(false); setSearchQuery(''); }}
                >
                  <img src={p.images[0]} alt={p.name} className="w-8 h-8 object-cover rounded" loading="lazy" width={32} height={32} />
                  <span className="font-medium truncate">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
