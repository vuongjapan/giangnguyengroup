import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Phone, Pause, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '@/hooks/useSiteContent';
import heroSeafood from '@/assets/hero-seafood.jpg';
import mucKho from '@/assets/products/muc-kho-1.jpg';
import mucNang from '@/assets/products/muc-1-nang.jpg';
import caThu from '@/assets/products/ca-thu-1-nang.jpg';
import caChiVang from '@/assets/products/ca-chi-vang.jpg';

interface HeroSlide {
  title: string;
  subtitle: string;
  slogan: string;
  image?: string;
  cta?: string;
  href?: string;
}

interface SideBanner {
  title: string;
  subtitle?: string;
  price?: string;
  image: string;
  href: string;
  badge?: string;
}

interface BottomBanner {
  title: string;
  subtitle?: string;
  image: string;
  href: string;
}

interface HeroData {
  videoUrl: string;
  slides: HeroSlide[];
  sideBanners?: SideBanner[];
  bottomBanners?: BottomBanner[];
}

const DEFAULT_DATA: HeroData = {
  videoUrl: '',
  slides: [
    {
      title: 'MỰC KHÔ SẦM SƠN',
      subtitle: 'THƯỢNG PHẨM TỪ BIỂN CẢ',
      slogan: 'Phơi nắng tự nhiên • Chính gốc Sầm Sơn',
      image: heroSeafood,
      cta: 'GỌI NGAY 0933.562.286',
      href: 'tel:0933562286',
    },
    {
      title: 'CÁ THU 1 NẮNG',
      subtitle: 'TƯƠI NGON ĐẬM ĐÀ',
      slogan: 'Đóng gói sang trọng – Giao tận nhà',
      image: caThu,
      cta: 'XEM SẢN PHẨM',
      href: '/san-pham',
    },
    {
      title: 'MỰC MỘT NẮNG',
      subtitle: 'ĐẶC SẢN BIỂN THANH HÓA',
      slogan: 'Free ship toàn quốc đơn từ 1.5 triệu',
      image: mucNang,
      cta: 'MUA NGAY',
      href: '/san-pham',
    },
  ],
  sideBanners: [
    {
      title: 'MỰC KHÔ LOẠI 1',
      subtitle: 'SẦM SƠN',
      price: '850K/KG',
      image: mucKho,
      href: '/san-pham?category=' + encodeURIComponent('Mực khô'),
      badge: 'MUA NGAY',
    },
    {
      title: 'CÁ CHỈ VÀNG',
      subtitle: 'CAO CẤP',
      price: '420K/KG',
      image: caChiVang,
      href: '/san-pham?category=' + encodeURIComponent('Cá khô'),
      badge: 'MUA NGAY',
    },
  ],
  bottomBanners: [
    {
      title: 'MỰC KHÔ SẦM SƠN',
      subtitle: 'Thượng phẩm từ biển cả',
      image: mucKho,
      href: '/san-pham?category=' + encodeURIComponent('Mực khô'),
    },
    {
      title: 'HẢI SẢN MỘT NẮNG',
      subtitle: 'Tinh túy biển Thanh Hóa',
      image: mucNang,
      href: '/san-pham?category=' + encodeURIComponent('Hải sản 1 nắng'),
    },
  ],
};

const AUTOPLAY_INTERVAL = 5000; // 5s per slide

