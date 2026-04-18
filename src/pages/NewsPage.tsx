import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { breadcrumbLD } from '@/lib/seo';
import { Clock, ChevronRight, Sparkles, Tag, MessageCircle, Waves } from 'lucide-react';
import { useSiteContent } from '@/hooks/useSiteContent';

interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content?: string[];
  category: string;
  image: string;
  date: string;
  tag?: string;
}

const NEWS_CATEGORIES = ['Tất cả', 'Hàng mới về', 'Biển Sầm Sơn hôm nay', 'Khuyến mãi', 'Feedback khách'];

const DEFAULT_NEWS: NewsItem[] = [
  { id: '1', title: 'Mực khô loại đặc biệt – Vừa cập bến, số lượng có hạn!', excerpt: 'Lô mực câu loại 1 vừa được ngư dân Sầm Sơn đưa về sáng nay.', category: 'Hàng mới về', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop', date: '02/04/2024', tag: 'MỚI' },
  { id: '2', title: 'Cá thu 1 nắng size lớn – Nhập kho tháng 4', excerpt: 'Cá thu 1 nắng size 400-600g/con vừa nhập kho.', category: 'Hàng mới về', image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&h=400&fit=crop', date: '01/04/2024', tag: 'MỚI' },
  { id: '3', title: 'Biển Sầm Sơn đẹp nhất tháng 4 – Mùa du lịch bắt đầu', excerpt: 'Tháng 4 biển Sầm Sơn trong xanh, sóng êm.', category: 'Biển Sầm Sơn hôm nay', image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop', date: '30/03/2024' },
  { id: '4', title: 'Sầm Sơn mùa biển động – Ngư dân vẫn ra khơi', excerpt: 'Dù biển có lúc động, ngư dân vẫn kiên cường ra khơi.', category: 'Biển Sầm Sơn hôm nay', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop', date: '28/03/2024' },
  { id: '5', title: '🔥 Flash Sale tháng 4 – Giảm 15% combo quà biếu', excerpt: 'Nhân dịp đầu tháng 4, giảm 15% tất cả combo quà biếu.', category: 'Khuyến mãi', image: 'https://images.unsplash.com/photo-1565680018093-ebb6e46b0bbe?w=600&h=400&fit=crop', date: '01/04/2024', tag: 'HOT' },
  { id: '6', title: 'Mua 2 tặng 1 Nem chua Thanh Hóa – Chỉ tuần này', excerpt: 'Đặt từ 2 sản phẩm bất kỳ, tặng ngay 1 gói Nem chua.', category: 'Khuyến mãi', image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&h=400&fit=crop', date: '01/04/2024', tag: 'HOT' },
  { id: '7', title: 'Chị Hương (Hà Nội): "Mực ngon nhất từng mua online!"', excerpt: '"Lần đầu đặt thử 1kg mực câu, không ngờ ngon hơn cả ngoài chợ."', category: 'Feedback khách', image: 'https://images.unsplash.com/photo-1565680018434-6ce838ebe6f0?w=600&h=400&fit=crop', date: '29/03/2024' },
  { id: '8', title: 'Anh Minh (Sài Gòn): "Ship nhanh, đóng gói cẩn thận"', excerpt: '"Mua lần thứ 3 rồi. Lần nào cũng hài lòng."', category: 'Feedback khách', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop', date: '27/03/2024' },
];

const CATEGORY_ICONS: Record<string, typeof Sparkles> = {
  'Hàng mới về': Sparkles,
  'Biển Sầm Sơn hôm nay': Waves,
  'Khuyến mãi': Tag,
  'Feedback khách': MessageCircle,
};

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const { data: dbNews } = useSiteContent<NewsItem[] | null>('content_news', null);

  const newsItems = dbNews && dbNews.length > 0 ? dbNews : DEFAULT_NEWS;
  const filtered = newsItems.filter(n => activeCategory === 'Tất cả' || n.category === activeCategory);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Tin tức Sầm Sơn & hải sản khô | Giang Nguyên Group"
        description="Hàng mới về, tin biển Sầm Sơn, khuyến mãi và feedback khách hàng. Cập nhật thường xuyên về thị trường hải sản khô."
        jsonLd={breadcrumbLD([
          { name: 'Trang chủ', url: '/' },
          { name: 'Tin tức', url: '/tin-tuc' },
        ])}
      />
      <Header />

      <section className="ocean-gradient py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">📰 TIN TỨC & SỰ KIỆN</span>
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">Tin tức Sầm Sơn & Giang Nguyên Group</h1>
          <p className="text-primary-foreground/80 max-w-lg mx-auto">Hàng mới về, tin biển, khuyến mãi và feedback khách hàng</p>
        </div>
      </section>

      <div className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {NEWS_CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat];
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${activeCategory === cat ? 'ocean-gradient text-primary-foreground shadow-md' : 'bg-muted text-foreground hover:bg-primary/10'}`}>
                  {Icon && <Icon className="h-3 w-3" />}{cat}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 flex-1">
        <h2 className="text-lg font-extrabold text-foreground mb-6">
          {activeCategory === 'Tất cả' ? 'Tất cả tin tức' : activeCategory}
          <span className="text-sm font-normal text-muted-foreground ml-2">({filtered.length} tin)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(news => (
            <Link key={news.id} to={`/tin-tuc/${news.id}`} className="bg-card rounded-xl overflow-hidden border border-border card-hover h-full flex flex-col group">
              <div className="aspect-video overflow-hidden relative">
                <img src={news.image} alt={news.title} width={600} height={400} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                {news.tag && (
                  <span className={`absolute top-3 left-3 text-[10px] font-bold px-2.5 py-1 rounded-full ${news.tag === 'HOT' ? 'bg-coral text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
                    {news.tag}
                  </span>
                )}
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{news.category}</span>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> {news.date}</span>
                </div>
                <h3 className="font-bold text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors flex-1">{news.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-3">{news.excerpt}</p>
                <span className="text-xs font-bold text-primary mt-3 inline-block">Đọc tiếp →</span>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-base mb-2">Chưa có tin tức</p>
            <button onClick={() => setActiveCategory('Tất cả')} className="text-primary hover:underline text-sm">Xem tất cả</button>
          </div>
        )}

        <section className="mt-12 ocean-gradient rounded-2xl p-8 text-center">
          <h2 className="text-xl md:text-2xl font-black text-primary-foreground mb-3">Đặt hải sản Sầm Sơn ngay hôm nay!</h2>
          <p className="text-primary-foreground/80 mb-5 text-sm">Hàng mới về liên tục – Ship toàn quốc – Cam kết chất lượng</p>
          <Link to="/san-pham" className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
            👉 Mua ngay <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
