import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Search, Clock, Eye, ChevronRight, BookOpen, ShieldCheck, Fish, Calendar, Compass, ShoppingCart, ArrowLeft } from 'lucide-react';
import { products as staticProducts, formatPrice } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useSiteContent } from '@/hooks/useSiteContent';

interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  image: string;
  readTime: string;
  views: number;
  date: string;
  relatedProductIds?: string[];
  relatedProductSlugs?: string[];
  metaTitle: string;
  metaDescription: string;
}

const CATEGORIES = ['Tất cả', 'Du lịch Sầm Sơn', 'Đặc sản biển', 'Kinh nghiệm chọn hải sản'];

const ARTICLES: Article[] = [
  {
    id: '1', slug: 'top-5-diem-den-sam-son',
    title: 'Top 5 điểm đến không thể bỏ lỡ khi du lịch Sầm Sơn 2024',
    excerpt: 'Khám phá những địa điểm du lịch hấp dẫn nhất tại Sầm Sơn – từ bãi biển hoang sơ đến chợ hải sản tươi sống.',
    content: [
      'Sầm Sơn không chỉ có biển đẹp mà còn ẩn chứa nhiều điều thú vị. Từ bãi biển trải dài đến những ngôi đền cổ kính, mỗi góc Sầm Sơn đều mang một câu chuyện riêng.',
      'Bãi biển Sầm Sơn trải dài hơn 6km với cát trắng mịn, nước trong xanh. Đây là điểm đến lý tưởng cho gia đình vào mùa hè.',
      'Đền Độc Cước – ngôi đền linh thiêng trên núi Trường Lệ, nơi giao hòa giữa biển và núi. Từ đây nhìn xuống, toàn cảnh Sầm Sơn hiện ra tuyệt đẹp.',
      'Chợ hải sản Sầm Sơn – thiên đường ẩm thực với hàng trăm loại hải sản tươi sống và khô. Đừng quên mua mực khô làm quà!',
      'Hòn Trống Mái – biểu tượng của tình yêu vĩnh cửu, điểm check-in không thể thiếu khi đến Sầm Sơn.',
    ],
    category: 'Du lịch Sầm Sơn',
    image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&h=400&fit=crop',
    readTime: '6 phút', views: 8420, date: '25/03/2024',
    relatedProductIds: ['muc-kho-loai-1', 'ca-thu-1-nang'],
    metaTitle: 'Top 5 điểm đến Sầm Sơn 2024 | Giang Nguyen Seafood',
    metaDescription: 'Khám phá 5 điểm du lịch hấp dẫn nhất Sầm Sơn 2024 và mua đặc sản biển làm quà.',
  },
  {
    id: '2', slug: 'cho-hai-san-sam-son-mua-gi',
    title: 'Đi chợ hải sản Sầm Sơn – Nên mua gì? Giá bao nhiêu?',
    excerpt: 'Hướng dẫn chi tiết cách đi chợ hải sản Sầm Sơn, mua gì ngon, giá cả ra sao, tránh bị chặt chém.',
    content: [
      'Chợ hải sản Sầm Sơn là điểm đến bắt buộc của mọi du khách. Tuy nhiên, không phải ai cũng biết cách chọn hàng ngon giá tốt.',
      'Mực khô – đặc sản số 1 Sầm Sơn. Giá dao động 800.000 – 1.500.000đ/kg tùy loại. Mực câu ngon hơn mực cào, thịt dày, ngọt tự nhiên.',
      'Cá thu 1 nắng – loại cá được phơi 1 nắng giữ nguyên độ tươi. Giá khoảng 200.000 – 350.000đ/kg. Nướng than hoa ăn cực kỳ ngon.',
      'Tôm khô – lựa tôm màu hồng tự nhiên, không quá đỏ (tẩm hóa chất). Giá khoảng 600.000 – 900.000đ/kg.',
      'Mẹo: Nên đi chợ sáng sớm (5-7h) để mua hàng tươi nhất, giá tốt nhất. Tránh mua hàng ven đường, dễ bị nâng giá.',
    ],
    category: 'Du lịch Sầm Sơn',
    image: 'https://images.unsplash.com/photo-1534482421-64566f976cfa?w=600&h=400&fit=crop',
    readTime: '5 phút', views: 6230, date: '22/03/2024',
    relatedProductIds: ['muc-kho-loai-1', 'tom-kho-boc-noi'],
    metaTitle: 'Chợ hải sản Sầm Sơn mua gì? Giá bao nhiêu? | Giang Nguyen Seafood',
    metaDescription: 'Hướng dẫn mua hải sản Sầm Sơn đúng giá, chọn hàng ngon, tránh bị chặt chém.',
  },
  {
    id: '3', slug: 'phan-biet-muc-cau-vs-muc-cao',
    title: 'Phân biệt mực câu vs mực cào – Loại nào ngon hơn?',
    excerpt: 'Hướng dẫn chi tiết cách phân biệt mực câu và mực cào qua màu sắc, thớ thịt, mùi vị. Biết để chọn đúng hàng chất lượng.',
    content: [
      'Mực câu và mực cào là 2 loại phổ biến nhất trên thị trường. Tuy nhiên, chất lượng và giá cả khác nhau rất nhiều.',
      'Mực câu: Câu bằng tay, con nguyên vẹn, thịt dày trắng ngà, mùi thơm tự nhiên. Khi nướng lên thơm phức, dai ngọt, nhai không bở.',
      'Mực cào: Dùng lưới kéo, con dễ bị dập nát, thịt mỏng hơn, có thể lẫn cát. Giá rẻ hơn 30-50% so với mực câu.',
      'Cách phân biệt: Mực câu có đốm nâu đều, thân tròn đầy. Mực cào thường bẹp, có vết xước, màu nhạt hơn.',
      'Lời khuyên: Nên chọn mực câu loại 1 nếu mua làm quà biếu. Mực cào phù hợp nấu cháo, xào bình thường.',
    ],
    category: 'Kinh nghiệm chọn hải sản',
    image: 'https://images.unsplash.com/photo-1565680018093-ebb6e46b0bbe?w=600&h=400&fit=crop',
    readTime: '5 phút', views: 4340, date: '20/03/2024',
    relatedProductIds: ['muc-kho-loai-1'],
    metaTitle: 'Phân biệt mực câu vs mực cào | Giang Nguyen Seafood',
    metaDescription: 'Cách phân biệt mực câu và mực cào qua màu sắc, thớ thịt. Biết để mua đúng hàng chất lượng.',
  },
  {
    id: '4', slug: 'cach-bao-quan-hai-san-kho',
    title: 'Cách bảo quản hải sản khô đúng chuẩn – Giữ ngon 6-8 tháng',
    excerpt: 'Hướng dẫn bảo quản mực khô, cá khô, tôm khô trong tủ lạnh và điều kiện thường đúng cách.',
    content: [
      'Hải sản khô nếu bảo quản đúng cách có thể giữ ngon từ 6-8 tháng mà không bị mất hương vị.',
      'Hút chân không: Cách tốt nhất để bảo quản lâu dài. Bọc kín, hút hết khí, cho vào ngăn đông tủ lạnh.',
      'Ngăn mát tủ lạnh: Bọc kín bằng túi zip hoặc hộp kín. Dùng trong 2-3 tháng.',
      'Nhiệt độ phòng: Để nơi khô ráo, thoáng mát, tránh ánh nắng. Dùng trong 1-2 tuần.',
      'Mẹo: Trước khi ăn, lấy ra rã đông tự nhiên 30 phút. Không ngâm nước nóng vì sẽ mất vị ngọt tự nhiên.',
    ],
    category: 'Kinh nghiệm chọn hải sản',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&h=400&fit=crop',
    readTime: '4 phút', views: 5120, date: '18/03/2024',
    relatedProductIds: ['muc-kho-loai-1', 'ca-thu-1-nang', 'tom-kho-boc-noi'],
    metaTitle: 'Cách bảo quản hải sản khô giữ ngon 6-8 tháng | Giang Nguyen Seafood',
    metaDescription: 'Bảo quản mực khô, cá khô, tôm khô đúng cách để giữ ngon lâu dài.',
  },
  {
    id: '5', slug: 'dac-san-muc-kho-sam-son',
    title: 'Vì sao mực khô Sầm Sơn nổi tiếng nhất Việt Nam?',
    excerpt: 'Tìm hiểu lý do mực khô Sầm Sơn được coi là đặc sản hàng đầu – từ nguồn nguyên liệu đến cách chế biến truyền thống.',
    content: [
      'Mực khô Sầm Sơn nổi tiếng khắp cả nước nhờ 3 yếu tố: nguồn mực tự nhiên, cách phơi truyền thống và vị ngọt đặc trưng.',
      'Nguồn mực: Mực được đánh bắt ngoài khơi biển Sầm Sơn, vùng nước sạch, giàu dinh dưỡng. Mực ở đây thịt dày, ngọt tự nhiên.',
      'Cách phơi: Ngư dân Sầm Sơn vẫn giữ cách phơi mực truyền thống – phơi dưới nắng biển tự nhiên, không sấy công nghiệp. Nhờ đó mực giữ được hương vị đặc trưng.',
      'Không hóa chất: Mực khô Sầm Sơn chính gốc không tẩm hóa chất, không chất bảo quản. Khi nướng lên thơm phức, nhai dai ngọt.',
      'Đây là lý do khách du lịch luôn chọn mực khô Sầm Sơn làm quà biếu người thân, đối tác.',
    ],
    category: 'Đặc sản biển',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
    readTime: '5 phút', views: 7650, date: '15/03/2024',
    relatedProductIds: ['muc-kho-loai-1'],
    metaTitle: 'Mực khô Sầm Sơn nổi tiếng nhất Việt Nam | Giang Nguyen Seafood',
    metaDescription: 'Vì sao mực khô Sầm Sơn được coi là đặc sản hàng đầu? Tìm hiểu nguồn gốc và cách chế biến truyền thống.',
  },
  {
    id: '6', slug: 'ca-thu-1-nang-dac-san-moi',
    title: 'Cá thu 1 nắng – Đặc sản mới nổi đang "hot" nhất Sầm Sơn',
    excerpt: 'Cá thu 1 nắng là gì? Tại sao ai đến Sầm Sơn cũng phải mua? Bí quyết nướng cá thu 1 nắng ngon nhất.',
    content: [
      'Cá thu 1 nắng đang trở thành đặc sản được yêu thích nhất Sầm Sơn trong 2 năm gần đây.',
      '1 nắng nghĩa là cá chỉ phơi 1 nắng duy nhất – giữ được 70% độ tươi của cá sống. Thịt cá vẫn mềm, ngọt, không bị khô cứng.',
      'Cách chế biến phổ biến nhất: Nướng than hoa hoặc nướng lò. Cá nướng xong da giòn, thịt bên trong mềm tan, chấm muối ớt xanh.',
      'Giá cá thu 1 nắng dao động 200.000-350.000đ/kg. Nên chọn con 300-500g, thịt dày, mắt trong, mùi tanh nhẹ tự nhiên.',
      'Tip: Mua cá thu 1 nắng hút chân không mang về, cho ngăn đông, để được 3-4 tháng mà vẫn ngon.',
    ],
    category: 'Đặc sản biển',
    image: 'https://images.unsplash.com/photo-1615141982883-c7ad0e69fd62?w=600&h=400&fit=crop',
    readTime: '4 phút', views: 5890, date: '12/03/2024',
    relatedProductIds: ['ca-thu-1-nang'],
    metaTitle: 'Cá thu 1 nắng Sầm Sơn – Đặc sản hot nhất | Giang Nguyen Seafood',
    metaDescription: 'Cá thu 1 nắng là gì? Vì sao hot? Bí quyết nướng ngon và cách chọn mua chuẩn.',
  },
  {
    id: '7', slug: 'nhan-biet-hai-san-tam-hoa-chat',
    title: 'Cách nhận biết hải sản khô tẩm hóa chất – Đừng để bị lừa!',
    excerpt: 'Dấu hiệu nhận biết mực khô, cá khô bị tẩm lưu huỳnh, hóa chất tăng trọng qua mắt thường.',
    content: [
      'Hải sản khô tẩm hóa chất là vấn nạn lớn trên thị trường. Biết cách phân biệt giúp bạn bảo vệ sức khỏe gia đình.',
      'Dấu hiệu 1 – Màu sắc: Mực khô tẩm hóa chất thường có màu đỏ cam bắt mắt, bóng đều. Mực sạch có màu nâu hồng tự nhiên, không đều.',
      'Dấu hiệu 2 – Mùi: Hải sản sạch có mùi tanh nhẹ đặc trưng. Hàng tẩm hóa chất có mùi hắc, mùi lưu huỳnh hoặc không có mùi gì.',
      'Dấu hiệu 3 – Độ ẩm: Hàng tẩm chất tăng trọng thường nặng hơn bình thường, bề mặt ẩm ướt, dính tay.',
      'Lời khuyên: Luôn mua từ nguồn uy tín, có cam kết chất lượng. Giang Nguyen Seafood cam kết 100% hải sản sạch, hoàn tiền nếu phát hiện hóa chất.',
    ],
    category: 'Kinh nghiệm chọn hải sản',
    image: 'https://images.unsplash.com/photo-1565680018434-6ce838ebe6f0?w=600&h=400&fit=crop',
    readTime: '5 phút', views: 9120, date: '08/03/2024',
    relatedProductIds: ['muc-kho-loai-1', 'tom-kho-boc-noi'],
    metaTitle: 'Nhận biết hải sản tẩm hóa chất | Giang Nguyen Seafood',
    metaDescription: 'Cách phân biệt hải sản khô sạch và tẩm hóa chất qua màu sắc, mùi vị, độ ẩm.',
  },
  {
    id: '8', slug: 'tom-kho-sam-son-ngon-nhat',
    title: 'Tôm khô Sầm Sơn – Loại nào ngon nhất? Bí quyết chọn mua',
    excerpt: 'So sánh các loại tôm khô, cách phân biệt tôm khô tự nhiên vs tẩm màu, và bí quyết chọn mua chuẩn.',
    content: [
      'Tôm khô Sầm Sơn có nhiều loại khác nhau: tôm bóc nõn, tôm nguyên vỏ, tôm sú khô. Mỗi loại phù hợp với mục đích sử dụng khác nhau.',
      'Tôm bóc nõn: Loại cao cấp nhất, đã bóc vỏ sẵn, thịt tôm nguyên con. Phù hợp ăn trực tiếp, nấu cháo, làm bánh.',
      'Tôm nguyên vỏ: Giá rẻ hơn, phù hợp nấu nước dùng, xào, rim. Vỏ tôm cho nước ngọt tự nhiên.',
      'Cách chọn: Tôm sạch có màu hồng tự nhiên, cong đều, mùi thơm nhẹ. Tôm tẩm màu có màu đỏ chót, mùi hắc.',
      'Mẹo bảo quản: Tôm khô để ngăn đông, dùng được 6 tháng. Mỗi lần lấy ra bao nhiêu dùng bấy nhiêu.',
    ],
    category: 'Đặc sản biển',
    image: 'https://images.unsplash.com/photo-1565680018093-ebb6e46b0bbe?w=600&h=400&fit=crop',
    readTime: '4 phút', views: 4560, date: '05/03/2024',
    relatedProductIds: ['tom-kho-boc-noi'],
    metaTitle: 'Tôm khô Sầm Sơn loại nào ngon nhất | Giang Nguyen Seafood',
    metaDescription: 'So sánh các loại tôm khô Sầm Sơn. Cách chọn mua tôm khô sạch, không hóa chất.',
  },
];

