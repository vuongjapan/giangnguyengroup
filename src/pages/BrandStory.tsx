import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { CheckCircle, Award, Anchor, Sun, Heart, Fish } from 'lucide-react';
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

const DEFAULT_TIMELINE = [
  { year: '2014', title: 'Khởi đầu từ biển', desc: 'Gia đình ngư dân Sầm Sơn bắt đầu phơi mực, cá khô bán cho du khách.' },
  { year: '2017', title: 'Thương hiệu đầu tiên', desc: 'Chính thức thành lập GIANG NGUYEN SEAFOOD, mở cửa hàng tại Sầm Sơn.' },
  { year: '2019', title: 'Mở rộng toàn quốc', desc: 'Ship hàng toàn quốc, phục vụ hàng nghìn khách hàng từ Hà Nội đến TP.HCM.' },
  { year: '2021', title: 'Đạt chuẩn ATTP', desc: 'Được cấp chứng nhận An toàn Thực phẩm, quy trình sản xuất chuẩn.' },
  { year: '2023', title: 'Hệ thống 3 chi nhánh', desc: 'Mở thêm 2 chi nhánh tại Sầm Sơn, phục vụ du khách quanh năm.' },
  { year: '2024', title: 'Chuyển đổi số', desc: 'Ra mắt website bán hàng, AI chatbot tư vấn, QR truy xuất nguồn gốc.' },
];

const DEFAULT_VALUES = [
  { icon: '⚓', title: 'Chính gốc Sầm Sơn', desc: 'Mỗi sản phẩm đều từ biển Sầm Sơn, không pha trộn hàng nơi khác.' },
  { icon: '☀️', title: 'Phơi nắng tự nhiên', desc: 'Quy trình phơi nắng truyền thống trên giàn tre, không sấy công nghiệp.' },
  { icon: '❤️', title: 'Tâm huyết gia truyền', desc: 'Bí quyết chế biến được truyền lại qua nhiều thế hệ ngư dân.' },
  { icon: '🐟', title: 'Chọn lọc kỹ lưỡng', desc: 'Chỉ chọn những con hải sản tươi nhất, đạt chuẩn kích thước và chất lượng.' },
];

const DEFAULT_CERTS = [
  { icon: '🏅', title: 'Chứng nhận ATTP', desc: 'An toàn Thực phẩm' },
  { icon: '⭐', title: 'OCOP 4 sao', desc: 'Sản phẩm đặc trưng' },
  { icon: '🛡️', title: 'Tem chống giả', desc: 'QR truy xuất nguồn gốc' },
  { icon: '🏆', title: 'Top Thương hiệu', desc: 'Hải sản Sầm Sơn' },
];