export default function HeroBanner() {
  const { data: heroData } = useSiteContent<HeroData>('hero_banner', DEFAULT_DATA);
  const slides = heroData.slides?.length ? heroData.slides : DEFAULT_DATA.slides;
  const sideBanners = heroData.sideBanners?.length ? heroData.sideBanners : DEFAULT_DATA.sideBanners!;
  const bottomBanners = heroData.bottomBanners?.length ? heroData.bottomBanners : DEFAULT_DATA.bottomBanners!;
  const videoUrl = heroData.videoUrl || '';

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const timerRef = useRef<number | null>(null);
  const startRef = useRef<number>(Date.now());
  const rafRef = useRef<number | null>(null);

  const goTo = useCallback((index: number) => {
    setCurrent(((index % slides.length) + slides.length) % slides.length);
    startRef.current = Date.now();
    setProgress(0);
  }, [slides.length]);

  const prev = useCallback(() => goTo(current - 1), [current, goTo]);
  const next = useCallback(() => goTo(current + 1), [current, goTo]);

  // Autoplay with explicit timeout + progress tracking
  useEffect(() => {
    if (slides.length <= 1 || isPaused || videoUrl) return;

    startRef.current = Date.now();
    setProgress(0);

    timerRef.current = window.setTimeout(() => {
      setCurrent(prev => (prev + 1) % slides.length);
    }, AUTOPLAY_INTERVAL);

    const tick = () => {
      const elapsed = Date.now() - startRef.current;
      setProgress(Math.min(100, (elapsed / AUTOPLAY_INTERVAL) * 100));
      if (elapsed < AUTOPLAY_INTERVAL) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [current, slides.length, isPaused, videoUrl]);

  // Keyboard navigation
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  };

  return (
    <section className="bg-background py-3 md:py-4">
      <div className="container mx-auto px-2 md:px-4">
        {/* Top grid: big slider + 2 stacked side banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3">
          {/* Big slider - takes 2/3 on desktop */}
          <div
            className="md:col-span-2 relative h-56 sm:h-72 md:h-[360px] lg:h-[420px] rounded-xl overflow-hidden group shadow-lg"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onFocus={() => setIsPaused(true)}
            onBlur={() => setIsPaused(false)}
            onKeyDown={onKeyDown}
            tabIndex={0}
            role="region"
            aria-roledescription="carousel"
            aria-label="Hero banner"
          >
            {videoUrl ? (
              <video
                key={videoUrl}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
              >
                <source src={videoUrl} type="video/mp4" />
              </video>
            ) : (
              <div className="absolute inset-0 w-full h-full">
                {/* Sliding track */}
                <div
                  className="flex h-full transition-transform duration-700 ease-out will-change-transform"
                  style={{ transform: `translateX(-${current * 100}%)`, width: `${slides.length * 100}%` }}
                >
                  {slides.map((s, i) => (
                    <div
                      key={i}
                      className="relative h-full shrink-0"
                      style={{ width: `${100 / slides.length}%` }}
                      aria-hidden={i !== current}
                    >
                      <img
                        src={s.image || heroSeafood}
                        alt={s.title}
                        className="absolute inset-0 w-full h-full object-cover"
                        loading={i === 0 ? 'eager' : 'lazy'}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/30 to-transparent pointer-events-none" />

            {/* Title block top - re-animates on slide change */}
            <div className="absolute top-4 md:top-8 left-4 md:left-8 right-4 md:right-1/3" key={`txt-${current}`}>
              <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-accent leading-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)] animate-fade-in">
                {slides[current].title}
              </h2>
              <p className="text-primary-foreground text-sm md:text-xl font-bold mt-1 md:mt-2 drop-shadow-md animate-fade-in">
                {slides[current].subtitle}
              </p>
              <p className="text-primary-foreground/90 text-xs md:text-sm mt-1 md:mt-2 drop-shadow animate-fade-in">
                {slides[current].slogan}
              </p>
            </div>

            {/* CTA bottom-left */}
            {slides[current].cta && (
              <a
                href={slides[current].href || '#'}
                className="absolute bottom-6 left-4 md:bottom-8 md:left-8 inline-flex items-center gap-2 bg-coral text-primary-foreground font-bold px-4 md:px-6 py-2 md:py-3 rounded-full text-xs md:text-sm shadow-xl hover:scale-105 transition-transform z-10"
              >
                <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" /> {slides[current].cta}
              </a>
            )}

            {/* Nav arrows + controls */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-foreground/40 hover:bg-foreground/70 text-primary-foreground p-1.5 md:p-2 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
                  aria-label="Slide trước"
                >
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-foreground/40 hover:bg-foreground/70 text-primary-foreground p-1.5 md:p-2 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
                  aria-label="Slide kế tiếp"
                >
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </button>

                {/* Play/Pause */}
                <button
                  onClick={() => setIsPaused(p => !p)}
                  className="absolute top-3 right-3 bg-foreground/40 hover:bg-foreground/70 text-primary-foreground p-1.5 rounded-full opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-10"
                  aria-label={isPaused ? 'Tiếp tục tự chạy' : 'Tạm dừng tự chạy'}
                >
                  {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>

                {/* Dots */}
                <div className="absolute bottom-3 right-4 flex gap-1.5 z-10">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`h-2 rounded-full transition-all ${
                        i === current
                          ? 'bg-accent w-6 shadow'
                          : 'bg-primary-foreground/50 w-2 hover:bg-primary-foreground/80'
                      }`}
                      aria-label={`Đi tới slide ${i + 1}`}
                      aria-current={i === current}
                    />
                  ))}
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/20 z-10">
                  <div
                    className="h-full bg-accent transition-[width] duration-100 ease-linear"
                    style={{ width: `${isPaused ? progress : progress}%` }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Side banners stacked */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
            {sideBanners.slice(0, 2).map((b, i) => (
              <Link
                key={i}
                to={b.href}
                className="relative h-28 sm:h-36 md:h-[174px] lg:h-[204px] rounded-xl overflow-hidden shadow-lg group block"
              >
                <img
                  src={b.image}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-foreground/70 via-foreground/30 to-transparent" />
                <div className="absolute top-2 right-2 md:top-4 md:right-4 text-right max-w-[70%]">
                  <p className="text-accent font-black text-sm md:text-2xl leading-tight drop-shadow-lg">
                    {b.title}
                  </p>
                  {b.subtitle && (
                    <p className="text-primary-foreground font-bold text-[10px] md:text-sm drop-shadow">
                      {b.subtitle}
                    </p>
                  )}
                  {b.price && (
                    <p className="text-accent font-black text-base md:text-xl mt-0.5 md:mt-1 drop-shadow">
                      {b.price}
                    </p>
                  )}
                </div>
                {b.badge && (
                  <span className="absolute bottom-2 right-2 md:bottom-3 md:right-4 bg-coral text-primary-foreground text-[9px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full shadow">
                    {b.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom row: 2 horizontal banners */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mt-2 md:mt-3">
          {bottomBanners.slice(0, 2).map((b, i) => (
            <Link
              key={i}
              to={b.href}
              className="relative h-20 sm:h-28 md:h-32 rounded-xl overflow-hidden shadow-lg group block"
            >
              <img
                src={b.image}
                alt={b.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/30 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-center px-3 md:px-6">
                <p className="text-accent font-black text-sm md:text-2xl leading-tight drop-shadow-lg">
                  {b.title}
                </p>
                {b.subtitle && (
                  <p className="text-primary-foreground text-[10px] md:text-sm font-medium drop-shadow">
                    {b.subtitle}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
