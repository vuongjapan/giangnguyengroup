import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useAuctionEnabled() {
  const [enabled, setEnabled] = useState<boolean>(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'auction_enabled')
        .maybeSingle();
      if (!mounted) return;
      const v = data?.value;
      setEnabled(v === false || v === 'false' ? false : true);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, []);

  return { enabled, loading };
}
