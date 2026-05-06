import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useProducts } from '@/hooks/useProducts';
import { useSiteContent } from '@/hooks/useSiteContent';
import { formatPrice } from '@/data/products';

const DEFAULT_HERO_BG = { type: 'image' as const, url: 'https://images.unsplash.com/photo-1559825481-12a05cc00344?w=1920', poster: '' };
type HeroBg = { type: 'image' | 'video'; url: string; poster?: string };

function useCountdown() {
  const [time, setTime] = useState('00:00:00');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const end = new Date(now);
      end.setHours(23, 59, 59, 999);
      const diff = Math.max(0, end.getTime() - now.getTime());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function useStat(min: number, max: number, intervalMs = 10000) {
  const [val, setVal] = useState(() => Math.floor(Math.random() * (max - min + 1)) + min);
  useEffect(() => {
    const id = setInterval(() => setVal(Math.floor(Math.random() * (max - min + 1)) + min), intervalMs);
    return () => clearInterval(id);
  }, [min, max, intervalMs]);
  return val;
}

function useCounter(target: number, start: boolean, duration = 1500) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!start) return;
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      setVal(Math.floor(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, start, duration]);
  return val;
}

const STATS = [
  { value: 50000, suffix: '+', label: 'Đơn hàng giao thành công' },
  { value: 10000, suffix: '+', label: 'Khách tin tưởng' },
  { value: 49, suffix: '/5', label: 'Đánh giá', divisor: 10 },
  { value: 99, suffix: '%', label: 'Hài lòng' },
];

function StatItem({ s, start }: { s: typeof STATS[number]; start: boolean }) {
  const v = useCounter(s.value, start);
  const display = s.divisor ? (v / s.divisor).toFixed(1) : v.toLocaleString('en-US');
  return (
    <div className="text-center px-2">
      <p className="text-accent font-black" style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)' }}>
        {display}{s.suffix}
      </p>
      <p className="text-primary-foreground/90 text-xs md:text-sm mt-1">{s.label}</p>
    </div>
  );
}

