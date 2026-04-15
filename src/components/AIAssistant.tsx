import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { X, ShoppingCart, ChevronRight, Sparkles } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/data/products';

interface Suggestion {
  message: string;
  products?: { id: string; name: string; slug: string; price: number; unit: string; image: string }[];
  actions?: { label: string; action: () => void }[];
}

const COOLDOWN = 25000; // 25s between suggestions
const AVATAR_URL = '/images/logo-giang-nguyen-group.jpg';

export default function AIAssistant() {
  const [visible, setVisible] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [lastShown, setLastShown] = useState(0);
  const { products } = useProducts();
  const { addItem, totalItems } = useCart();
  const location = useLocation();

  const showSuggestion = useCallback((s: Suggestion) => {
    if (dismissed || Date.now() - lastShown < COOLDOWN) return;
    setSuggestion(s);
    setVisible(true);
    setLastShown(Date.now());
  }, [dismissed, lastShown]);

  // Welcome message on homepage
  useEffect(() => {
    if (location.pathname !== '/' || dismissed) return;
    const timer = setTimeout(() => {
      const combos = products.filter(p => p.badges?.includes('hot'));
      showSuggestion({
        message: 'Chào bạn 👋 Hôm nay bên mình có hải sản khô đang bán rất chạy!',
        products: combos.slice(0, 2).map(p => ({
          id: p.id, name: p.name, slug: p.slug, price: p.price, unit: p.unit, image: p.images[0]
        })),
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, [location.pathname, products, dismissed]);

  // Product page suggestion
  useEffect(() => {
    const match = location.pathname.match(/^\/product\/(.+)/);
    if (!match || dismissed) return;
    const slug = match[1];
    const timer = setTimeout(() => {
      const current = products.find(p => p.slug === slug);
      if (!current) return;
      const related = products
        .filter(p => p.id !== current.id && p.category === current.category)
        .slice(0, 2);
      if (related.length === 0) return;
      showSuggestion({
        message: `🔥 "${current.name}" đang bán rất chạy! Xem thêm sản phẩm cùng loại:`,
        products: related.map(p => ({
          id: p.id, name: p.name, slug: p.slug, price: p.price, unit: p.unit, image: p.images[0]
        })),
      });
    }, 4000);
    return () => clearTimeout(timer);
  }, [location.pathname, products, dismissed]);

  // Cart upsell
  useEffect(() => {
    if (location.pathname !== '/checkout' || dismissed || totalItems === 0) return;
    const timer = setTimeout(() => {
      const hotProducts = products.filter(p => p.badges?.includes('hot')).slice(0, 2);
      if (hotProducts.length === 0) return;
      showSuggestion({
        message: '💡 Thêm 1 sản phẩm nữa để được giá combo tốt hơn!',
        products: hotProducts.map(p => ({
          id: p.id, name: p.name, slug: p.slug, price: p.price, unit: p.unit, image: p.images[0]
        })),
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [location.pathname, totalItems, products, dismissed]);

  // Idle suggestion
  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => {
      if (visible) return;
      showSuggestion({
        message: 'Bạn cần mình tư vấn loại hải sản phù hợp không? 🦐',
      });
    }, 15000);
    return () => clearTimeout(timer);
  }, [location.pathname, dismissed, visible]);

  const handleAddToCart = (product: { id: string; name: string; price: number; unit: string; image: string }) => {
    addItem({ id: product.id, name: product.name, price: product.price, unit: product.unit, image: product.image, quantity: 1 });
    setVisible(false);
  };

  const handleDismiss = () => {
    setVisible(false);
    setDismissed(true);
  };

  if (!visible || !suggestion) return (
    dismissed ? null : (
      <button
        onClick={() => setDismissed(false)}
        className="fixed bottom-32 md:bottom-24 left-4 z-30 w-12 h-12 rounded-full shadow-lg overflow-hidden border-2 border-primary/30 hover:border-primary transition-all hover:scale-110 animate-bounce-soft"
        title="AI Tư vấn"
      >
        <img src={AVATAR_URL} alt="AI Assistant" className="w-full h-full object-cover" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      </button>
    )
  );

  return (
    <div className="fixed bottom-32 md:bottom-24 left-4 z-30 animate-scale-in">
      <div className="flex items-end gap-2 max-w-xs">
        {/* Avatar */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-md">
          <img src={AVATAR_URL} alt="AI" className="w-full h-full object-cover" />
        </div>

        {/* Bubble */}
        <div className="bg-white rounded-2xl rounded-bl-md shadow-xl border border-gray-100 p-3 max-w-[280px] relative">
          <button onClick={handleDismiss} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600">
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-1 mb-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-bold text-primary">AI Tư vấn</span>
          </div>

          <p className="text-sm text-gray-700 leading-relaxed pr-4">{suggestion.message}</p>

          {suggestion.products && suggestion.products.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {suggestion.products.map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-1.5">
                  <img src={p.image} alt={p.name} className="w-10 h-10 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                    <p className="text-xs font-bold text-coral">{formatPrice(p.price)}/{p.unit}</p>
                  </div>
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="flex-shrink-0 p-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    title="Thêm vào giỏ"
                  >
                    <ShoppingCart className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <a
                href="/san-pham"
                className="flex items-center justify-center gap-1 text-xs text-primary font-bold py-1 hover:underline"
              >
                Xem tất cả <ChevronRight className="h-3 w-3" />
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
