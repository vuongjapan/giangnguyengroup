import { ShoppingCart, Phone, CheckCircle } from 'lucide-react';
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
  timeline: { year: string; title: string; desc: string }[];
  certifications: { icon: string; title: string; desc: string }[];
  ctaTitle: string;
  ctaDescription: string;
}

const DEFAULT_HIGHLIGHTS = [
  'Hải sản khô đặc sản Sầm Sơn chính gốc',
  '100% tự nhiên, không hóa chất, không chất bảo quản',
  'Đóng gói đẹp, phù hợp biếu tặng & du lịch',
  'Uy tín – Chất lượng – Đúng giá',
  'Phơi nắng thật, quy trình truyền thống',
];

export default function AboutSection() {
  const { data: brand } = useSiteContent<BrandContent | null>('content_brand', null);

  const title = brand?.storyTitle || 'Giới thiệu Giang Nguyên Seafood';
  const description = brand?.storyParagraphs?.[0] || 
    'Chúng tôi là đơn vị chuyên cung cấp hải sản khô đặc sản biển Sầm Sơn – từ mực khô, cá khô đến các loại hải sản 1 nắng cao cấp. Mỗi sản phẩm đều được lựa chọn kỹ lưỡng, phơi nắng tự nhiên, đảm bảo giữ trọn hương vị biển.';
  const storyImage = brand?.storyImage || 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&h=400&fit=crop';
  const yearsExp = brand?.yearsExperience || '10+';
  const highlights = brand?.values?.length
    ? brand.values.map(v => v.desc)
    : DEFAULT_HIGHLIGHTS;

  return (
    <section className="py-10 md:py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="relative">
            <div className="rounded-2xl overflow-hidden shadow-xl border border-border">
              <img
                src={storyImage}
                alt="Cửa hàng Giang Nguyên Seafood Sầm Sơn"
                className="w-full h-64 md:h-80 object-cover"
                loading="lazy"
              />
            </div>
            <div className="absolute -bottom-4 -right-4 bg-accent text-accent-foreground rounded-xl px-4 py-3 shadow-lg hidden md:block">
              <p className="text-2xl font-black">{yearsExp}</p>
              <p className="text-xs font-medium">Năm kinh nghiệm</p>
            </div>
          </div>

          <div>
            <h2 className="section-title mb-4">{title}</h2>
            <p className="text-muted-foreground text-sm md:text-base mb-5 leading-relaxed">
              {description}
            </p>
            <div className="space-y-2.5 mb-6">
              {highlights.map(h => (
                <div key={h} className="flex items-start gap-2.5">
                  <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-foreground font-medium">{h}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <a href="#products" className="ocean-gradient text-primary-foreground font-bold px-6 py-3 rounded-full text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" /> Xem sản phẩm
              </a>
              <a href="tel:0986617939" className="border-2 border-primary text-primary font-bold px-6 py-3 rounded-full text-sm hover:bg-primary hover:text-primary-foreground transition-colors inline-flex items-center gap-2">
                <Phone className="h-4 w-4" /> Liên hệ
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
