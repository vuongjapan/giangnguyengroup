import React, { createContext, useContext, useState, useCallback } from 'react';

export interface CartItem {
  productId: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('gn-cart');
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [isOpen, setIsOpen] = useState(false);

  const persist = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem('gn-cart', JSON.stringify(newItems));
  };

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === item.productId);
      const next = existing
        ? prev.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + quantity } : i)
        : [...prev, { ...item, quantity }];
      localStorage.setItem('gn-cart', JSON.stringify(next));
      return next;
    });
    setIsOpen(true);
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems(prev => {
      const next = prev.filter(i => i.productId !== productId);
      localStorage.setItem('gn-cart', JSON.stringify(next));
      return next;
    });
  }, []);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) return removeItem(productId);
    setItems(prev => {
      const next = prev.map(i => i.productId === productId ? { ...i, quantity } : i);
      localStorage.setItem('gn-cart', JSON.stringify(next));
      return next;
    });
  }, [removeItem]);

  const clearCart = useCallback(() => persist([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice, isOpen, setIsOpen }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
