import { useState, useEffect } from 'react';
import { ShoppingCart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';

interface HeroSlide {
  title: string;
  subtitle: string;
  slogan: string;
}

interface HeroData {
  videoUrl: string;
  slides: HeroSlide[];
}

const DEFAULT_DATA: HeroData = {
  videoUrl: '',
  slides: [
    {
      title: 'Hải Sản Khô Cao Cấp Sầm Sơn',
      subtitle: '100% hải sản tự nhiên – Không hóa chất',
      slogan: 'Chọn biển sạch – Chọn Giang Nguyên Group',
    },
    {
      title: 'Quà Biếu Đặc Sản Biển',
      subtitle: 'Đóng gói sang trọng – Giao tận nhà',
      slogan: 'Uy tín – Chất lượng – Đúng giá',
    },
    {
      title: 'Ship Toàn Quốc – Free Ship 1500K',
      subtitle: 'Phơi nắng tự nhiên • Cam kết chính gốc',
      slogan: 'Đặt hàng ngay hôm nay!',
    },
  ],
};

export default function HeroBanner() {
  const { data: heroData } = useSiteContent<HeroData>('hero_banner', DEFAULT_DATA);
  const slides = heroData.slides?.length ? heroData.slides : DEFAULT_DATA.slides;
  const videoUrl = heroData.videoUrl || '';

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prev = () => setCurrent(c => (c - 1 + slides.length) % slides.length);
  const next = () => setCurrent(c => (c + 1) % slides.length);
  const slide = slides[current];

  return (
    <section className="relative h-56 sm:h-72 md:h-96 lg:h-[480px] overflow-hidden group">
      {/* Video or fallback gradient background */}
      {videoUrl ? (
        <video
          key={videoUrl}
          autoPlay
          loop
          muted
          playsInline
          width={1920}
          height={480}
          preload="metadata"
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src={videoUrl} type="video/mp4" />
        </video>
      ) : (
        <div className="absolute inset-0 ocean-gradient" />
      )}

      <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />

      <div className="absolute inset-0 flex items-center">
        <div className="container mx-auto px-4">
          <div className="max-w-lg animate-slide-up" key={current}>
            <span className="inline-block bg-accent text-accent-foreground text-[10px] md:text-xs font-bold px-3 py-1 rounded-full mb-3">
              🏆 GIANG NGUYÊN GROUP
            </span>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-primary-foreground leading-tight mb-2">
              {slide.title}
            </h1>
            <p className="text-primary-foreground/90 text-sm md:text-base mb-1">
              {slide.subtitle}
            </p>
            <p className="text-accent font-bold text-xs md:text-sm mb-5">
              {slide.slogan}
            </p>
            <div className="flex gap-3">
              <a
                href="#products"
                className="ocean-gradient text-primary-foreground font-bold px-6 py-3 rounded-full text-sm md:text-base hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-lg"
              >
                Xem sản phẩm
              </a>
              <a
                href="#products"
                className="bg-accent text-accent-foreground font-bold px-6 py-3 rounded-full text-sm md:text-base hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-lg"
              >
                <ShoppingCart className="h-4 w-4" /> Mua ngay
              </a>
            </div>
          </div>
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-foreground/30 hover:bg-foreground/50 text-primary-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-foreground/30 hover:bg-foreground/50 text-primary-foreground p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? 'bg-accent w-8' : 'bg-primary-foreground/50 hover:bg-primary-foreground/70'}`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
