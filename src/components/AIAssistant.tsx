// AI Sales Assistant — DB-driven scripts, multi-trigger, tracking, smart rules
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { X, ShoppingCart, ChevronRight, Sparkles, Tag, Flame, Clock, MessageCircle, Minus } from 'lucide-react';
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
  ctaLabel?: string;
  ctaAction?: string;
  trigger: string;
}
interface Combo {
  id: string; name: string; slug: string; combo_price: number; original_price: number;
  image: string; tag: string; is_active: boolean;
}
interface AIScript {
  trigger_type: string; message: string; cta_label: string; cta_action: string; active: boolean;
}
interface AISettings {
  enabled: boolean; avatar_url: string; cooldown_seconds: number;
  position: string; close_sleep_hours: number; max_close_count: number;
}

const DEFAULT_AVATAR = '/images/logo-giang-nguyen-group.jpg';
const SESSION_KEY = 'ai_session_id';
const CLOSE_KEY = 'ai_close_data';
const VISIT_KEY = 'ai_last_visit';

function getSessionId(): string {
  let s = sessionStorage.getItem(SESSION_KEY);
  if (!s) {
    s = `s_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    sessionStorage.setItem(SESSION_KEY, s);
  }
  return s;
}

function trackEvent(event_type: string, payload: Record<string, any> = {}) {
  const session_id = getSessionId();
  // Fire and forget
  supabase.from('ai_logs').insert({ session_id, event_type, payload }).then(() => {});
}

export default function AIAssistant() {
  const [visible, setVisible] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [sleeping, setSleeping] = useState(false);
  const [lastShown, setLastShown] = useState(0);
  const [combos, setCombos] = useState<Combo[]>([]);
  const [scripts, setScripts] = useState<AIScript[]>([]);
  const [settings, setSettings] = useState<AISettings | null>(null);
  const { products } = useProducts();
  const { addItem, totalItems } = useCart();
  const { viewed } = useRecentlyViewed();
  const location = useLocation();
  const navigate = useNavigate();
  const idleTimerRef = useRef<number | null>(null);

  // Load settings + scripts + combos
  useEffect(() => {
    Promise.all([
      supabase.from('ai_settings').select('*').limit(1).maybeSingle(),
      supabase.from('ai_scripts').select('*').eq('active', true),
      supabase.from('combos').select('id,name,slug,combo_price,original_price,image,tag,is_active')
        .eq('is_active', true).order('sort_order'),
    ]).then(([st, sc, co]) => {
      if (st.data) setSettings(st.data as AISettings);
      if (sc.data) setScripts(sc.data as AIScript[]);
      if (co.data) setCombos(co.data);
    });
  }, []);

  // Check sleep state from prior closes
  useEffect(() => {
    const raw = localStorage.getItem(CLOSE_KEY);
    if (!raw || !settings) return;
    try {
      const { count, until } = JSON.parse(raw);
      if (count >= (settings.max_close_count || 2) && Date.now() < until) {
        setSleeping(true);
      }
    } catch {}
  }, [settings]);

  // Track returning visitor
  const isReturning = useMemo(() => {
    const last = localStorage.getItem(VISIT_KEY);
    localStorage.setItem(VISIT_KEY, String(Date.now()));
    return last && Date.now() - +last < 7 * 24 * 60 * 60 * 1000 && Date.now() - +last > 60 * 1000;
  }, []);

  // Track page view
  useEffect(() => {
    trackEvent('page_view', { path: location.pathname });
  }, [location.pathname]);

  const cooldown = (settings?.cooldown_seconds || 20) * 1000;
  const avatarUrl = settings?.avatar_url || DEFAULT_AVATAR;
  const isEnabled = settings?.enabled !== false;
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
  const isNight = new Date().getHours() >= 18 && new Date().getHours() <= 23;

  const getScript = useCallback((trigger: string): AIScript | undefined => {
    return scripts.find(s => s.trigger_type === trigger);
  }, [scripts]);

  const showSuggestion = useCallback((s: Suggestion) => {
    if (sleeping || !isEnabled || Date.now() - lastShown < cooldown) return;
    setSuggestion(s);
    setVisible(true);
    setMinimized(false);
    setLastShown(Date.now());
    trackEvent('ai_show', { trigger: s.trigger });
  }, [sleeping, lastShown, isEnabled, cooldown]);

  // Trigger 1: WELCOME (3s) — homepage
  useEffect(() => {
    if (location.pathname !== '/' || !isEnabled) return;
    const timer = setTimeout(() => {
      const sc = getScript(isReturning ? 'returning' : (isNight ? 'night_combo' : 'welcome'));
      if (!sc) return;
      const productList: SuggestionProduct[] = isNight && combos.length
        ? combos.slice(0, 2).map(c => ({
            id: c.id, name: c.name, slug: c.slug, price: c.combo_price, unit: 'combo',
            image: c.image, originalPrice: c.original_price, isCombo: true,
          }))
        : combos.slice(0, 2).map(c => ({
            id: c.id, name: c.name, slug: c.slug, price: c.combo_price, unit: 'combo',
            image: c.image, originalPrice: c.original_price, isCombo: true,
          }));
      showSuggestion({
        message: isMobile ? sc.message.slice(0, 60) : sc.message,
        icon: isNight ? 'fire' : 'sparkle',
        products: productList,
        ctaLabel: sc.cta_label, ctaAction: sc.cta_action, trigger: sc.trigger_type,
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [location.pathname, isEnabled, getScript, combos, isReturning, isNight, isMobile, showSuggestion]);

  // Trigger 2: PRODUCT VIEW (5s on product page)
  useEffect(() => {
    const match = location.pathname.match(/^\/product\/(.+)/);
    if (!match || !isEnabled) return;
    const slug = match[1];
    const timer = setTimeout(() => {
      const current = products.find(p => p.slug === slug);
      if (!current) return;
      trackEvent('product_view', { product_id: current.id, slug });
      const sc = getScript('product_view');
      if (!sc) return;
      const matchingCombo = combos.find(c =>
        c.tag?.toLowerCase().includes((current.category || '').toLowerCase())
      );
      const products_list: SuggestionProduct[] = matchingCombo
        ? [{
            id: matchingCombo.id, name: matchingCombo.name, slug: matchingCombo.slug,
            price: matchingCombo.combo_price, unit: 'combo', image: matchingCombo.image,
            originalPrice: matchingCombo.original_price, isCombo: true,
          }]
        : products.filter(p => p.id !== current.id && p.category === current.category)
            .slice(0, 2).map(p => ({
              id: p.id, name: p.name, slug: p.slug, price: p.price, unit: p.unit, image: p.images[0],
            }));
      showSuggestion({
        message: sc.message, icon: 'fire', products: products_list,
        ctaLabel: sc.cta_label, ctaAction: sc.cta_action, trigger: sc.trigger_type,
      });
    }, 5000);
    return () => clearTimeout(timer);
  }, [location.pathname, isEnabled, products, combos, getScript, showSuggestion]);

  // Trigger 3: IDLE 15s — reset on activity
  useEffect(() => {
    if (!isEnabled) return;
    const reset = () => {
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
      idleTimerRef.current = window.setTimeout(() => {
        trackEvent('idle', { path: location.pathname });
        const sc = getScript('idle');
        if (!sc) return;
        const productList: SuggestionProduct[] = viewed.length >= 2
          ? viewed.slice(0, 2).map(p => ({
              id: p.id, name: p.name, slug: p.slug, price: p.price, unit: 'kg', image: p.image,
            }))
          : [];
        showSuggestion({
          message: sc.message, icon: viewed.length ? 'clock' : 'sparkle',
          products: productList, ctaLabel: sc.cta_label, ctaAction: sc.cta_action, trigger: sc.trigger_type,
        });
      }, 15000);
    };
    const events = ['mousemove', 'keydown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      events.forEach(e => window.removeEventListener(e, reset));
      if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
    };
  }, [isEnabled, getScript, viewed, location.pathname, showSuggestion]);

  // Trigger 4: CART UPSELL (checkout page with items)
  useEffect(() => {
    if (location.pathname !== '/checkout' || totalItems === 0 || !isEnabled) return;
    const timer = setTimeout(() => {
      const sc = getScript('cart_upsell');
      if (!sc || combos.length === 0) return;
      showSuggestion({
        message: sc.message, icon: 'tag',
        products: combos.slice(0, 2).map(c => ({
          id: c.id, name: c.name, slug: c.slug, price: c.combo_price, unit: 'combo',
          image: c.image, originalPrice: c.original_price, isCombo: true,
        })),
        ctaLabel: sc.cta_label, ctaAction: sc.cta_action, trigger: sc.trigger_type,
      });
    }, 3000);
    return () => clearTimeout(timer);
  }, [location.pathname, totalItems, isEnabled, getScript, combos, showSuggestion]);

  // Trigger 5: EXIT INTENT (mouse leaves viewport top)
  useEffect(() => {
    if (!isEnabled || isMobile) return;
    const handleLeave = (e: MouseEvent) => {
      if (e.clientY <= 0 && !visible) {
        const sc = getScript('exit_intent');
        if (!sc) return;
        showSuggestion({
          message: sc.message, icon: 'tag',
          products: combos.slice(0, 1).map(c => ({
            id: c.id, name: c.name, slug: c.slug, price: c.combo_price, unit: 'combo',
            image: c.image, originalPrice: c.original_price, isCombo: true,
          })),
          ctaLabel: sc.cta_label, ctaAction: sc.cta_action, trigger: sc.trigger_type,
        });
      }
    };
    document.addEventListener('mouseleave', handleLeave);
    return () => document.removeEventListener('mouseleave', handleLeave);
  }, [isEnabled, isMobile, visible, getScript, combos, showSuggestion]);

  const handleAddToCart = (product: SuggestionProduct) => {
    trackEvent('click_ai_cta', { action: 'add_to_cart', product_id: product.id, trigger: suggestion?.trigger });
    if (product.isCombo) { navigate('/combo'); setVisible(false); return; }
    addItem({ productId: product.id, name: product.name, price: product.price, unit: product.unit, image: product.image });
    setVisible(false);
  };

  const handleCTA = () => {
    if (!suggestion) return;
    trackEvent('click_ai_cta', { action: suggestion.ctaAction, trigger: suggestion.trigger });
    const map: Record<string, string> = {
      view: '/san-pham', combo: '/combo', recent: '/san-pham', cart: '/checkout',
    };
    if (suggestion.ctaAction === 'chat') {
      // Open chatbot if available
      window.dispatchEvent(new CustomEvent('open-chatbot'));
    } else {
      navigate(map[suggestion.ctaAction || 'view'] || '/san-pham');
    }
    setVisible(false);
  };

  const handleDismiss = () => {
    trackEvent('close_ai', { trigger: suggestion?.trigger });
    setVisible(false);
    if (!settings) return;
    // Track close count → enter sleep mode if exceeded
    const raw = localStorage.getItem(CLOSE_KEY);
    let data = { count: 0, until: 0 };
    try { if (raw) data = JSON.parse(raw); } catch {}
    data.count = (data.count || 0) + 1;
    if (data.count >= settings.max_close_count) {
      data.until = Date.now() + settings.close_sleep_hours * 60 * 60 * 1000;
      setSleeping(true);
    }
    localStorage.setItem(CLOSE_KEY, JSON.stringify(data));
  };

  const handleMinimize = () => { setMinimized(true); };
  const handleRestore = () => { setMinimized(false); };

  const iconMap = {
    fire: <Flame className="h-3.5 w-3.5 text-orange-500" />,
    tag: <Tag className="h-3.5 w-3.5 text-green-600" />,
    clock: <Clock className="h-3.5 w-3.5 text-blue-500" />,
    sparkle: <Sparkles className="h-3.5 w-3.5 text-primary" />,
  };

  if (sleeping || !isEnabled) return null;

  // Floating avatar (closed or minimized state)
  if (!visible || minimized) {
    return (
      <button
        onClick={() => { setVisible(true); setMinimized(false); }}
        className="fixed bottom-32 md:bottom-24 left-4 z-30 group"
        title="AI Tư vấn bán hàng"
        aria-label="Mở AI Tư vấn"
      >
        <span className="block w-14 h-14 rounded-full overflow-hidden border-2 border-primary shadow-lg ring-4 ring-primary/20 animate-bounce-soft transition-transform group-hover:scale-110">
          <img src={avatarUrl} alt="AI Sales Assistant" loading="lazy" decoding="async" width={56} height={56} className="w-full h-full object-cover" />
        </span>
        <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white animate-pulse" aria-label="Online" />
        <span className="absolute -top-2 -left-2 bg-coral text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full shadow">AI</span>
      </button>
    );
  }

  return (
    <div className={`fixed bottom-32 md:bottom-24 left-4 z-30 animate-scale-in ${isMobile ? 'right-4 max-w-[calc(100vw-2rem)]' : ''}`}>
      <div className="flex items-end gap-2 max-w-xs md:max-w-sm">
        <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full overflow-hidden border-2 border-primary shadow-md ring-2 ring-primary/30">
          <img src={avatarUrl} alt="AI" loading="lazy" decoding="async" width={48} height={48} className="w-full h-full object-cover" />
        </div>

        <div className="bg-white rounded-2xl rounded-bl-md shadow-2xl border border-gray-100 p-3 max-w-[280px] md:max-w-[320px] relative">
          <div className="absolute top-1 right-1 flex gap-0.5">
            <button onClick={handleMinimize} title="Thu nhỏ" aria-label="Thu nhỏ"
              className="p-1 text-gray-400 hover:text-gray-600">
              <Minus className="h-3.5 w-3.5" />
            </button>
            <button onClick={handleDismiss} title="Đóng" aria-label="Đóng"
              className="p-1 text-gray-400 hover:text-gray-600">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1 mb-1.5">
            {iconMap[suggestion!.icon || 'sparkle']}
            <span className="text-[10px] font-bold text-primary tracking-wide">AI TƯ VẤN</span>
            <span className="ml-1 w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          </div>

          <p className="text-sm text-gray-700 leading-relaxed pr-12">{suggestion!.message}</p>

          {suggestion!.products && suggestion!.products.length > 0 && (
            <div className="mt-2 space-y-1.5">
              {suggestion!.products.map(p => (
                <div key={p.id} className="flex items-center gap-2 bg-gray-50 rounded-lg p-1.5 hover:bg-gray-100 transition-colors">
                  <img src={p.image} alt={p.name} loading="lazy" width={40} height={40} className="w-10 h-10 rounded-md object-cover" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-coral">{formatPrice(p.price)}</p>
                      {p.originalPrice && (
                        <p className="text-[10px] text-gray-400 line-through">{formatPrice(p.originalPrice)}</p>
                      )}
                      {p.isCombo && <span className="text-[9px] bg-green-100 text-green-700 px-1 rounded font-bold">COMBO</span>}
                    </div>
                  </div>
                  <button onClick={() => handleAddToCart(p)}
                    className="flex-shrink-0 p-1.5 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
                    title={p.isCombo ? 'Xem combo' : 'Thêm vào giỏ'}
                    aria-label={p.isCombo ? 'Xem combo' : 'Thêm vào giỏ'}>
                    {p.isCombo ? <ChevronRight className="h-3 w-3" /> : <ShoppingCart className="h-3 w-3" />}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* CTA primary button */}
          <button onClick={handleCTA}
            className="mt-2 w-full bg-gradient-to-r from-primary to-primary/80 text-white py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-1">
            {suggestion!.ctaLabel || 'Xem ngay'} <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
