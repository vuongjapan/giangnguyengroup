import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StoreDB {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  phone: string;
  hours: string;
  image: string | null;
  sort_order: number;
}

export function useStores() {
  const [stores, setStores] = useState<StoreDB[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStores = async () => {
    const { data } = await supabase
      .from('stores')
      .select('*')
      .order('sort_order', { ascending: true });
    if (data) setStores(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchStores();

    const channel = supabase
      .channel('stores-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stores' }, () => {
        fetchStores();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return { stores, loading, refetch: fetchStores };
}
