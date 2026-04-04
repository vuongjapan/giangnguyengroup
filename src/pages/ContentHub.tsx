import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, Clock, Eye, ChevronRight, BookOpen, ShieldCheck, Fish, Calendar } from 'lucide-react';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  image: string;
  readTime: string;
  views: number;
  date: string;
}

const CATEGORIES = ['Tất cả', 'Hướng dẫn chế biến', 'Phân biệt thật giả', 'Kinh nghiệm chọn hải sản', 'Tin tức mùa vụ'];

const ARTICLES: Article[] = [
  {
    id: '1', slug: 'phan-biet-muc-cau-vs-muc-cao',
    title: 'Phân biệt mực câu vs mực cào – Loại nào ngon hơn?',
    excerpt: 'Hướng dẫn chi tiết cách phân biệt mực câu và mực cào qua màu sắc, thớ thịt, mùi vị. Biết để chọn đúng hàng chất lượng.',
    category: 'Phân biệt thật giả', image: 'https://images.unsplash.com/photo-1565680018093-ebb6e46b0bbe?w=600&h=400&fit=crop',
    readTime: '5 phút', views: 2340, date: '20/03/2024',
  },
  {
    id: '2', slug: 'tom-kho-loai-nao-ngon',
    title: 'Tôm khô loại nào ngon? Bí quyết chọn tôm khô chuẩn Sầm Sơn',
    excerpt: 'So sánh các loại tôm khô trên thị trường, cách chọn tôm khô tươi ngon, không tẩm hóa chất.',
    category: 'Kinh nghiệm chọn hải sản', image: 'https://images.unsplash.com/photo-1565680018434-6ce838ebe6f0?w=600&h=400&fit=crop',
    readTime: '4 phút', views: 1856, date: '15/03/2024',
  },
  {
    id: '3', slug: 'cach-bao-quan-hai-san-kho',
    title: 'Cách bảo quản hải sản khô đúng chuẩn – Giữ ngon 6-8 tháng',
    excerpt: 'Hướng dẫn bảo quản mực khô, cá khô, tôm khô trong tủ lạnh và điều kiện thường đúng cách.',
    category: 'Hướng dẫn chế biến', image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&h=400&fit=crop',
    readTime: '3 phút', views: 3120, date: '10/03/2024',
  },
  {
    id: '4', slug: 'mua-muc-sam-son-2024',
    title: 'Mùa mực Sầm Sơn 2024 – Thời điểm nào mực ngon nhất?',
    excerpt: 'Tổng hợp lịch mùa vụ hải sản Sầm Sơn theo từng tháng, thời điểm vàng để mua hải sản tươi ngon.',
    category: 'Tin tức mùa vụ', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
    readTime: '6 phút', views: 4210, date: '05/03/2024',
  },
  {
    id: '5', slug: 'nuong-muc-kho-ngon',
    title: '5 cách nướng mực khô ngon nhất – Giòn ngoài mềm trong',
    excerpt: 'Bí quyết nướng mực khô giòn thơm từ nướng than hoa, nướng lò, nướng bếp gas và chiên giòn.',
    category: 'Hướng dẫn chế biến', image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    readTime: '4 phút', views: 5680, date: '28/02/2024',
  },
  {
    id: '6', slug: 'nhan-biet-hai-san-tam-hoa-chat',
    title: 'Cách nhận biết hải sản khô tẩm hóa chất – Đừng để bị lừa!',
    excerpt: 'Dấu hiệu nhận biết mực khô, cá khô bị tẩm lưu huỳnh, hóa chất tăng trọng qua mắt thường.',
    category: 'Phân biệt thật giả', image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&h=400&fit=crop',
    readTime: '5 phút', views: 3890, date: '22/02/2024',
  },
];

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
  'Hướng dẫn chế biến': BookOpen,
  'Phân biệt thật giả': ShieldCheck,
  'Kinh nghiệm chọn hải sản': Fish,
  'Tin tức mùa vụ': Calendar,
};

export default function ContentHub() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = ARTICLES.filter(a => {
    const matchCat = activeCategory === 'Tất cả' || a.category === activeCategory;
    const matchSearch = !searchQuery || a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero */}
      <section className="ocean-gradient py-12 md:py-16">
        <div className="container mx-auto px-4 text-center">
          <span className="inline-block bg-accent text-accent-foreground text-xs font-bold px-3 py-1 rounded-full mb-3">
            📚 THƯ VIỆN HẢI SẢN
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">
            Ẩm Thực Sầm Sơn
          </h1>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-6">
            Hướng dẫn chế biến, phân biệt thật giả, kinh nghiệm chọn hải sản và tin tức mùa vụ
          </p>
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm bài viết..."
              className="w-full pl-11 pr-4 py-3 rounded-full border-0 bg-card text-sm focus:outline-none focus:ring-2 focus:ring-accent"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Categories */}
      <div className="border-b border-border bg-card sticky top-0 z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-3 scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  activeCategory === cat ? 'ocean-gradient text-primary-foreground shadow-md' : 'bg-muted text-foreground hover:bg-primary/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Articles */}
      <main className="container mx-auto px-4 py-8 flex-1">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-extrabold text-foreground">
            {activeCategory === 'Tất cả' ? 'Tất cả bài viết' : activeCategory}
            <span className="text-sm font-normal text-muted-foreground ml-2">({filtered.length} bài)</span>
          </h2>
        </div>

        {/* Featured article */}
        {filtered.length > 0 && activeCategory === 'Tất cả' && !searchQuery && (
          <Link to={`/blog/${filtered[0].slug}`} className="block mb-8 group">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-card rounded-2xl overflow-hidden border border-border card-hover">
              <div className="aspect-video md:aspect-auto overflow-hidden">
                <img src={filtered[0].image} alt={filtered[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
              <div className="p-6 flex flex-col justify-center">
                <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit mb-3">{filtered[0].category}</span>
                <h3 className="text-xl md:text-2xl font-extrabold text-foreground mb-3 group-hover:text-primary transition-colors">{filtered[0].title}</h3>
                <p className="text-muted-foreground text-sm mb-4">{filtered[0].excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {filtered[0].readTime}</span>
                  <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {filtered[0].views.toLocaleString()} lượt xem</span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(activeCategory === 'Tất cả' && !searchQuery ? filtered.slice(1) : filtered).map(article => (
            <Link key={article.id} to={`/blog/${article.slug}`} className="group block">
              <div className="bg-card rounded-xl overflow-hidden border border-border card-hover h-full flex flex-col">
                <div className="aspect-video overflow-hidden">
                  <img src={article.image} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full w-fit mb-2">{article.category}</span>
                  <h3 className="font-bold text-foreground text-sm mb-2 line-clamp-2 group-hover:text-primary transition-colors flex-1">{article.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{article.excerpt}</p>
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readTime}</span>
                    <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-base mb-2">Không tìm thấy bài viết</p>
            <button onClick={() => { setActiveCategory('Tất cả'); setSearchQuery(''); }} className="text-primary hover:underline text-sm">
              Xem tất cả bài viết
            </button>
          </div>
        )}

        {/* CTA */}
        <section className="mt-12 ocean-gradient rounded-2xl p-8 text-center">
          <h2 className="text-xl md:text-2xl font-black text-primary-foreground mb-3">
            Muốn mua hải sản khô chính gốc Sầm Sơn?
          </h2>
          <p className="text-primary-foreground/80 mb-5 text-sm">
            Xem sản phẩm ngay – Ship toàn quốc – Đổi trả 24h
          </p>
          <Link to="/" className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
            👉 Mua ngay <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
