import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Flame, Eye, Clock, ArrowLeft, CheckCircle2, X } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { supabase } from '@/integrations/supabase/client';
import { formatPrice } from '@/data/products';
import { formatCountdown, maskName } from '@/lib/auctionUtils';
import { useAuctionEnabled } from '@/hooks/useAuctionEnabled';
import { toast } from 'sonner';
import { z } from 'zod';

interface AuctionRow {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  list_price: number;
  start_price: number;
  current_price: number;
  min_increment: number;
  start_at: string;
  end_at: string;
  fake_viewers: number;
  is_active: boolean;
}

interface BidRow {
  id: string;
  auction_id: string;
  customer_name: string;
  bid_amount: number;
  created_at: string;
}

const bidInfoSchema = z.object({
  name: z.string().trim().min(2, 'Tên tối thiểu 2 ký tự').max(60),
  phone: z.string().trim().regex(/^(0|\+84)\d{8,10}$/, 'Số điện thoại không hợp lệ'),
});

export default function AuctionDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { enabled, loading: settingLoading } = useAuctionEnabled();

  const [auction, setAuction] = useState<AuctionRow | null>(null);
  const [bids, setBids] = useState<BidRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(Date.now());

  const [bidInput, setBidInput] = useState<string>('');
  const [showPopup, setShowPopup] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [pendingBid, setPendingBid] = useState<number>(0);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchAuction = async () => {
    if (!slug) return;
    const { data } = await supabase
      .from('auction_products')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (data) setAuction(data as AuctionRow);
    setLoading(false);
  };

  const fetchBids = async (auctionId: string) => {
    const { data } = await supabase
      .from('auction_bids')
      .select('*')
      .eq('auction_id', auctionId)
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setBids(data as BidRow[]);
  };

  useEffect(() => {
    fetchAuction();
  }, [slug]);

  useEffect(() => {
    if (!auction?.id) return;
    fetchBids(auction.id);
    const channel = supabase
      .channel(`auction-${auction.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'auction_bids', filter: `auction_id=eq.${auction.id}` }, () => {
        fetchBids(auction.id);
        fetchAuction();
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'auction_products', filter: `id=eq.${auction.id}` }, (payload) => {
        setAuction((prev) => (prev ? { ...prev, ...(payload.new as AuctionRow) } : prev));
      })
      .subscribe();
    // Fallback auto-refresh 5s phòng khi realtime fail
    const poll = setInterval(() => {
      fetchBids(auction.id);
      fetchAuction();
    }, 5000);
    return () => { supabase.removeChannel(channel); clearInterval(poll); };
  }, [auction?.id]);

  const remaining = useMemo(() => {
    if (!auction) return 0;
    return new Date(auction.end_at).getTime() - now;
  }, [auction, now]);

  const ended = remaining <= 0;

  // Highest bid: max(bids) hoặc start_price nếu chưa ai trả giá
  const highestBid = useMemo(() => {
    if (!auction) return 0;
    const bidMax = bids.reduce((m, b) => Math.max(m, Number(b.bid_amount) || 0), 0);
    return Math.max(
      Number(auction.start_price) || 0,
      Number(auction.current_price) || 0,
      bidMax
    );
  }, [auction, bids]);

  const minNextBid = auction ? highestBid + (Number(auction.min_increment) || 0) : 0;

  const handleOpenPopup = () => {
    if (!auction || ended) return;
    const value = parseInt(bidInput.replace(/\D/g, ''), 10);
    if (!value || isNaN(value)) {
      toast.error('Vui lòng nhập giá hợp lệ');
      return;
    }
    if (value < minNextBid) {
      toast.error(`Giá tối thiểu phải ≥ ${formatPrice(minNextBid)}`);
      return;
    }
    setPendingBid(value);
    setShowPopup(true);
  };

  const handleSubmitBid = async () => {
    if (!auction) return;
    const parsed = bidInfoSchema.safeParse({ name, phone });
    if (!parsed.success) {
      toast.error(parsed.error.errors[0]?.message || 'Thông tin không hợp lệ');
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.from('auction_bids').insert({
        auction_id: auction.id,
        customer_name: parsed.data.name,
        customer_phone: parsed.data.phone,
        bid_amount: pendingBid,
      });
      if (error) throw error;

      // Trigger DB tự cập nhật current_price khi bid > current_price
      setSubmitted(true);
      setBidInput('');
      // Optimistic refresh
      fetchBids(auction.id);
      fetchAuction();
    } catch (e: any) {
      toast.error('Có lỗi xảy ra, thử lại nhé');
    } finally {
      setSubmitting(false);
    }
  };

  const closePopup = () => {
    setShowPopup(false);
    setSubmitted(false);
    setName('');
    setPhone('');
    setPendingBid(0);
  };

  if (settingLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col"><Header /><main className="flex-1 flex items-center justify-center text-muted-foreground">Đang tải...</main><Footer /></div>
    );
  }

  if (!enabled) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <main className="flex-1 container mx-auto p-6 text-center">
          <p className="text-lg font-bold mt-10">Tính năng đang bảo trì</p>
        </main><Footer /></div>
    );
  }

  if (!auction || !auction.is_active) {
    return (
      <div className="min-h-screen flex flex-col"><Header />
        <main className="flex-1 container mx-auto p-6 text-center">
          <p className="text-lg font-bold mt-10">Phiên đấu giá không tồn tại</p>
          <Link to="/dau-gia" className="text-primary underline mt-4 inline-block">← Quay lại danh sách</Link>
        </main><Footer /></div>
    );
  }

  const currentPrice = highestBid;
  const viewers = auction.fake_viewers + Math.floor(Math.sin(now / 8000) * 3 + 3);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title={`Đấu giá ${auction.name} — Giang Nguyên Group`}
        description={`Trả giá ${auction.name} realtime. Giá khởi điểm ${formatPrice(auction.start_price)}.`}
        url={`https://giangnguyengroup.lovable.app/dau-gia/${auction.slug}`}
      />
      <Header />

      <main className="flex-1 container mx-auto px-4 py-4 max-w-3xl">
        <Link to="/dau-gia" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-3">
          <ArrowLeft className="h-4 w-4" /> Tất cả phiên đấu giá
        </Link>

        <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm">
          {/* Image */}
          <div className="relative aspect-[4/3] sm:aspect-[16/9] bg-muted">
            {auction.image && (
              <img src={auction.image} alt={auction.name} className="w-full h-full object-cover" width={800} height={450} />
            )}
            <div className="absolute top-3 left-3 bg-coral text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1">
              <Flame className="h-3.5 w-3.5" /> ĐANG ĐẤU GIÁ
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-4">
            <h1 className="text-xl sm:text-2xl font-black text-foreground">{auction.name}</h1>
            {auction.description && <p className="text-sm text-muted-foreground">{auction.description}</p>}

            {/* Price block — chợ truyền thống */}
            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Giá niêm yết</span>
                <span className="text-sm line-through text-muted-foreground">{formatPrice(auction.list_price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Giá khởi điểm</span>
                <span className="text-sm font-bold text-foreground">{formatPrice(auction.start_price)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border pt-2">
                <span className="text-sm font-bold text-foreground">Giá cao nhất hiện tại</span>
                <span className="text-2xl font-black text-coral">{formatPrice(currentPrice)}</span>
              </div>
            </div>

            {/* FOMO bar */}
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1 text-muted-foreground">
                <Eye className="h-4 w-4" /> <strong className="text-foreground">{viewers}</strong> người đang xem
              </span>
              <span className="flex items-center gap-1 font-bold text-primary">
                <Clock className="h-4 w-4" /> {ended ? 'ĐÃ KẾT THÚC' : formatCountdown(remaining)}
              </span>
            </div>

            {/* Bid input */}
            {ended ? (
              <div className="bg-muted border border-border rounded-xl p-4 text-center">
                <p className="font-bold text-foreground">Phiên đấu giá đã kết thúc</p>
                <p className="text-xs text-muted-foreground mt-1">Cảm ơn bạn đã tham gia!</p>
              </div>
            ) : (
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground">
                  Nhập giá đề xuất (tối thiểu {formatPrice(minNextBid)})
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder={formatPrice(minNextBid)}
                    value={bidInput ? Number(bidInput.replace(/\D/g, '')).toLocaleString('vi-VN') : ''}
                    onChange={(e) => setBidInput(e.target.value)}
                    className="flex-1 px-4 py-3 border-2 border-border rounded-xl text-base font-bold focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={handleOpenPopup}
                    className="bg-coral text-primary-foreground font-black px-5 py-3 rounded-xl hover:bg-coral/90 transition-colors whitespace-nowrap"
                  >
                    Đặt giá ngay
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground">Bước giá tối thiểu: {formatPrice(auction.min_increment)}</p>
              </div>
            )}

            {/* Recent bids */}
            <div className="border-t border-border pt-4">
              <h2 className="font-bold text-sm text-foreground mb-3">Giá vừa được đặt</h2>
              {bids.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">Chưa có ai trả giá. Bạn là người đầu tiên!</p>
              ) : (
                <ul className="space-y-2 max-h-72 overflow-y-auto">
                  {bids.map((b) => (
                    <li key={b.id} className="flex items-center justify-between text-sm bg-muted/30 rounded-lg px-3 py-2">
                      <span className="text-muted-foreground">{maskName(b.customer_name)}</span>
                      <span className="font-bold text-coral">{formatPrice(b.bid_amount)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* Popup */}
      {showPopup && (
        <div className="fixed inset-0 z-[100] bg-black/60 flex items-end sm:items-center justify-center p-3" onClick={closePopup}>
          <div className="bg-card rounded-2xl w-full max-w-md p-5 shadow-2xl animate-slide-right" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-black text-lg text-foreground">Giữ giá ngay</h3>
              <button onClick={closePopup} className="p-1 hover:bg-muted rounded-lg"><X className="h-5 w-5" /></button>
            </div>

            {submitted ? (
              <div className="text-center py-6 space-y-3">
                <CheckCircle2 className="h-14 w-14 text-primary mx-auto" />
                <p className="font-bold text-foreground">Đã nhận thông tin!</p>
                <p className="text-sm text-muted-foreground">Chúng tôi sẽ liên hệ sớm để xác nhận giá <strong className="text-coral">{formatPrice(pendingBid)}</strong>.</p>
                <button onClick={closePopup} className="bg-primary text-primary-foreground font-bold px-6 py-2.5 rounded-xl hover:bg-primary/90">
                  Đóng
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="bg-muted/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-muted-foreground">Giá bạn đề xuất</p>
                  <p className="text-2xl font-black text-coral">{formatPrice(pendingBid)}</p>
                </div>
                <input
                  type="text"
                  placeholder="Họ tên *"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  maxLength={60}
                  className="w-full px-3 py-2.5 border border-border rounded-lg focus:border-primary focus:outline-none"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  maxLength={15}
                  className="w-full px-3 py-2.5 border border-border rounded-lg focus:border-primary focus:outline-none"
                />
                <button
                  disabled={submitting}
                  onClick={handleSubmitBid}
                  className="w-full bg-coral text-primary-foreground font-black py-3 rounded-xl hover:bg-coral/90 disabled:opacity-50 transition-colors"
                >
                  {submitting ? 'Đang gửi...' : 'Giữ giá ngay'}
                </button>
                <p className="text-[11px] text-muted-foreground text-center">Thông tin chỉ dùng để liên hệ xác nhận đơn.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
