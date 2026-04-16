import { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { X, ShoppingCart, ChevronRight, Sparkles, Tag, Flame, Clock } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { formatPrice } from '@/data/products';
import { supabase } from '@/integrations/supabase/client';

interface SuggestionProduct {
  id: string; name: string; slug: string; price: number; unit: string; image: string;
  originalPrice?: number; isCombo?: boolean;
}

interface Suggestion {
  message: string;
  icon?: 'fire' | 'tag' | 'clock' | 'sparkle';
  products?: SuggestionProduct[];
}

interface Combo {
  id: string; name: string; slug: string; combo_price: number; original_price: number;
  image: string; tag: string; is_active: boolean;
}

const DEFAULT_COOLDOWN = 20000;
const DEFAULT_AVATAR = '/images/logo-giang-nguyen-group.jpg';

interface AIConfig {
  enabled: boolean; avatar_url: string; cooldown: number;
  welcome_message: string; product_message: string; idle_message: string;
  cart_message: string; combo_message: string;
}

export default function AIAssistant() {
  const [visible, setVisible] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [dismissed, setDismissed] = useState(false);
  const [lastShown, setLastShown] = useState(0);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [aiConfig, setAiConfig] = useState<AIConfig | null>(null);
  const { products } = useProducts();
  const { addItem, totalItems } = useCart();
  const { viewed } = useRecentlyViewed();
  const location = useLocation();

  // Fetch combos & config
  useEffect(() => {
    supabase.from('combos').select('id,name,slug,combo_price,original_price,image,tag,is_active')
      .eq('is_active', true).order('sort_order').then(({ data }) => { if (data) setCombos(data); });
    supabase.from('site_settings').select('value').eq('key', 'ai_assistant_config').maybeSingle()
      .then(({ data }) => { if (data?.value) setAiConfig(data.value as any); });
  }, []);

  const cooldown = (aiConfig?.cooldown || 20) * 1000;
  const avatarUrl = aiConfig?.avatar_url || DEFAULT_AVATAR;
  const isEnabled = aiConfig?.enabled !== false;

  const showSuggestion = useCallback((s: Suggestion) => {
    if (dismissed || !isEnabled || Date.now() - lastShown < cooldown) return;
    setSuggestion(s);
    setVisible(true);
    setLastShown(Date.now());
  }, [dismissed, lastShown, isEnabled, cooldown]);

  // Smart suggestion based on recently viewed
  const recentlyViewedSuggestion = useMemo((): Suggestion | null => {
    if (viewed.length < 2) return null;
    const recentProducts = viewed.slice(0, 3);
    return {
      message: `Bạn đã xem ${recentProducts.length} sản phẩm gần đây. Xem lại nhé! 👀`,
      icon: 'clock',
      products: recentProducts.map(p => ({
        id: p.id, name: p.name, slug: p.slug, price: p.price, unit: 'kg', image: p.image,
      })),
    };
  }, [viewed]);

  // Combo suggestion
  const comboSuggestion = useMemo((): Suggestion | null => {
    if (combos.length === 0) return null;
    const bestCombos = combos.slice(0, 2);
    const savings = bestCombos[0] ? bestCombos[0].original_price - bestCombos[0].combo_price : 0;
    return {
      message: `🎁 Combo tiết kiệm đến ${formatPrice(savings)}! Mua combo lợi hơn mua lẻ:`,
      icon: 'tag',
      products: bestCombos.map(c => ({
        id: c.id, name: c.name, slug: c.slug, price: c.combo_price, unit: 'combo',
        image: c.image, originalPrice: c.original_price, isCombo: true,
      })),
    };
  }, [combos]);

  // Welcome — prioritize combo or hot products
  useEffect(() => {
    if (location.pathname !== '/' || dismissed) return;
    const timer = setTimeout(() => {
      if (comboSuggestion) {
        showSuggestion(comboSuggestion);
      } else {
        const hot = products.filter(p => p.badges?.includes('hot')).slice(0, 2);
        showSuggestion({
          message: 'Chào bạn 👋 Hôm nay bên mình có hải sản khô đang bán rất chạy!',
          icon: 'fire',
          products: hot.map(p => ({
            id: p.id, name: p.name, slug: p.slug, price: p.price, unit: p.unit, image: p.images[0],
          })),
        });
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [location.pathname, products, dismissed, comboSuggestion]);

  // Product page — smart related + combo upsell
  useEffect(() => {
    const match = location.pathname.match(/^\/product\/(.+)/);
    if (!match || dismissed) return;
    const slug = match[1];
    const timer = setTimeout(() => {
      const current = products.find(p => p.slug === slug);
      if (!current) return;

      // Check if any combo contains this product
      const matchingCombo = combos.find(c => {
        // Try to find combo related to current product category
        return c.tag?.toLowerCase().includes(current.category?.toLowerCase() || '');
      });

      if (matchingCombo) {
        const saving = matchingCombo.original_price - matchingCombo.combo_price;
        showSuggestion({
          message: `💰 Mua combo "${matchingCombo.name}" tiết kiệm ${formatPrice(saving)}!`,
          icon: 'tag',
          products: [{
            id: matchingCombo.id, name: matchingCombo.name, slug: matchingCombo.slug,
            price: matchingCombo.combo_price, unit: 'combo', image: matchingCombo.image,
            originalPrice: matchingCombo.original_price, isCombo: true,
          }],
        });
      } else {
        const related = products
          .filter(p => p.id !== current.id && p.category === current.category)
          .slice(0, 2);
        if (related.length === 0) return;
        showSuggestion({
          message: `🔥 "${current.name}" đang bán chạy! Xem thêm:`,
          icon: 'fire',
          products: related.map(p => ({
            id: p.id, name: p.name, slug: p.slug, price: p.price, unit: p.unit, image: p.images[0],
          })),
        });
      }
    }, 4000);
    return () => clearTimeout(timer);
  }, [location.pathname, products, combos, dismissed]);

  // Cart upsell — suggest combo for better value
  useEffect(() => {
    if (location.pathname !== '/checkout' || dismissed || totalItems === 0) return;
    const timer = setTimeout(() => {
      if (comboSuggestion) {
        showSuggestion({
          ...comboSuggestion,
          message: '💡 Thêm combo để được giá tốt hơn! Tiết kiệm hơn mua lẻ:',
        });
      }
    }, 3000);
    return () => clearTimeout(timer);
  }, [location.pathname, totalItems, comboSuggestion, dismissed]);

  // Idle — show recently viewed or general suggestion
  useEffect(() => {
    if (dismissed) return;
    const timer = setTimeout(() => {
      if (visible) return;
      if (recentlyViewedSuggestion) {
        showSuggestion(recentlyViewedSuggestion);
      } else {
        showSuggestion({
          message: 'Bạn cần mình tư vấn loại hải sản phù hợp không? 🦐',
          icon: 'sparkle',
        });
      }
    }, 15000);
    return () => clearTimeout(timer);
  }, [location.pathname, dismissed, visible, recentlyViewedSuggestion]);

  const handleAddToCart = (product: SuggestionProduct) => {
    if (product.isCombo) {
      window.location.href = `/combo`;
      setVisible(false);
      return;
    }
    addItem({ productId: product.id, name: product.name, price: product.price, unit: product.unit, image: product.image });
    setVisible(false);
  };

  const handleDismiss = () => { setVisible(false); setDismissed(true); };

  const iconMap = {
    fire: <Flame className="h-3.5 w-3.5 text-orange-500" />,
    tag: <Tag className="h-3.5 w-3.5 text-green-600" />,
    clock: <Clock className="h-3.5 w-3.5 text-blue-500" />,
    sparkle: <Sparkles className="h-3.5 w-3.5 text-primary" />,
  };

  if (!visible || !suggestion) return (
    dismissed ? null : (
      <button
        onClick={() => setDismissed(false)}
        className="fixed bottom-32 md:bottom-24 left-4 z-30 w-12 h-12 rounded-full shadow-lg overflow-hidden border-2 border-primary/30 hover:border-primary transition-all hover:scale-110 animate-bounce-soft"
        title="AI Tư vấn"
      >
        <img src={avatarUrl} alt="AI Assistant" className="w-full h-full object-cover" />
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white" />
      </button>
    )
  );

  return (
    <div className="fixed bottom-32 md:bottom-24 left-4 z-30 animate-scale-in">
      <div className="flex items-end gap-2 max-w-xs">
        <div className="flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-primary shadow-md">
          <img src={avatarUrl} alt="AI" className="w-full h-full object-cover" />
        </div>

        <div className="bg-white rounded-2xl rounded-bl-md shadow-xl border border-gray-100 p-3 max-w-[280px] relative">
          <button onClick={handleDismiss} className="absolute top-1 right-1 p-1 text-gray-400 hover:text-gray-600">
            <X className="h-3.5 w-3.5" />
          </button>

          <div className="flex items-center gap-1 mb-1.5">
            {iconMap[suggestion.icon || 'sparkle']}
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
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-coral">{formatPrice(p.price)}</p>
                      {p.originalPrice && (
                        <p className="text-[10px] text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleAddToCart(p)}
                    className="flex-shrink-0 p-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    title={p.isCombo ? 'Xem combo' : 'Thêm vào giỏ'}
                  >
                    {p.isCombo ? <ChevronRight className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                  </button>
                </div>
              ))}
              <Link
                to={suggestion.icon === 'tag' ? '/combo' : '/san-pham'}
                className="flex items-center justify-center gap-1 text-xs text-primary font-bold py-1 hover:underline"
              >
                {suggestion.icon === 'tag' ? 'Xem tất cả combo' : 'Xem tất cả'} <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
