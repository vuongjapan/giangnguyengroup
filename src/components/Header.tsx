import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingCart, Phone, Menu, X } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { products } from '@/data/products';

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
    <header className="sticky top-0 z-50 bg-card shadow-sm border-b border-border">
      <div className="ocean-gradient py-1.5 px-4 text-center">
        <p className="text-sm font-medium text-primary-foreground">
          🎁 Miễn phí ship đơn từ 500k | Hotline: <a href="tel:0123456789" className="underline font-bold">0123.456.789</a>
        </p>
      </div>

      <div className="container mx-auto px-4 py-3 flex items-center gap-4">
        <Link to="/" className="flex-shrink-0">
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight">
            <span className="text-primary">GIANG NGUYEN</span>
            <span className="text-accent"> SEAFOOD</span>
          </h1>
        </Link>

        <div className="hidden md:flex flex-1 max-w-xl relative mx-4">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm mực khô, cá thu, nem chua..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            />
          </div>
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-card rounded-lg shadow-lg border border-border overflow-hidden z-50">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  className="w-full px-4 py-2.5 text-left hover:bg-muted flex items-center gap-3 text-sm"
                  onMouseDown={() => { navigate(`/product/${p.slug}`); setSearchQuery(''); }}
                >
                  <img src={p.images[0]} alt={p.name} className="w-10 h-10 object-cover rounded" loading="lazy" width={40} height={40} />
                  <div>
                    <p className="font-medium text-foreground">{p.name}</p>
                    <p className="text-primary font-bold">{new Intl.NumberFormat('vi-VN').format(p.price)}₫/{p.unit}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          <a href="tel:0123456789" className="hidden md:flex items-center gap-1.5 text-sm font-semibold text-primary hover:text-primary/80">
            <Phone className="h-4 w-4" />
            0123.456.789
          </a>

          <button
            onClick={() => setIsOpen(true)}
            className="relative p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ShoppingCart className="h-5 w-5 text-foreground" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-coral text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {totalItems}
              </span>
            )}
          </button>

          <button className="md:hidden p-2" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border p-4 space-y-3 bg-card animate-fade-in">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm sản phẩm..."
              className="w-full pl-10 pr-4 py-2.5 rounded-full border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          {suggestions.length > 0 && (
            <div className="space-y-1">
              {suggestions.map(p => (
                <button
                  key={p.id}
                  className="w-full px-3 py-2 text-left hover:bg-muted rounded-lg flex items-center gap-3 text-sm"
                  onClick={() => { navigate(`/product/${p.slug}`); setMobileMenuOpen(false); setSearchQuery(''); }}
                >
                  <img src={p.images[0]} alt={p.name} className="w-8 h-8 object-cover rounded" loading="lazy" width={32} height={32} />
                  <span className="font-medium">{p.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </header>
  );
}
