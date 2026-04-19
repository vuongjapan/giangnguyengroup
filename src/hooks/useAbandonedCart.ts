import { useEffect, useRef } from 'react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'gn-recovery-token';
const SAVE_DELAY = 30_000; // save 30s after last cart change

/** Background hook: saves cart to abandoned_carts table after idle.
 *  Recovers cart from URL ?recover=token on mount. */
export function useAbandonedCart() {
  const { items, totalPrice, setIsOpen } = useCart();
  const { user } = useAuth();
  const timerRef = useRef<number | null>(null);

  // Recover from URL
  useEffect(() => {
    const url = new URL(window.location.href);
    const token = url.searchParams.get('recover');
    if (!token) return;

    (async () => {
      const { data } = await supabase
        .from('abandoned_carts')
        .select('cart_data, recovered')
        .eq('recovery_token', token)
        .maybeSingle();
      if (data && !data.recovered && Array.isArray(data.cart_data) && data.cart_data.length > 0) {
        localStorage.setItem('gn-cart', JSON.stringify(data.cart_data));
        localStorage.setItem(STORAGE_KEY, token);
        setTimeout(() => { setIsOpen(true); window.location.reload(); }, 500);
      }
    })();
  }, [setIsOpen]);

  // Mark recovered when order placed (clear token after checkout)
  useEffect(() => {
    const onOrder = async () => {
      const token = localStorage.getItem(STORAGE_KEY);
      if (!token) return;
      await supabase
        .from('abandoned_carts')
        .update({ recovered: true, recovered_at: new Date().toISOString() })
        .eq('recovery_token', token);
      localStorage.removeItem(STORAGE_KEY);
    };
    window.addEventListener('gn-order-placed', onOrder);
    return () => window.removeEventListener('gn-order-placed', onOrder);
  }, []);

  // Debounced save
  useEffect(() => {
    if (items.length === 0) return;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(async () => {
      try {
        const existing = localStorage.getItem(STORAGE_KEY);
        // Pull email/phone if present in checkout draft
        let email = '', phone = '', name = '';
        try {
          const draft = JSON.parse(localStorage.getItem('gn-checkout-draft') || '{}');
          email = draft.email || '';
          phone = draft.phone || '';
          name = draft.name || '';
        } catch {}

        const resp = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/abandoned-cart-save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            recovery_token: existing,
            cart_data: items,
            customer_email: email,
            customer_phone: phone,
            customer_name: name,
            total_value: totalPrice,
            user_id: user?.id || null,
          }),
        });
        if (resp.ok) {
          const j = await resp.json();
          if (j.recovery_token) localStorage.setItem(STORAGE_KEY, j.recovery_token);
        }
      } catch (e) {
        console.warn('abandoned cart save fail', e);
      }
    }, SAVE_DELAY);
    return () => { if (timerRef.current) window.clearTimeout(timerRef.current); };
  }, [items, totalPrice, user]);
}
