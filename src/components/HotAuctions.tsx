import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Eye, Clock, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';
import { formatCountdown } from '@/lib/auctionUtils';
import { useAuctionEnabled } from '@/hooks/useAuctionEnabled';

interface AuctionRow {
  id: string;
  name: string;
  slug: string;
  image: string;
  list_price: number;
  start_price: number;
  current_price: number;
  end_at: string;
  fake_viewers: number;
  is_active: boolean;
}

export default function HotAuctions() {
  const { enabled, loading: settingLoading } = useAuctionEnabled();
  const [auctions, setAuctions] = useState<AuctionRow[]>([]);
  const [bidMaxByAuction, setBidMaxByAuction] = useState<Record<string, number>>({});
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchData = async () => {
    const { data: aData } = await supabase
      .from('auction_products')
      .select('*')
      .eq('is_active', true)
      .gt('end_at', new Date().toISOString())
      .order('fake_viewers', { ascending: false })
      .limit(3);
    const list = (aData || []) as AuctionRow[];
    setAuctions(list);
    if (list.length > 0) {
      const ids = list.map(a => a.id);
      const { data: bData } = await supabase
        .from('auction_bids')
        .select('auction_id, bid_amount')
        .in('auction_id', ids);
      const map: Record<string, number> = {};
      (bData || []).forEach(b => {
        const v = Number(b.bid_amount) || 0;
        if (!map[b.auction_id] || v > map[b.auction_id]) map[b.auction_id] = v;
      });
      setBidMaxByAuction(map);
    }
  };

  useEffect(() => {
    if (!enabled) return;
    fetchData();
    // realtime
    const channel = supabase
      .channel('hot-auctions')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_products' }, fetchData)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_bids' }, fetchData)
      .subscribe();
    // fallback auto-refresh 5s
    const poll = setInterval(fetchData, 5000);
    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [enabled]);

  if (settingLoading || !enabled || auctions.length === 0) return null;

  return (
    <section className="bg-gradient-to-b from-coral/5 to-background py-6 md:py-8 scroll-animate">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-coral animate-pulse" />
            <h2 className="section-title">PHIÊN ĐẤU GIÁ HOT NHẤT</h2>
          </div>
          <Link to="/dau-gia" className="text-xs text-primary hover:underline font-medium flex items-center gap-0.5">
            Xem tất cả <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {auctions.map(a => {
            const remaining = new Date(a.end_at).getTime() - now;
            const ended = remaining <= 0;
            const highest = Math.max(
              Number(a.start_price) || 0,
              Number(a.current_price) || 0,
              bidMaxByAuction[a.id] || 0
            );
            return (
              <Link
                key={a.id}
                to={`/dau-gia/${a.slug}`}
                className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-all group flex flex-col"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {a.image ? (
                    <img
                      src={a.image}
                      alt={a.name}
                      loading="lazy"
                      width={400}
                      height={250}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  ) : null}
                  <div className="absolute top-2 left-2 bg-coral text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                    <Flame className="h-3 w-3" /> HOT
                  </div>
                  {!ended && (
                    <div className="absolute top-2 right-2 bg-background/90 text-foreground text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Clock className="h-3 w-3 text-primary" /> {formatCountdown(remaining)}
                    </div>
                  )}
                </div>
                <div className="p-3 flex-1 flex flex-col gap-2">
                  <h3 className="font-bold text-sm text-foreground line-clamp-2 min-h-[2.5rem]">{a.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-[11px] text-muted-foreground line-through">{formatPrice(a.list_price)}</span>
                    <span className="text-base font-black text-coral">{formatPrice(highest)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-auto">
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {a.fake_viewers} người xem</span>
                  </div>
                  <button className="w-full bg-coral text-primary-foreground text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-coral/90 transition-colors">
                    Trả giá ngay <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
