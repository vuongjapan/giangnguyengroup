import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';

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

  if (mainBanners.length === 0 && sideBanners.length === 0) return null;

  return (
    <section className="py-4 md:py-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Main banner carousel */}
          {mainBanners.length > 0 && (
            <div className="md:col-span-2 relative rounded-xl overflow-hidden group aspect-[2/1] bg-muted">
              {mainBanners.map((b, i) => (
                <a
                  key={i}
                  href={b.link}
                  className={`absolute inset-0 transition-opacity duration-500 ${i === current ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                >
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

          {/* Side banners */}
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

        {/* Bottom row banners */}
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
