import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useSiteContent<T = any>(key: string, defaultValue: T) {
  const [data, setData] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data: row } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', key)
        .maybeSingle();
      if (row?.value) setData(row.value as T);
      setLoading(false);
    };
    fetch();

    const channel = supabase
      .channel(`site-content-${key}-${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'site_settings' }, (payload: any) => {
        if (payload.new?.key === key) setData(payload.new.value as T);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [key]);

  return { data, loading };
}
