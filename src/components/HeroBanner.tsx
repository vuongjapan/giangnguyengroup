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

const AUTOPLAY_INTERVAL = 5000;
const TRANSITION_MS = 800;

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

  useEffect(() => {
    if (slides.length <= 1 || isPaused || videoUrl) return;

    startRef.current = Date.now();
    setProgress(0);

    timerRef.current = window.setTimeout(() => {
      setCurrent(p => (p + 1) % slides.length);
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

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    else if (e.key === 'ArrowRight') next();
  };

  return (
    <section className="bg-background w-full">
      <div className="w-full px-0">
        {/* Top grid: big slider + side banners. Full-width edge-to-edge */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {/* Big slider — fluid via aspect ratio */}
          <div
            className="md:col-span-2 relative w-full aspect-[16/10] sm:aspect-[16/9] md:aspect-[16/8.5] lg:aspect-[16/8] overflow-hidden group shadow-lg bg-muted"
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
                {slides.map((s, i) => {
                  const active = i === current;
                  return (
                    <div
                      key={i}
                      className="absolute inset-0 will-change-[opacity,transform]"
                      style={{
                        opacity: active ? 1 : 0,
                        transform: active ? 'scale(1)' : 'scale(1.04)',
                        transition: `opacity ${TRANSITION_MS}ms ease-in-out, transform ${TRANSITION_MS + 400}ms ease-out`,
                        zIndex: active ? 2 : 1,
                      }}
                      aria-hidden={!active}
                    >
                      <img
                        src={s.image || heroSeafood}
                        alt={s.title}
                        className="absolute inset-0 w-full h-full object-cover object-center"
                        loading={i === 0 ? 'eager' : 'lazy'}
                        decoding="async"
                      />
                    </div>
                  );
                })}
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/85 via-foreground/35 to-foreground/10 pointer-events-none z-[3]" />

            {/* Title block — fluid sizes via clamp() so text scales smoothly */}
            <div
              className="absolute z-[4] pointer-events-none"
              style={{
                top: 'clamp(0.75rem, 3.5%, 2rem)',
                left: 'clamp(0.75rem, 3.5%, 2rem)',
                right: 'clamp(0.75rem, 3.5%, 33%)',
              }}
            >
              {slides.map((s, i) => {
                const active = i === current;
                return (
                  <div
                    key={i}
                    className="absolute inset-0"
                    style={{
                      opacity: active ? 1 : 0,
                      transform: active ? 'translateY(0)' : 'translateY(8px)',
                      transition: `opacity ${TRANSITION_MS}ms ease-in-out, transform ${TRANSITION_MS}ms ease-out`,
                    }}
                    aria-hidden={!active}
                  >
                    <h2
                      className="font-black text-accent leading-[1.05] drop-shadow-[0_2px_8px_rgba(0,0,0,0.6)]"
                      style={{ fontSize: 'clamp(1.25rem, 4.5vw, 3.75rem)' }}
                    >
                      {s.title}
                    </h2>
                    <p
                      className="text-primary-foreground font-bold drop-shadow-md"
                      style={{ fontSize: 'clamp(0.75rem, 1.6vw, 1.25rem)', marginTop: 'clamp(0.25rem, 0.6vw, 0.5rem)' }}
                    >
                      {s.subtitle}
                    </p>
                    <p
                      className="text-primary-foreground/90 drop-shadow line-clamp-2"
                      style={{ fontSize: 'clamp(0.6875rem, 1.1vw, 0.875rem)', marginTop: 'clamp(0.25rem, 0.5vw, 0.5rem)' }}
                    >
                      {s.slogan}
                    </p>
                  </div>
                );
              })}
              {/* invisible spacer to reserve height */}
              <div className="invisible" aria-hidden>
                <h2 className="font-black leading-[1.05]" style={{ fontSize: 'clamp(1.25rem, 4.5vw, 3.75rem)' }}>A</h2>
                <p className="font-bold" style={{ fontSize: 'clamp(0.75rem, 1.6vw, 1.25rem)', marginTop: 'clamp(0.25rem, 0.6vw, 0.5rem)' }}>A</p>
                <p style={{ fontSize: 'clamp(0.6875rem, 1.1vw, 0.875rem)', marginTop: 'clamp(0.25rem, 0.5vw, 0.5rem)' }}>A</p>
              </div>
            </div>

            {/* CTA bottom-left — fluid padding & font */}
            {slides[current].cta && (
              <a
                key={`cta-${current}`}
                href={slides[current].href || '#'}
                className="absolute inline-flex items-center gap-2 bg-coral text-primary-foreground font-bold rounded-full shadow-xl hover:scale-105 transition-transform z-[5] animate-fade-in whitespace-nowrap"
                style={{
                  bottom: 'clamp(1rem, 4%, 2rem)',
                  left: 'clamp(0.75rem, 3.5%, 2rem)',
                  fontSize: 'clamp(0.6875rem, 1.1vw, 0.875rem)',
                  paddingInline: 'clamp(0.75rem, 1.6vw, 1.5rem)',
                  paddingBlock: 'clamp(0.5rem, 0.9vw, 0.75rem)',
                  maxWidth: 'calc(100% - 1.5rem)',
                }}
              >
                <Phone className="h-3.5 w-3.5 md:h-4 md:w-4 flex-shrink-0" />
                <span className="truncate">{slides[current].cta}</span>
              </a>
            )}

            {/* Nav arrows + controls */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={prev}
                  className="absolute left-2 md:left-3 top-1/2 -translate-y-1/2 bg-foreground/40 hover:bg-foreground/70 text-primary-foreground p-1.5 md:p-2 rounded-full opacity-60 md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-[6]"
                  aria-label="Slide trước"
                >
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5" />
                </button>
                <button
                  onClick={next}
                  className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 bg-foreground/40 hover:bg-foreground/70 text-primary-foreground p-1.5 md:p-2 rounded-full opacity-60 md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-[6]"
                  aria-label="Slide kế tiếp"
                >
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5" />
                </button>

                <button
                  onClick={() => setIsPaused(p => !p)}
                  className="absolute top-2 right-2 md:top-3 md:right-3 bg-foreground/40 hover:bg-foreground/70 text-primary-foreground p-1.5 rounded-full opacity-60 md:opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity z-[6]"
                  aria-label={isPaused ? 'Tiếp tục' : 'Tạm dừng'}
                >
                  {isPaused ? <Play className="h-3.5 w-3.5" /> : <Pause className="h-3.5 w-3.5" />}
                </button>

                {/* Dots */}
                <div className="absolute bottom-2.5 right-3 md:right-4 flex gap-1.5 z-[6]">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => goTo(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === current
                          ? 'bg-accent w-6 shadow'
                          : 'bg-primary-foreground/50 w-2 hover:bg-primary-foreground/80'
                      }`}
                      aria-label={`Slide ${i + 1}`}
                      aria-current={i === current}
                    />
                  ))}
                </div>

                {/* Progress bar */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-foreground/20 z-[6]">
                  <div
                    className="h-full bg-accent ease-linear"
                    style={{ width: `${progress}%`, transition: isPaused ? 'none' : 'width 100ms linear' }}
                  />
                </div>
              </>
            )}
          </div>

          {/* Side banners — full width, no rounded corners for edge-to-edge look */}
          <div className="grid grid-cols-2 md:grid-cols-1 gap-0 md:content-between">
            {sideBanners.slice(0, 2).map((b, i) => (
              <Link
                key={i}
                to={b.href}
                className="relative w-full aspect-[16/9] sm:aspect-[16/8] md:aspect-auto md:h-[calc(50%)] overflow-hidden shadow-lg group block"
              >
                <img
                  src={b.image}
                  alt={b.title}
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-l from-foreground/75 via-foreground/30 to-transparent" />
                <div
                  className="absolute text-right max-w-[75%]"
                  style={{
                    top: 'clamp(0.5rem, 6%, 1rem)',
                    right: 'clamp(0.5rem, 6%, 1rem)',
                  }}
                >
                  <p
                    className="text-accent font-black leading-tight drop-shadow-lg"
                    style={{ fontSize: 'clamp(0.75rem, 1.6vw, 1.5rem)' }}
                  >
                    {b.title}
                  </p>
                  {b.subtitle && (
                    <p
                      className="text-primary-foreground font-bold drop-shadow"
                      style={{ fontSize: 'clamp(0.5625rem, 0.9vw, 0.875rem)' }}
                    >
                      {b.subtitle}
                    </p>
                  )}
                  {b.price && (
                    <p
                      className="text-accent font-black drop-shadow"
                      style={{ fontSize: 'clamp(0.875rem, 1.4vw, 1.25rem)', marginTop: '0.125rem' }}
                    >
                      {b.price}
                    </p>
                  )}
                </div>
                {b.badge && (
                  <span
                    className="absolute bg-coral text-primary-foreground font-bold rounded-full shadow whitespace-nowrap"
                    style={{
                      bottom: 'clamp(0.375rem, 5%, 0.75rem)',
                      right: 'clamp(0.5rem, 6%, 1rem)',
                      fontSize: 'clamp(0.5rem, 0.75vw, 0.75rem)',
                      paddingInline: 'clamp(0.375rem, 0.8vw, 0.75rem)',
                      paddingBlock: 'clamp(0.125rem, 0.3vw, 0.25rem)',
                    }}
                  >
                    {b.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* Bottom banners — full width, 50/50 split, edge to edge */}
        <div className="grid grid-cols-2 gap-0 mt-0">
          {bottomBanners.slice(0, 2).map((b, i) => (
            <Link
              key={i}
              to={b.href}
              className="relative w-full aspect-[16/5] sm:aspect-[16/4.5] md:aspect-[16/4] overflow-hidden shadow-lg group block"
            >
              <img
                src={b.image}
                alt={b.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-foreground/75 via-foreground/30 to-transparent" />
              <div
                className="absolute inset-0 flex flex-col justify-center"
                style={{ paddingInline: 'clamp(0.625rem, 2.5vw, 1.5rem)' }}
              >
                <p
                  className="text-accent font-black leading-tight drop-shadow-lg"
                  style={{ fontSize: 'clamp(0.75rem, 1.8vw, 1.5rem)' }}
                >
                  {b.title}
                </p>
                {b.subtitle && (
                  <p
                    className="text-primary-foreground font-medium drop-shadow line-clamp-1"
                    style={{ fontSize: 'clamp(0.5625rem, 1vw, 0.875rem)' }}
                  >
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
