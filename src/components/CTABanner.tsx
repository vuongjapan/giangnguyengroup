import { Link } from 'react-router-dom';
import { Phone, ShoppingCart } from 'lucide-react';

export default function CTABanner() {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #0f766e 0%, #0369a1 100%)',
        paddingTop: '60px',
        paddingBottom: '60px',
      }}
    >
      {/* Wave pattern overlay */}
      <svg
        className="absolute inset-x-0 bottom-0 w-full opacity-10 pointer-events-none"
        viewBox="0 0 1440 320"
        preserveAspectRatio="none"
        style={{ height: '120px' }}
        aria-hidden
      >
        <path
          fill="#ffffff"
          d="M0,224L48,213.3C96,203,192,181,288,181.3C384,181,480,203,576,202.7C672,203,768,181,864,170.7C960,160,1056,160,1152,176C1248,192,1344,224,1392,240L1440,256L1440,320L0,320Z"
        />
      </svg>
      {/* Decorative bubbles */}
      <div className="absolute top-6 left-[8%] w-24 h-24 rounded-full bg-white/10 blur-xl" />
      <div className="absolute bottom-10 right-[10%] w-32 h-32 rounded-full bg-white/10 blur-xl" />

      <div className="container mx-auto px-4 relative z-10 text-center">
        <h2 className="text-2xl md:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight drop-shadow-lg">
          🎁 ĐẶT HÀNG NGAY – NHẬN ƯU ĐÃI ĐẶC BIỆT
        </h2>
        <p className="text-white/90 text-sm md:text-lg mb-7 max-w-2xl mx-auto">
          Freeship toàn quốc <span className="opacity-50">|</span> Giao trong 2-3 ngày <span className="opacity-50">|</span> Đổi trả 7 ngày
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 md:gap-4">
          <Link
            to="/san-pham"
            className="inline-flex items-center gap-2 bg-white text-primary font-black px-7 md:px-9 py-3.5 rounded-full text-sm md:text-base hover:scale-105 transition-transform shadow-2xl"
          >
            <ShoppingCart className="h-4 w-4 md:h-5 md:w-5" />
            Mua Ngay
          </Link>
          <a
            href="tel:0933562286"
            className="inline-flex items-center gap-2 bg-transparent border-2 border-white text-white font-black px-7 md:px-9 py-3.5 rounded-full text-sm md:text-base hover:bg-white hover:text-primary transition-colors"
          >
            <Phone className="h-4 w-4 md:h-5 md:w-5" />
            Liên Hệ Tư Vấn
          </a>
        </div>
      </div>
    </section>
  );
}
