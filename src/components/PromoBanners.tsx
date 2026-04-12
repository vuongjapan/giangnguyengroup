import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ShoppingBag, Gift, Truck, Star } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';
import { Link } from 'react-router-dom';

interface PromoBanner {
  image: string;
  link: string;
  alt: string;
}

interface PromoData {
  mainBanners: PromoBanner[];
  sideBanners: PromoBanner[];
}

const DEFAULT_DATA: PromoData = {
  mainBanners: [
    { image: '', link: '/san-pham', alt: 'Hải sản tươi sống Sầm Sơn' },
  ],
  sideBanners: [
    { image: '', link: '/san-pham?category=M%E1%BB%B1c', alt: 'Mực khô cao cấp' },
    { image: '', link: '/combo', alt: 'Combo quà biếu' },
  ],
};

const FALLBACK_PROMOS = [
  {
    icon: ShoppingBag,
    title: 'MỰC KHÔ SẦM SƠN',
    desc: 'Phơi nắng tự nhiên – Loại 1 cao cấp',
    badge: 'HOT',
    badgeColor: 'bg-coral',
    gradient: 'from-[hsl(200,85%,30%)] to-[hsl(200,80%,45%)]',
    link: '/san-pham?category=M%E1%BB%B1c+kh%C3%B4',
  },
  {
    icon: Gift,
    title: 'COMBO QUÀ BIẾU',
    desc: 'Đóng hộp sang trọng – Giảm đến 20%',
    badge: 'SALE',
    badgeColor: 'bg-accent text-accent-foreground',
    gradient: 'from-[hsl(45,90%,45%)] to-[hsl(35,85%,50%)]',
    link: '/combo',
  },
  {
    icon: Truck,
    title: 'FREE SHIP TOÀN QUỐC',
    desc: 'Đơn từ 500K – Giao tận nhà',
    badge: 'FREE',
    badgeColor: 'bg-green-500',
    gradient: 'from-[hsl(142,76%,30%)] to-[hsl(142,60%,45%)]',
    link: '/san-pham',
  },
  {
    icon: Star,
    title: 'CÁ CHỈ VÀNG – CÁ THU',
    desc: '1 nắng tươi ngon – Cam kết chất lượng',
    badge: 'NEW',
    badgeColor: 'bg-primary',
    gradient: 'from-[hsl(15,85%,45%)] to-[hsl(15,85%,55%)]',
    link: '/san-pham?category=H%E1%BA%A3i+s%E1%BA%A3n+1+n%E1%BA%AFng',
  },
];

export default function PromoBanners() {
  const { data } = useSiteContent<PromoData>('promo_banners', DEFAULT_DATA);
  const mainBanners = data.mainBanners?.filter(b => b.image) || [];
  const sideBanners = data.sideBanners?.filter(b => b.image) || [];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (mainBanners.length <= 1) return;
    const timer = setInterval(() => setCurrent(c => (c + 1) % mainBanners.length), 4000);
    return () => clearInterval(timer);
  }, [mainBanners.length]);

  const hasImages = mainBanners.length > 0 || sideBanners.length > 0;

  // If admin hasn't uploaded promo images, show styled fallback cards
  if (!hasImages) {
    return (
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-3">
            {FALLBACK_PROMOS.map((promo, i) => (
              <Link
                key={i}
                to={promo.link}
                className={`relative bg-gradient-to-br ${promo.gradient} rounded-xl p-4 md:p-5 text-primary-foreground overflow-hidden group hover:shadow-lg transition-shadow`}
              >
                <div className="absolute top-2 right-2">
                  <span className={`${promo.badgeColor} text-primary-foreground text-[10px] font-black px-2 py-0.5 rounded-full`}>
                    {promo.badge}
                  </span>
                </div>
                <promo.icon className="h-7 w-7 md:h-8 md:h-8 mb-2 opacity-90" />
                <h3 className="font-black text-xs md:text-sm leading-tight mb-1">{promo.title}</h3>
                <p className="text-[10px] md:text-xs opacity-80 leading-snug">{promo.desc}</p>
                <span className="inline-block mt-2 text-[10px] md:text-xs font-bold opacity-70 group-hover:opacity-100 transition-opacity">
                  Xem ngay →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {mainBanners.length > 0 && (
            <div className="md:col-span-2 relative rounded-xl overflow-hidden group aspect-[2/1] bg-muted">
              {mainBanners.map((b, i) => (
                <a key={i} href={b.link} className={`absolute inset-0 transition-opacity duration-500 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                  <img src={b.image} alt={b.alt} className="w-full h-full object-cover" loading="lazy" />
                </a>
              ))}
              {mainBanners.length > 1 && (
                <>
                  <button onClick={() => setCurrent(c => (c - 1 + mainBanners.length) % mainBanners.length)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-foreground/30 hover:bg-foreground/50 text-primary-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setCurrent(c => (c + 1) % mainBanners.length)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-foreground/30 hover:bg-foreground/50 text-primary-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                    {mainBanners.map((_, i) => (
                      <button key={i} onClick={() => setCurrent(i)} className={`w-2 h-2 rounded-full transition-all ${i === current ? 'bg-primary-foreground w-6' : 'bg-primary-foreground/50'}`} />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          {sideBanners.length > 0 && (
            <div className="flex flex-row md:flex-col gap-3">
              {sideBanners.slice(0, 2).map((b, i) => (
                <a key={i} href={b.link} className="flex-1 rounded-xl overflow-hidden bg-muted block">
                  <img src={b.image} alt={b.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
                </a>
              ))}
            </div>
          )}
        </div>
        {sideBanners.length > 2 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
            {sideBanners.slice(2, 6).map((b, i) => (
              <a key={i} href={b.link} className="rounded-xl overflow-hidden bg-muted block aspect-[2/1]">
                <img src={b.image} alt={b.alt} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" loading="lazy" />
              </a>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