export default function HeroBanner() {
  const { products } = useProducts();
  const featured = products.slice(0, 3);
  const countdown = useCountdown();
  const viewers = useStat(15, 35);
  const { data: heroBg } = useSiteContent<HeroBg>('hero_background', DEFAULT_HERO_BG);
  const [scrollY, setScrollY] = useState(0);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const el = statsRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsVisible(true); obs.disconnect(); }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollDown = () => {
    window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
  };

  return (
    <>
      <section
        className="relative overflow-hidden"
        style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          height: '100vh',
          minHeight: '600px',
        }}
      >
        {/* Background image/video with parallax */}
        <div
          className="absolute inset-0 will-change-transform"
          style={{ transform: `translateY(${scrollY * 0.5}px)` }}
        >
          {heroBg?.type === 'video' ? (
            <video
              src={heroBg.url}
              poster={heroBg.poster || undefined}
              autoPlay
              muted
              loop
              playsInline
              preload="auto"
              className="w-full h-full object-cover object-center"
            />
          ) : (
            <img
              src={heroBg?.url || DEFAULT_HERO_BG.url}
              alt="Hải sản khô Sầm Sơn"
              className="w-full h-full object-cover object-center"
              loading="eager"
            />
          )}
        </div>

        {/* Gradient overlays */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.2) 100%)',
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 40%)',
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex items-center">
          <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8">
            <div className="grid grid-cols-1 md:grid-cols-[55%_45%] gap-8 items-center">
              {/* LEFT */}
              <div className="text-center md:text-left">
                {/* Badge */}
                <div
                  className="inline-flex items-center gap-2 rounded-full text-white text-[13px] animate-fade-in"
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    WebkitBackdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.3)',
                    padding: '6px 16px',
                    animationDelay: '0.3s',
                    animationFillMode: 'backwards',
                  }}
                >
                  <span>⭐</span>
                  <span>Được tin dùng bởi 10,000+ gia đình Việt</span>
                </div>

                {/* Title */}
                <h1
                  className="font-extrabold text-white mt-5 animate-fade-in"
                  style={{
                    fontSize: 'clamp(2.25rem, 6vw, 4.25rem)',
                    lineHeight: 1.1,
                    fontWeight: 800,
                  }}
                >
                  Hải Sản Khô
                  <br />
                  <span style={{ color: '#f59e0b' }}>Sầm Sơn Chính Gốc</span>
                </h1>

                {/* Subtitle */}
                <p
                  className="mt-5 animate-fade-in"
                  style={{
                    fontSize: 'clamp(0.95rem, 1.6vw, 1.125rem)',
                    color: 'rgba(255,255,255,0.85)',
                    animationDelay: '0.2s',
                    animationFillMode: 'backwards',
                  }}
                >
                  Đánh bắt mỗi sáng · Phơi tự nhiên · Giao tận nhà toàn quốc
                </p>

                {/* Trust badges */}
                <div
                  className="flex flex-wrap gap-2.5 mt-6 justify-center md:justify-start animate-fade-in"
                  style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
                >
                  {['✅ Kiểm định VSATTP', '🚚 Freeship từ 500k', '🔄 Đổi trả 7 ngày'].map(t => (
                    <span
                      key={t}
                      className="text-white text-[13px] rounded-lg"
                      style={{
                        background: 'rgba(255,255,255,0.1)',
                        backdropFilter: 'blur(4px)',
                        WebkitBackdropFilter: 'blur(4px)',
                        padding: '8px 14px',
                      }}
                    >
                      {t}
                    </span>
                  ))}
                </div>

                {/* CTAs */}
                <div
                  className="flex flex-col sm:flex-row gap-4 mt-8 animate-fade-in justify-center md:justify-start"
                  style={{ animationDelay: '0.6s', animationFillMode: 'backwards' }}
                >
                  <Link
                    to="/san-pham"
                    className="inline-flex items-center justify-center text-white font-bold rounded-[10px] hover-scale hero-glow"
                    style={{
                      background: '#f59e0b',
                      padding: '16px 36px',
                      fontSize: '17px',
                      boxShadow: '0 4px 20px rgba(245,158,11,0.5)',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#d97706')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#f59e0b')}
                  >
                    🛒 Mua Ngay
                  </Link>
                  <a
                    href="tel:0933562286"
                    className="inline-flex items-center justify-center text-white font-semibold rounded-[10px] transition-colors"
                    style={{
                      background: 'transparent',
                      border: '2px solid rgba(255,255,255,0.7)',
                      padding: '14px 36px',
                      fontSize: '17px',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                  >
                    📞 Tư Vấn Ngay
                  </a>
                </div>

                {/* Countdown */}
                <p
                  className="text-white/85 text-sm mt-4 animate-fade-in"
                  style={{ animationDelay: '0.7s', animationFillMode: 'backwards' }}
                >
                  ⏰ Ưu đãi kết thúc sau: <span className="font-mono font-bold text-accent">{countdown}</span>
                </p>
              </div>

              {/* RIGHT — glass card (hidden on mobile) */}
              <div
                className="hidden md:block animate-slide-in-right"
                style={{ animationDelay: '0.4s', animationFillMode: 'backwards' }}
              >
                <div
                  className="rounded-[20px]"
                  style={{
                    background: 'rgba(255,255,255,0.12)',
                    backdropFilter: 'blur(20px)',
                    WebkitBackdropFilter: 'blur(20px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    padding: '28px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                  }}
                >
                  <h3 className="text-white font-bold text-base mb-4">
                    🏆 Sản Phẩm Nổi Bật Tuần Này
                  </h3>
                  <div className="flex flex-col gap-2">
                    {featured.map((p, idx) => {
                      const op = (p as any).originalPrice ?? (p as any).oldPrice;
                      const discount =
                        op && op > p.price
                          ? Math.round(((op - p.price) / op) * 100)
                          : [20, 15, 10][idx] || 10;
                      return (
                        <Link
                          key={p.id}
                          to={`/san-pham/${p.id}`}
                          className="flex items-center gap-3 rounded-[10px] hover:bg-white/15 transition-colors"
                          style={{ background: 'rgba(255,255,255,0.08)', padding: '12px' }}
                        >
                          <img
                            src={p.images?.[0] || ''}
                            alt={p.name}
                            className="w-12 h-12 object-cover rounded-md flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-white font-semibold text-sm truncate">{p.name}</p>
                              <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0">
                                -{discount}%
                              </span>
                            </div>
                            <p className="text-accent text-xs font-bold mt-0.5">{formatPrice(p.price)}</p>
                            {idx === 0 && (
                              <p className="text-white/70 text-[10px] mt-1">🔥 Bán Chạy #1</p>
                            )}
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                  <p className="text-accent text-[13px] mt-3 text-center">
                    🔥 {viewers} người đang xem sản phẩm này
                  </p>
                  <Link
                    to="/san-pham"
                    className="block w-full text-center text-white font-semibold rounded-[10px] mt-4 transition-opacity hover:opacity-90"
                    style={{ background: '#0f766e', padding: '12px' }}
                  >
                    Xem Tất Cả Sản Phẩm →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll down indicator */}
        {scrollY < 100 && (
          <button
            onClick={scrollDown}
            className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 text-white/80 hover:text-white"
            style={{ animation: 'hero-bounce 1.5s infinite' }}
            aria-label="Cuộn xuống"
          >
            <ChevronDown className="h-8 w-8" />
          </button>
        )}
      </section>

      {/* Stats bar */}
      <div
        ref={statsRef}
        style={{
          width: '100vw',
          marginLeft: 'calc(-50vw + 50%)',
          background: '#0f766e',
          padding: '20px 0',
        }}
      >
        <div className="max-w-[1280px] mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/20">
            {STATS.map(s => (
              <StatItem key={s.label} s={s} start={statsVisible} />
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes hero-bounce {
          0%, 100% { transform: translate(-50%, 0); }
          50% { transform: translate(-50%, -10px); }
        }
        @keyframes hero-glow-pulse {
          0%, 100% { box-shadow: 0 4px 20px rgba(245,158,11,0.5); }
          50% { box-shadow: 0 4px 30px rgba(245,158,11,0.85); }
        }
        .hero-glow { animation: hero-glow-pulse 3s ease-in-out infinite; }
      `}</style>
    </>
  );
}