const CATEGORY_ICONS: Record<string, typeof BookOpen> = {
  'Du lịch Sầm Sơn': Compass,
  'Đặc sản biển': Fish,
  'Kinh nghiệm chọn hải sản': ShieldCheck,
};

export default function ContentHub() {
  const { slug } = useParams();
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const { addItem } = useCart();
  const { products: dbProducts } = useProducts();
  const { data: dbArticles } = useSiteContent<Article[] | null>('content_blog', null);

  const allProducts = dbProducts.length > 0 ? dbProducts : staticProducts;
  const ARTICLES_LIST = dbArticles && dbArticles.length > 0 ? dbArticles : ARTICLES;

  // Article detail view
  const article = slug ? ARTICLES_LIST.find(a => a.slug === slug) : null;

  if (article) {
    const relatedProducts = allProducts.filter(p =>
      (article.relatedProductSlugs && article.relatedProductSlugs.includes(p.slug)) ||
      (article.relatedProductIds && article.relatedProductIds.includes(p.id))
    );
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8 flex-1 max-w-3xl">
          <Link to="/blog" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
            <ArrowLeft className="h-4 w-4" /> Quay lại Blog
          </Link>
          <span className="block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit mb-3">{article.category}</span>
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-3">{article.title}</h1>
          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {article.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {article.readTime}</span>
            <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {article.views.toLocaleString()} lượt xem</span>
          </div>
          <img src={article.image} alt={article.title} className="w-full rounded-2xl mb-8 aspect-video object-cover" />
          <div className="prose prose-sm max-w-none space-y-4">
            {article.content.map((p, i) => (
              <p key={i} className="text-foreground/90 leading-relaxed">{p}</p>
            ))}
          </div>

          {/* Related products CTA */}
          {relatedProducts.length > 0 && (
            <div className="mt-10 bg-primary/5 rounded-2xl p-6 border border-primary/20">
              <h3 className="text-lg font-extrabold text-foreground mb-1">🛒 Sản phẩm liên quan</h3>
              <p className="text-sm text-muted-foreground mb-4">Mua ngay hải sản chính gốc Sầm Sơn – Ship toàn quốc</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relatedProducts.map(p => (
                  <div key={p.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                    <Link to={`/product/${p.slug}`}>
                      <img src={p.images[0]} alt={p.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <Link to={`/product/${p.slug}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1">{p.name}</Link>
                      <p className="text-coral font-extrabold text-sm">{formatPrice(p.price)}/{p.unit}</p>
                      <button
                        onClick={() => addItem({ productId: p.id, name: p.name, price: p.price, unit: p.unit, image: p.images[0] })}
                        className="mt-1 bg-coral text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity flex items-center gap-1"
                      >
                        <ShoppingCart className="h-3 w-3" /> Mua ngay
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
        <Footer />
      </div>
    );
  }

  // List view
  const filtered = ARTICLES_LIST.filter(a => {
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
            📚 BLOG HẢI SẢN SẦM SƠN
          </span>
          <h1 className="text-3xl md:text-4xl font-black text-primary-foreground mb-3">
            Khám phá Sầm Sơn & Đặc sản biển
          </h1>
          <p className="text-primary-foreground/80 max-w-lg mx-auto mb-6">
            Du lịch, đặc sản, kinh nghiệm chọn hải sản sạch – Tất cả tại đây
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
            {CATEGORIES.map(cat => {
              const Icon = CATEGORY_ICONS[cat];
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    activeCategory === cat ? 'ocean-gradient text-primary-foreground shadow-md' : 'bg-muted text-foreground hover:bg-primary/10'
                  }`}
                >
                  {Icon && <Icon className="h-3 w-3" />}
                  {cat}
                </button>
              );
            })}
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
          <Link to="/san-pham" className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-8 py-3 rounded-full hover:opacity-90 transition-opacity">
            👉 Mua ngay <ChevronRight className="h-4 w-4" />
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
