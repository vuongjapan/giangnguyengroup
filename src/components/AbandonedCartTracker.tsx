import { useAbandonedCart } from '@/hooks/useAbandonedCart';

/** Mounts the abandoned cart tracker hook (cannot use hook outside Router/CartProvider). */
export default function AbandonedCartTracker() {
  useAbandonedCart();
  return null;
}
