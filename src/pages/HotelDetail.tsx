import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Phone, Star, CheckCircle, Gift, Truck, Clock, Building2, ShieldCheck, ArrowLeft, Percent } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';
import { useHotel } from '@/contexts/HotelContext';
import { useCart } from '@/contexts/CartContext';
import { products, formatPrice } from '@/data/products';
import { toast } from 'sonner';

interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  address: string;
  category: string;
  amenities: string[];
  discount_percent: number;
  phone: string;
}

const HOTEL_COMBOS = [
  {
    id: 'combo-room',
    name: 'Combo Ăn Tại Phòng',
    items: ['Mực Khô Loại 1 (200g)', 'Cá Thu 1 Nắng (500g)', 'Nem Chua (10 cái)'],
    originalPrice: 650000,
    comboPrice: 520000,
    productIds: ['1', '5', '7'],
  },
  {
    id: 'combo-gift',
    name: 'Combo Mang Về',
    items: ['Mực Khô Loại 2 (500g)', 'Cá Chỉ Vàng (500g)', 'Nem Chua (20 cái)'],
    originalPrice: 900000,
    comboPrice: 720000,
    productIds: ['2', '6', '7'],
  },
  {
    id: 'combo-vip',
    name: 'Combo Quà Biếu VIP',
    items: ['Mực Khô Loại 1 (500g)', 'Mực Trứng (300g)'],
    originalPrice: 1200000,
    comboPrice: 960000,
    productIds: ['1', '4'],
  },
];

