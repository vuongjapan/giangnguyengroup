import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Flame, Clock, ShoppingCart, Tag, Zap, Building2 } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { products, formatPrice } from '@/data/products';
import { useCart } from '@/contexts/CartContext';

function useCountdown(targetDate: Date) {
  const [timeLeft, setTimeLeft] = useState(getTimeLeft(targetDate));
  useEffect(() => {
    const timer = setInterval(() => setTimeLeft(getTimeLeft(targetDate)), 1000);
    return () => clearInterval(timer);
  }, [targetDate]);
  return timeLeft;
}

function getTimeLeft(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

const FLASH_SALES = products.slice(0, 4).map((p, i) => ({
  ...p,
  salePrice: Math.round(p.price * (0.75 + i * 0.03)),
  salePercent: Math.round((0.25 - i * 0.03) * 100),
}));

const BULK_DEALS = [
  { min: 2, discount: 5, label: 'Mua 2 giảm 5%' },
  { min: 3, discount: 10, label: 'Mua 3 giảm 10%' },
  { min: 5, discount: 15, label: 'Mua 5+ giảm 15%' },
];

export default function PromotionsPage() {
  const { addItem } = useCart();
  const endDate = new Date();
  endDate.setHours(23, 59, 59, 999);
  const { hours, minutes, seconds } = useCountdown(endDate);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Flash Sale Hero */}
      <section className="bg-gradient-to-r from-red-600 to-coral text-primary-foreground py-10 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full mb-4 animate-pulse-soft">
            <Zap className="h-5 w-5" />
            <span className="font-black text-sm">⚡ FLASH SALE HÔM NAY</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">KHUYẾN MÃI SỐC</h1>
          <p className="text-lg opacity-90 mb-6">Giảm đến 25% – Chỉ hôm nay – Số lượng có hạn!</p>

          {/* Countdown */}
          <div className="flex justify-center gap-3">
            {[
              { value: hours, label: 'Giờ' },
              { value: minutes, label: 'Phút' },
              { value: seconds, label: 'Giây' },
            ].map((t, i) => (
              <div key={i} className="bg-white/20 backdrop-blur-sm rounded-xl p-3 min-w-[70px]">
                <span className="text-3xl md:text-4xl font-black block">{String(t.value).padStart(2, '0')}</span>
                <span className="text-xs opacity-80">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Flash Sale Products */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <Flame className="h-6 w-6 text-coral" />
            <h2 className="text-2xl font-black text-foreground">Flash Sale</h2>
            <span className="bg-coral/10 text-coral px-3 py-1 rounded-full text-xs font-bold ml-auto">
              <Clock className="h-3 w-3 inline mr-1" />
              Kết thúc hôm nay
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {FLASH_SALES.map(product => (
              <div key={product.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all group relative">
                <div className="absolute top-3 left-3 z-10 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-black">
                  -{product.salePercent}%
                </div>
                <div className="absolute top-3 right-3 z-10 bg-coral text-white px-2 py-1 rounded-full text-[10px] font-bold animate-pulse-soft">
                  🔥 HOT
                </div>
                <Link to={`/product/${product.slug}`}>
                  <div className="aspect-square overflow-hidden">
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                </Link>
                <div className="p-4">
                  <h3 className="font-bold text-sm text-foreground mb-2 line-clamp-2">{product.name}</h3>
                  <div className="flex items-baseline gap-2 mb-3">
                    <span className="text-xl font-black text-coral">{formatPrice(product.salePrice)}</span>
                    <span className="text-xs text-muted-foreground line-through">{formatPrice(product.price)}</span>
                  </div>
                  <button
                    onClick={() => addItem({
                      productId: product.id,
                      name: product.name,
                      price: product.salePrice,
                      unit: product.unit,
                      image: product.images[0],
                    })}
                    className="w-full bg-coral text-primary-foreground font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                  >
                    <ShoppingCart className="h-4 w-4" /> Mua ngay
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bulk Deals */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 mb-8">
            <Tag className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-black text-foreground">Mua nhiều giảm giá</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {BULK_DEALS.map((deal, i) => (
              <div key={i} className="bg-card rounded-2xl border-2 border-primary/20 p-6 text-center hover:border-primary hover:shadow-lg transition-all">
                <div className="w-16 h-16 rounded-full ocean-gradient flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-black text-primary-foreground">{deal.min}+</span>
                </div>
                <h3 className="font-black text-xl text-foreground mb-2">{deal.label}</h3>
                <p className="text-sm text-muted-foreground">Áp dụng khi mua từ {deal.min} sản phẩm bất kỳ</p>
                <Link
                  to="/san-pham"
                  className="inline-block mt-4 bg-primary text-primary-foreground font-bold px-6 py-2 rounded-full text-sm hover:opacity-90"
                >
                  Mua ngay
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Hotel special */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="ocean-gradient rounded-2xl p-8 md:p-12 text-primary-foreground text-center">
            <Building2 className="h-12 w-12 mx-auto mb-4 opacity-80" />
            <h2 className="text-2xl md:text-3xl font-black mb-4">Ưu đãi riêng khách TUẤN ĐẠT LUXURY HOTEL</h2>
            <p className="opacity-90 max-w-xl mx-auto mb-6">
              Khách lưu trú được giảm thêm 5–10% trên tất cả sản phẩm. Giao tận phòng trong 30 phút!
            </p>
            <Link
              to="/khach-san-tuan-dat"
              className="inline-block bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-colors"
            >
              Xem ưu đãi khách sạn →
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
