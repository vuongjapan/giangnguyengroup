import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'gn-recently-viewed';
const MAX_ITEMS = 20;

export interface ViewedProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  image: string;
  viewedAt: string;
}

export function useRecentlyViewed() {
  const [viewed, setViewed] = useState<ViewedProduct[]>(() => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(viewed));
  }, [viewed]);

  const addViewed = useCallback((product: Omit<ViewedProduct, 'viewedAt'>) => {
    setViewed(prev => {
      const filtered = prev.filter(p => p.id !== product.id);
      return [{ ...product, viewedAt: new Date().toISOString() }, ...filtered].slice(0, MAX_ITEMS);
    });
  }, []);

  return { viewed, addViewed };
}
