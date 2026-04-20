import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Eye, Clock, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
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
  start_at: string;
  fake_viewers: number;
  is_active: boolean;
}

export default function AuctionsPage() {
  const { enabled, loading: settingLoading } = useAuctionEnabled();
  const [auctions, setAuctions] = useState<AuctionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchData = async () => {
      const { data } = await supabase
        .from('auction_products')
        .select('*')
        .eq('is_active', true)
        .order('sort_order');
      if (mounted && data) setAuctions(data as AuctionRow[]);
      if (mounted) setLoading(false);
    };
    fetchData();

    const channel = supabase
      .channel('auctions-list')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_products' }, fetchData)
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  if (settingLoading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Đấu giá hải sản khô realtime — Giang Nguyên Group"
        description="Trả giá như đi chợ — đấu giá realtime mực khô, cá khô, đặc sản Sầm Sơn. Giá tốt mỗi ngày."
        canonical="/dau-gia"
      />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-black text-foreground flex items-center justify-center gap-2">
            <Flame className="h-7 w-7 text-coral" />
            Đấu giá realtime
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Trả giá như đi chợ — giá tốt mỗi ngày, ai nhanh người đó được.
          </p>
        </div>

        {!enabled ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-lg font-bold text-foreground mb-2">Tính năng đang bảo trì</p>
            <p className="text-sm text-muted-foreground">Vui lòng quay lại sau ít phút.</p>
          </div>
        ) : loading ? (
          <div className="text-center py-10 text-muted-foreground">Đang tải...</div>
        ) : auctions.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-10 text-center">
            <p className="text-lg font-bold text-foreground mb-2">Chưa có phiên đấu giá nào</p>
            <p className="text-sm text-muted-foreground">Theo dõi để không bỏ lỡ phiên đấu giá tiếp theo.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {auctions.map((a) => {
              const remaining = new Date(a.end_at).getTime() - now;
              const ended = remaining <= 0;
              return (
                <Link
                  key={a.id}
                  to={`/dau-gia/${a.slug}`}
                  className="bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
                >
                  <div className="relative aspect-square overflow-hidden bg-muted">
                    {a.image ? (
                      <img
                        src={a.image}
                        alt={a.name}
                        loading="lazy"
                        width={400}
                        height={400}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : null}
                    <div className="absolute top-2 left-2 bg-coral text-primary-foreground text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1">
                      <Flame className="h-3 w-3" /> ĐANG ĐẤU GIÁ
                    </div>
                    {ended && (
                      <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                        <span className="text-white font-black text-lg">ĐÃ KẾT THÚC</span>
                      </div>
                    )}
                  </div>
                  <div className="p-3 space-y-2">
                    <h3 className="font-bold text-sm text-foreground line-clamp-2 min-h-[2.5rem]">{a.name}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground line-through">{formatPrice(a.list_price)}</span>
                      <span className="text-base font-black text-coral">{formatPrice(a.current_price || a.start_price)}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {a.fake_viewers} người xem</span>
                      <span className="flex items-center gap-1 font-bold text-primary">
                        <Clock className="h-3 w-3" /> {ended ? 'Hết giờ' : formatCountdown(remaining)}
                      </span>
                    </div>
                    <button className="w-full mt-2 bg-coral text-primary-foreground text-xs font-bold py-2 rounded-lg flex items-center justify-center gap-1 hover:bg-coral/90 transition-colors">
                      Trả giá ngay <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