export default function HotelDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { setHotelSession } = useHotel();
  const { addItem } = useCart();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [roomNumber, setRoomNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (!slug) return;
    supabase.from('hotels').select('*').eq('slug', slug).maybeSingle().then(({ data }) => {
      setHotel(data as any);
      setLoading(false);
    });
  }, [slug]);

  const handleVerify = () => {
    if (!roomNumber.trim() || !guestName.trim()) {
      toast.error('Vui lòng nhập số phòng và tên khách');
      return;
    }
    if (!hotel) return;
    setHotelSession({
      hotelId: hotel.id,
      hotelName: hotel.name,
      discountPercent: hotel.discount_percent,
      roomNumber: roomNumber.trim(),
      guestName: guestName.trim(),
    });
    setVerified(true);
    toast.success(`Đã áp dụng ưu đãi giảm ${hotel.discount_percent}% cho khách ${hotel.name}!`);
  };

  const handleAddCombo = (combo: typeof HOTEL_COMBOS[0]) => {
    combo.productIds.forEach(pid => {
      const p = products.find(pr => pr.id === pid);
      if (p) addItem({ productId: p.id, name: p.name, price: p.price, image: p.images[0], unit: p.unit });
    });
    toast.success(`Đã thêm ${combo.name} vào giỏ hàng!`);
  };

  if (loading) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center"><div className="animate-pulse text-muted-foreground">Đang tải...</div></div>
    </div>
  );

  if (!hotel) return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="flex-1 flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">Không tìm thấy khách sạn</p>
        <Link to="/khach-san" className="text-primary hover:underline">← Xem danh sách khách sạn</Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="container mx-auto px-4 py-3">
          <Link to="/khach-san" className="text-sm text-primary hover:underline flex items-center gap-1">
            <ArrowLeft className="h-3 w-3" /> Khách sạn liên kết
          </Link>
        </div>

        {/* Hero */}
        <div className="ocean-gradient py-8 px-4">
          <div className="container mx-auto text-center">
            <Building2 className="h-10 w-10 text-primary-foreground mx-auto mb-2" />
            <h1 className="text-2xl md:text-3xl font-black text-primary-foreground mb-1">{hotel.name}</h1>
            <p className="text-primary-foreground/80 text-sm flex items-center justify-center gap-1">
              <MapPin className="h-3 w-3" /> {hotel.address}
            </p>
            <div className="mt-3 inline-block bg-coral text-primary-foreground font-bold px-4 py-1.5 rounded-full text-sm">
              Giảm {hotel.discount_percent}% cho khách lưu trú
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 py-6 space-y-6">
          {/* Info grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Description */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-foreground text-lg mb-3">Giới thiệu</h2>
              <p className="text-muted-foreground text-sm leading-relaxed mb-4">{hotel.description}</p>
              
              <h3 className="font-bold text-foreground text-sm mb-2">Tiện ích</h3>
              <div className="flex flex-wrap gap-2">
                {hotel.amenities.map(a => (
                  <span key={a} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1 rounded-full flex items-center gap-1">
                    <CheckCircle className="h-3 w-3" /> {a}
                  </span>
                ))}
              </div>

              {hotel.phone && (
                <a href={`tel:${hotel.phone}`} className="mt-4 inline-flex items-center gap-2 text-primary font-bold text-sm hover:underline">
                  <Phone className="h-4 w-4" /> {hotel.phone}
                </a>
              )}
            </div>

            {/* Verify guest */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <h2 className="font-bold text-foreground text-lg mb-1">🎁 Xác nhận khách lưu trú</h2>
              <p className="text-muted-foreground text-xs mb-4">Nhập thông tin để nhận giảm giá {hotel.discount_percent}% toàn bộ đơn hàng</p>

              {verified ? (
                <div className="bg-accent border border-primary/20 rounded-xl p-4 text-center space-y-2">
                  <CheckCircle className="h-10 w-10 text-primary mx-auto" />
                  <p className="font-bold text-primary">Đã xác nhận!</p>
                  <p className="text-sm text-foreground">Phòng {roomNumber} – {guestName}</p>
                  <p className="text-xs text-muted-foreground">Giảm giá {hotel.discount_percent}% đã được áp dụng cho toàn bộ đơn hàng</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Số phòng *</label>
                    <input
                      type="text"
                      placeholder="VD: 301"
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={roomNumber}
                      onChange={e => setRoomNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-foreground block mb-1">Tên khách *</label>
                    <input
                      type="text"
                      placeholder="Nhập tên của bạn"
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                      value={guestName}
                      onChange={e => setGuestName(e.target.value)}
                    />
                  </div>
                  <button
                    onClick={handleVerify}
                    className="w-full ocean-gradient text-primary-foreground font-bold py-2.5 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all"
                  >
                    XÁC NHẬN & NHẬN ƯU ĐÃI {hotel.discount_percent}%
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Exclusive benefits */}
          <div className="bg-gradient-to-r from-primary/5 to-coral/5 rounded-2xl border border-primary/20 p-5">
            <h2 className="font-bold text-foreground text-lg mb-3 text-center">Quyền lợi khách {hotel.name}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { icon: Percent, title: `Giảm ${hotel.discount_percent}%`, desc: 'Toàn bộ sản phẩm hải sản' },
                { icon: Truck, title: 'Giao tận phòng', desc: 'Nhanh chóng trong 30 phút' },
                { icon: ShieldCheck, title: 'Ưu tiên đơn', desc: 'Xử lý đơn hàng ngay lập tức' },
              ].map(b => (
                <div key={b.title} className="bg-card rounded-xl p-4 text-center border border-border">
                  <b.icon className="h-8 w-8 text-primary mx-auto mb-2" />
                  <p className="font-bold text-foreground text-sm">{b.title}</p>
                  <p className="text-muted-foreground text-xs">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Combos */}
          <div>
            <h2 className="font-bold text-foreground text-lg mb-4 text-center">🎁 Combo dành riêng cho khách sạn</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {HOTEL_COMBOS.map(combo => {
                const saving = Math.round((1 - combo.comboPrice / combo.originalPrice) * 100);
                return (
                  <div key={combo.id} className="bg-card rounded-2xl border border-border p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-bold text-foreground text-sm">{combo.name}</h3>
                      <span className="bg-coral text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">-{saving}%</span>
                    </div>
                    <ul className="text-xs text-muted-foreground space-y-1 mb-3">
                      {combo.items.map(it => <li key={it} className="flex items-start gap-1"><CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />{it}</li>)}
                    </ul>
                    <div className="flex items-baseline gap-2 mb-3">
                      <span className="text-coral font-extrabold">{formatPrice(combo.comboPrice)}</span>
                      <span className="text-muted-foreground line-through text-xs">{formatPrice(combo.originalPrice)}</span>
                    </div>
                    <button
                      onClick={() => handleAddCombo(combo)}
                      className="w-full ocean-gradient text-primary-foreground font-bold py-2 rounded-lg text-xs hover:opacity-90 active:scale-95 transition-all"
                    >
                      THÊM VÀO GIỎ
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center py-4">
            <button
              onClick={() => navigate('/san-pham')}
              className="ocean-gradient text-primary-foreground font-bold px-8 py-3 rounded-xl text-base hover:opacity-90 active:scale-95 transition-all"
            >
              🛒 XEM TẤT CẢ SẢN PHẨM HẢI SẢN
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
