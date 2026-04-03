import { X, Minus, Plus, ShoppingBag } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/data/products';
import { useNavigate } from 'react-router-dom';

export default function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-foreground/30" onClick={() => setIsOpen(false)} />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-md bg-card shadow-2xl flex flex-col animate-fade-in">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="font-extrabold text-lg text-foreground flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" /> Giỏ hàng
          </h3>
          <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-3 opacity-30" />
              <p>Giỏ hàng trống</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item.productId} className="flex gap-3 bg-muted/50 rounded-lg p-3">
                <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded-lg" loading="lazy" width={64} height={64} />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground truncate">{item.name}</p>
                  <p className="text-primary font-bold text-sm">{formatPrice(item.price)}/{item.unit}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="p-0.5 rounded bg-muted hover:bg-border">
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-sm font-bold w-6 text-center">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="p-0.5 rounded bg-muted hover:bg-border">
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>
                <button onClick={() => removeItem(item.productId)} className="text-muted-foreground hover:text-destructive self-start">
                  <X className="h-4 w-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="p-4 border-t border-border space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-bold text-foreground">Tổng cộng:</span>
              <span className="text-xl font-extrabold text-primary">{formatPrice(totalPrice)}</span>
            </div>
            <button
              onClick={() => { setIsOpen(false); navigate('/checkout'); }}
              className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-xl text-base hover:opacity-90 transition-opacity active:scale-95"
            >
              ĐẶT HÀNG NGAY
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
