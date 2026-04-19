import { useEffect, useState, useRef } from 'react';
import { X, ShoppingCart, Tag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';

const SHOWN_KEY = 'gn-smart-exit-shown';
const COOLDOWN_HOURS = 12;
const CART_THRESHOLD = 200000;

interface ExitCampaign {
  id: string;
  headline: string;
  button_text: string;
  coupon_code: string;
  image_url: string;
  target_url: string;
}

const FALLBACK: ExitCampaign = {
  id: 'fallback',
  headline: 'Khoan đã! Giảm thêm 8% cho đơn của bạn',
  button_text: 'XEM GIỎ HÀNG',
  coupon_code: 'EXIT8',
  image_url: '',
  target_url: '/checkout',
};

export default function SmartExitPopup() {
  const { items, totalPrice, setIsOpen: setCartOpen } = useCart();
  const [show, setShow] = useState(false);
  const [campaign, setCampaign] = useState<ExitCampaign>(FALLBACK);
  const triggered = useRef(false);
  const sessionId = useRef(
    typeof window !== 'undefined'
      ? (localStorage.getItem('ai_session') || `s_${Date.now()}`)
      : 'srv'
  );

  // Load active exit campaign once (cached in DB, no AI cost)
  useEffect(() => {
    let mounted = true;
    supabase.from('popup_campaigns')
      .select('id, headline, button_text, coupon_code, image_url, target_url')
      .eq('type', 'exit').eq('is_active', true)
      .order('updated_at', { ascending: false }).limit(1).maybeSingle()
      .then(({ data }) => { if (mounted && data) setCampaign(data as ExitCampaign); });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const last = localStorage.getItem(SHOWN_KEY);
    if (last && Date.now() - parseInt(last) < COOLDOWN_HOURS * 3600 * 1000) return;

    const handler = (e: MouseEvent) => {
      if (triggered.current) return;
      if (e.clientY > 0) return;
      if (totalPrice < CART_THRESHOLD) return;
      triggered.current = true;
      setShow(true);
      localStorage.setItem(SHOWN_KEY, Date.now().toString());
      // Track event (server-side aggregation, no AI)
      supabase.from('exit_intent_events').insert({
        event_type: 'shown', cart_value: totalPrice,
        coupon_code: campaign.coupon_code, session_id: sessionId.current,
      });
    };
    document.addEventListener('mouseleave', handler);
    return () => document.removeEventListener('mouseleave', handler);
  }, [totalPrice, campaign.coupon_code]);

  if (!show || items.length === 0) return null;

  const handleClick = (action: 'click' | 'dismiss' | 'convert') => {
    supabase.from('exit_intent_events').insert({
      event_type: action === 'click' ? 'clicked' : action === 'convert' ? 'converted' : 'dismissed',
      cart_value: totalPrice, coupon_code: campaign.coupon_code, session_id: sessionId.current,
    });
  };

  const goCheckout = () => {
    handleClick('click');
    setShow(false);
    setCartOpen(true);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-card rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative animate-slide-in-up">
        <button
          onClick={() => { handleClick('dismiss'); setShow(false); }}
          className="absolute top-3 right-3 z-10 bg-background/80 hover:bg-background rounded-full p-1.5"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="ocean-gradient p-6 text-center">
          <div className="text-5xl mb-2">🎁</div>
          <h3 className="text-xl md:text-2xl font-black text-primary-foreground leading-tight">
            {campaign.headline}
          </h3>
          <p className="text-primary-foreground/90 text-sm mt-2">
            Giỏ của bạn đang có <strong>{items.length} món</strong> – {totalPrice.toLocaleString('vi-VN')}đ
          </p>
        </div>

        <div className="p-5 text-center">
          <div className="bg-coral/10 border-2 border-dashed border-coral rounded-xl p-3 mb-4">
            <p className="text-xs text-muted-foreground mb-1">Mã giảm giá độc quyền</p>
            <div className="flex items-center justify-center gap-2">
              <Tag className="h-5 w-5 text-coral" />
              <span className="text-2xl font-black text-coral tracking-wider">{campaign.coupon_code}</span>
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">Nhập mã ở bước thanh toán</p>
          </div>

          <button
            onClick={goCheckout}
            className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            {campaign.button_text}
          </button>

          <button
            onClick={() => { handleClick('dismiss'); setShow(false); }}
            className="text-xs text-muted-foreground hover:underline mt-3"
          >
            Để lần sau
          </button>
        </div>
      </div>
    </div>
  );
}