export default function BrandStory() {
  const { data: dbBrand } = useSiteContent<BrandContent | null>('content_brand', null);

  const heroImage = dbBrand?.heroImage || 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=1920&h=600&fit=crop';
  const heroTitle = dbBrand?.heroTitle || 'Về Giang Nguyen Seafood';
  const heroSubtitle = dbBrand?.heroSubtitle || 'Hành trình từ ngư dân Sầm Sơn đến thương hiệu hải sản khô cao cấp số 1';
  const storyTitle = dbBrand?.storyTitle || 'Từ biển khơi đến bàn ăn';
  const storyParagraphs = dbBrand?.storyParagraphs?.length ? dbBrand.storyParagraphs : [
    'Sinh ra và lớn lên bên bờ biển Sầm Sơn, chúng tôi hiểu rõ từng con sóng, từng mùa cá. Mỗi ngày, khi tàu cá cập bến lúc rạng sáng, chúng tôi tự tay chọn lựa những con hải sản tươi ngon nhất – mực căng bóng, cá thu mắt trong, tôm đỏ au.',
    'Rồi nắng lên, từng mẻ hải sản được phơi trên giàn tre truyền thống, hứng trọn nắng gió biển Sầm Sơn. Không máy sấy, không hóa chất – chỉ có nắng, gió và tâm huyết của người làm nghề.',
    'Đó là cách mà Giang Nguyen Seafood ra đời – từ tình yêu biển cả, từ sự trân trọng hương vị tự nhiên, và từ mong muốn mang đặc sản biển Sầm Sơn đến mọi gia đình Việt.',
  ];
  const storyImage = dbBrand?.storyImage || 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&h=500&fit=crop';
  const yearsExp = dbBrand?.yearsExperience || '10+';
  const VALUES = dbBrand?.values?.length ? dbBrand.values : DEFAULT_VALUES;
  const TIMELINE = dbBrand?.timeline?.length ? dbBrand.timeline : DEFAULT_TIMELINE;
  const CERTS = dbBrand?.certifications?.length ? dbBrand.certifications : DEFAULT_CERTS;
  const ctaTitle = dbBrand?.ctaTitle || 'Trải nghiệm hương vị biển Sầm Sơn';
  const ctaDesc = dbBrand?.ctaDescription || 'Đặt hàng ngay hôm nay để thưởng thức hải sản khô chính gốc, phơi nắng tự nhiên';
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="relative h-64 md:h-96 overflow-hidden">
        <img src={heroImage} alt="Biển Sầm Sơn" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent" />
        <div className="absolute inset-0 flex items-center">
          <div className="container mx-auto px-4">
            <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">🏆 CÂU CHUYỆN THƯƠNG HIỆU</span>
            <h1 className="text-3xl md:text-5xl font-black text-primary-foreground leading-tight mb-2">{heroTitle}</h1>
            <p className="text-primary-foreground/80 text-sm md:text-base max-w-lg">{heroSubtitle}</p>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="section-title mb-4">{storyTitle}</h2>
              {storyParagraphs.map((p, i) => (
                <p key={i} className="text-muted-foreground leading-relaxed mb-4">{p}</p>
              ))}
            </div>
            <div className="relative">
              <img src={storyImage} alt="Phơi hải sản truyền thống" className="rounded-2xl shadow-xl w-full h-80 object-cover" loading="lazy" />
              <div className="absolute -bottom-4 -left-4 bg-accent text-accent-foreground rounded-xl px-5 py-3 shadow-lg hidden md:block">
                <p className="text-3xl font-black">{yearsExp}</p>
                <p className="text-xs font-bold">Năm kinh nghiệm</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core values */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="section-title mx-auto">Giá trị cốt lõi</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-card rounded-xl p-6 border border-border text-center card-hover">
                <div className="w-14 h-14 rounded-full ocean-gradient flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">{v.icon}</span>
                </div>
                <h3 className="font-bold text-foreground mb-2">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12 md:py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="section-title mx-auto">Hành trình phát triển</h2>
          </div>
          <div className="relative max-w-3xl mx-auto">
            <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-0.5 bg-primary/20 md:-translate-x-px" />
            {TIMELINE.map((item, i) => (
              <div key={item.year} className={`relative flex items-start gap-6 mb-10 ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}>
                <div className={`hidden md:block flex-1 ${i % 2 === 0 ? 'text-right pr-8' : 'text-left pl-8'}`}>
                  <span className="text-2xl font-black text-primary">{item.year}</span>
                  <h3 className="font-bold text-foreground mt-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </div>
                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-8 h-8 rounded-full ocean-gradient flex items-center justify-center shadow-md z-10">
                  <CheckCircle className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="md:hidden pl-14">
                  <span className="text-xl font-black text-primary">{item.year}</span>
                  <h3 className="font-bold text-foreground">{item.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                </div>
                <div className="hidden md:block flex-1" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-12 bg-secondary/30">
        <div className="container mx-auto px-4 text-center">
          <h2 className="section-title mx-auto mb-8">Chứng nhận & Giải thưởng</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {CERTS.map((cert) => (
              <div key={cert.title} className="bg-card rounded-xl p-5 border border-border card-hover">
                <span className="text-3xl">{cert.icon}</span>
                <h3 className="font-bold text-foreground mt-2 text-sm">{cert.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="ocean-gradient py-10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-3xl font-black text-primary-foreground mb-3">{ctaTitle}</h2>
          <p className="text-primary-foreground/80 mb-6 max-w-lg mx-auto">{ctaDesc}</p>
          <a href="/" className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
            🛒 Xem sản phẩm
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
