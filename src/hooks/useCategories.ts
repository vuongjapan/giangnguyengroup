import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface CategoryRow {
  id: string;
  name: string;
  slug: string;
  icon: string;
  group_name: string;
  sort_order: number;
  is_active: boolean;
  image_url?: string;
}

export function useCategories(includeInactive = false) {
  const [cats, setCats] = useState<CategoryRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    const load = async () => {
      const q = (supabase as any).from('product_categories').select('*').order('sort_order');
      const { data } = await q;
      if (!alive) return;
      const rows = (data || []) as CategoryRow[];
      setCats(includeInactive ? rows : rows.filter(c => c.is_active));
      setLoading(false);
    };
    load();
    const ch = (supabase as any)
      .channel(`product_categories_realtime_${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'product_categories' }, load)
      .subscribe();
    return () => { alive = false; supabase.removeChannel(ch); };
  }, [includeInactive]);

  return { categories: cats, loading };
}
