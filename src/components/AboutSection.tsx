import { ShoppingCart, Phone, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSiteContent } from '@/hooks/useSiteContent';

interface BrandContent {
  heroImage: string;
  heroTitle: string;
  heroSubtitle: string;
  storyTitle: string;
  storyParagraphs: string[];
  storyImage: string;
  yearsExperience: string;
  values: { icon: string; title: string; desc: string }[];
}

const HIGHLIGHTS = [
  'Hơn 10 năm kinh nghiệm',
  'Nguồn gốc rõ ràng',
  'Chứng nhận VSATTP',
];

export default function AboutSection() {
  const { data: brand } = useSiteContent<BrandContent | null>('content_brand', null);

  const description = brand?.storyParagraphs?.[0] ||
    'Giang Nguyên Group là đơn vị hàng đầu chuyên cung cấp hải sản khô đặc sản biển Sầm Sơn – từ mực khô, cá khô đến hải sản 1 nắng cao cấp. Mỗi sản phẩm đều được tuyển chọn kỹ lưỡng, phơi nắng tự nhiên theo phương pháp truyền thống, đảm bảo giữ trọn hương vị biển nguyên bản.';
  const storyImage = brand?.storyImage || 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=800&h=600&fit=crop';
  const yearsExp = brand?.yearsExperience || '10+';

  return (
    <section className="py-12 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center max-w-6xl mx-auto">
          {/* Left: image with teal border frame */}
          <div className="relative">
            <div className="rounded-2xl overflow-hidden border-4 border-primary shadow-xl">
              <img
                src={storyImage}
                alt="Cửa hàng Giang Nguyên Seafood Sầm Sơn"
                className="w-full h-72 md:h-[420px] object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-5 -right-5 bg-accent text-accent-foreground rounded-2xl px-5 py-3 shadow-2xl hidden md:block">
              <p className="text-3xl font-black leading-none">{yearsExp}</p>
              <p className="text-xs font-semibold mt-1">Năm kinh nghiệm</p>
            </div>
          </div>

          {/* Right: content */}
          <div>
            <p className="inline-block text-primary text-xs md:text-sm font-bold uppercase tracking-[0.2em] mb-3">
              ── Về chúng tôi
            </p>
            <h2 className="text-2xl md:text-4xl font-black text-foreground leading-tight mb-4">
              Giang Nguyên Group<br />
              <span className="text-primary">Uy Tín Từ Biển Sầm Sơn</span>
            </h2>
            <p className="text-muted-foreground text-sm md:text-base mb-6 leading-relaxed">
              {description}
            </p>
            <div className="space-y-3 mb-7">
              {HIGHLIGHTS.map(h => (
                <div key={h} className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="h-4 w-4 text-primary" />
                  </div>
                  <span className="text-sm md:text-base text-foreground font-semibold">{h}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/gioi-thieu"
                className="ocean-gradient text-primary-foreground font-bold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-lg"
              >
                Tìm Hiểu Thêm
              </Link>
              <a
                href="#products"
                className="bg-accent text-accent-foreground font-bold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2 shadow-lg"
              >
                <ShoppingCart className="h-4 w-4" /> Đặt Hàng Ngay
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
