import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Tag } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

const DEFAULT_NEWS: NewsItem[] = [
  { id: '1', title: 'Mực khô loại đặc biệt – Vừa cập bến!', excerpt: 'Lô mực câu loại 1 vừa được ngư dân Sầm Sơn đưa về sáng nay.', content: ['Lô mực câu loại 1 vừa được ngư dân Sầm Sơn đưa về sáng nay. Mực thịt dày, ngọt tự nhiên, phơi nắng đủ ngày.', 'Số lượng có hạn, đặt hàng ngay để không bỏ lỡ!'], category: 'Hàng mới về', image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop', date: '02/04/2024', tag: 'MỚI' },
];

export default function NewsDetail() {
  const { id } = useParams();
  const { data: dbNews } = useSiteContent<NewsItem[] | null>('content_news', null);
  const newsItems = dbNews && dbNews.length > 0 ? dbNews : DEFAULT_NEWS;
  const news = newsItems.find(n => n.id === id);

  if (!news) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Không tìm thấy tin tức</p>
          <Link to="/tin-tuc" className="text-primary hover:underline mt-4 inline-block">← Quay lại</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const contentParagraphs = news.content && news.content.length > 0 ? news.content : [news.excerpt];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/tin-tuc" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Quay lại Tin tức
        </Link>

        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full">{news.category}</span>
          {news.tag && (
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${news.tag === 'HOT' ? 'bg-coral text-primary-foreground' : 'bg-accent text-accent-foreground'}`}>
              {news.tag}
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-3">{news.title}</h1>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {news.date}</span>
        </div>

        <img src={news.image} alt={news.title} className="w-full rounded-2xl mb-8 aspect-video object-cover" />

        <div className="prose prose-sm max-w-none space-y-4">
          {contentParagraphs.map((p, i) => (
            <p key={i} className="text-foreground/90 leading-relaxed">{p}</p>
          ))}
        </div>

        <div className="mt-10 ocean-gradient rounded-2xl p-8 text-center">
          <h2 className="text-xl font-black text-primary-foreground mb-3">Đặt hải sản ngay hôm nay!</h2>
          <Link to="/san-pham" className="inline-block bg-accent text-accent-foreground font-bold px-8 py-3 rounded-full hover:opacity-90">
            🛒 Mua ngay
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
