import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Product, ProductDescription } from '@/data/products';

// Fallback description for products with simple/empty descriptions
function parseDescription(desc: any): ProductDescription {
  if (!desc) return defaultDescription();
  
  // If it's already a fully structured description
  if (desc.hook && desc.benefits && desc.highlights) {
    return desc as ProductDescription;
  }
  
  // If it's a simple text-based description from admin
  const d = defaultDescription();
  if (typeof desc === 'string') {
    d.hook = desc;
    return d;
  }
  if (typeof desc === 'object') {
    return {
      hook: desc.hook || '',
      intro: desc.intro || '',
      benefits: Array.isArray(desc.benefits) ? desc.benefits : desc.benefits ? [desc.benefits] : [],
      highlights: desc.highlights || { origin: '', process: '', packaging: '' },
      cooking: desc.cooking || { methods: [], suggestions: [] },
      choosingTips: Array.isArray(desc.choosingTips) ? desc.choosingTips : [],
      realVsFake: desc.realVsFake || { real: [], fake: [] },
      storage: Array.isArray(desc.storage) ? desc.storage : [],
      suitableFor: Array.isArray(desc.suitableFor) ? desc.suitableFor : [],
      specs: desc.specs || { origin: 'Sầm Sơn, Thanh Hóa', weight: '500g – 1kg', expiry: '6 tháng' },
      commitment: Array.isArray(desc.commitment) ? desc.commitment : [],
      cta: desc.cta || '',
    };
  }
  return d;
}

function defaultDescription(): ProductDescription {
  return {
    hook: '', intro: '', benefits: [],
    highlights: { origin: 'Sầm Sơn, Thanh Hóa', process: 'Phơi nắng tự nhiên', packaging: 'Hút chân không' },
    cooking: { methods: [], suggestions: [] },
    choosingTips: [], realVsFake: { real: [], fake: [] },
    storage: [], suitableFor: [],
    specs: { origin: 'Sầm Sơn, Thanh Hóa', weight: '500g – 1kg', expiry: '6 tháng' },
    commitment: [], cta: '',
  };
}

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProducts = async () => {
    const { data } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');
    
    if (data) {
      setProducts(data.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        unit: p.unit,
        images: p.images.length > 0 ? p.images : ['/placeholder.svg'],
        category: p.category,
        grade: p.grade,
        badges: (p.badges || []) as ('hot' | 'gift' | 'limited')[],
        needs: p.needs || [],
        rating: Number(p.rating) || 5,
        stock: p.stock,
        description: parseDescription(p.description),
      })));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
    const channel = supabase
      .channel(`public-products-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, () => fetchProducts())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  return { products, loading };
}

export function useProduct(slug: string | undefined) {
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) { setLoading(false); return; }
    const fetch = async () => {
      const { data } = await supabase
        .from('products')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .maybeSingle();
      
      if (data) {
        setProduct({
          id: data.id,
          name: data.name,
          slug: data.slug,
          price: data.price,
          unit: data.unit,
          images: data.images.length > 0 ? data.images : ['/placeholder.svg'],
          category: data.category,
          grade: data.grade,
          badges: (data.badges || []) as ('hot' | 'gift' | 'limited')[],
          needs: data.needs || [],
          rating: Number(data.rating) || 5,
          stock: data.stock,
          description: parseDescription(data.description),
        });
      }
      setLoading(false);
    };
    fetch();
  }, [slug]);

  return { product, loading };
}
