import { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, ChevronRight, Star, Flame } from 'lucide-react';
import { products, priceRanges, categories, formatPrice } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import HeroBanner from '@/components/HeroBanner';
import AboutSection from '@/components/AboutSection';
import StoreLocations from '@/components/StoreLocations';
import SocialProof from '@/components/SocialProof';
import GoogleMap from '@/components/GoogleMap';
import FlashSaleBanner from '@/components/FlashSaleBanner';
import RecentlyViewed from '@/components/RecentlyViewed';
import CustomerReviews from '@/components/CustomerReviews';
import NewsletterSignup from '@/components/NewsletterSignup';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import { useSearchParams } from 'react-router-dom';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'hot';

interface Filters {
  category: string | null;
  priceRange: number | null;
  grade: string | null;
  need: string | null;
  status: string | null;
}

const TESTIMONIALS = [
  { name: 'Chị Hương – Hà Nội', text: 'Mực khô loại 1 rất ngon, nướng lên thơm lừng. Ship nhanh, đóng gói cẩn thận. Sẽ mua lại!', rating: 5 },
  { name: 'Anh Tuấn – TP.HCM', text: 'Mua làm quà biếu sếp, được khen hết lời. Hộp quà sang trọng, hải sản tươi ngon.', rating: 5 },
  { name: 'Chị Mai – Đà Nẵng', text: 'Cá thu 1 nắng chiên lên vàng giòn, cả nhà ai cũng mê. Giá rất hợp lý!', rating: 5 },
];

export default function Index() {
  const [searchParams] = useSearchParams();
  const initialCategory = searchParams.get('category');
  const initialStatus = searchParams.get('status');

  const [filters, setFilters] = useState<Filters>({
    category: initialCategory,
    priceRange: null,
    grade: null,
    need: null,
    status: initialStatus,
  });
  const [sort, setSort] = useState<SortOption>('default');
  const [filterOpen, setFilterOpen] = useState(false);
  const [focusStoreId, setFocusStoreId] = useState<string | null>(null);
  const { addItem } = useCart();

  const filtered = useMemo(() => {
    let result = [...products];
    if (filters.category) result = result.filter(p => p.category === filters.category);
    if (filters.priceRange !== null) {
      const range = priceRanges[filters.priceRange];
      result = result.filter(p => p.price >= range.min && p.price < range.max);
    }
    if (filters.grade) result = result.filter(p => p.grade === filters.grade);
    if (filters.need) result = result.filter(p => p.needs.includes(filters.need!));
    if (filters.status) {
      if (filters.status === 'hot') result = result.filter(p => p.badges.includes('hot'));
      if (filters.status === 'rating') result = result.filter(p => p.rating >= 5);
      if (filters.status === 'limited') result = result.filter(p => p.stock < 10);
    }
    switch (sort) {
      case 'price-asc': result.sort((a, b) => a.price - b.price); break;
      case 'price-desc': result.sort((a, b) => b.price - a.price); break;
      case 'hot': result.sort((a, b) => (b.badges.includes('hot') ? 1 : 0) - (a.badges.includes('hot') ? 1 : 0)); break;
    }
    return result;
  }, [filters, sort]);

  const hasFilters = Object.values(filters).some(v => v !== null);
  const bestSellers = products.filter(p => p.badges.includes('hot'));

  const handleSelectStore = (storeId: string) => {
    setFocusStoreId(storeId);
    document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <FlashSaleBanner />
      <Header />

      {/* I. Hero Banner with Slider */}
      <HeroBanner />

      {/* USP strip */}
      <div className="bg-card border-b border-border py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: '🐟', title: '100% Sầm Sơn', desc: 'Hải sản chính gốc' },
              { icon: '☀️', title: 'Phơi nắng thật', desc: 'Không sấy công nghiệp' },
              { icon: '🚚', title: 'Free ship 500K', desc: 'Giao toàn quốc' },
              { icon: '🔄', title: 'Đổi trả 24h', desc: 'Hoàn tiền 100%' },
            ].map(item => (
              <div key={item.title} className="flex items-center gap-2.5 px-2">
                <span className="text-2xl">{item.icon}</span>
                <div>
                  <p className="font-bold text-foreground text-xs md:text-sm">{item.title}</p>
                  <p className="text-[10px] md:text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bestseller highlight section */}
      <section className="bg-secondary/30 py-6 md:py-8">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-coral" />
              <h2 className="section-title">SẢN PHẨM BÁN CHẠY</h2>
            </div>
            <a href="#products" className="text-xs text-primary hover:underline font-medium flex items-center gap-0.5">
              Xem tất cả <ChevronRight className="h-3 w-3" />
            </a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
            {bestSellers.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      </section>

      {/* V. About Section */}
      <AboutSection />

      {/* Social Proof */}
      <SocialProof />

      {/* II. Store Locations */}
      <StoreLocations onSelectStore={handleSelectStore} />

      {/* Quick category strip */}
      <div className="border-b border-border bg-card sticky top-[88px] md:top-[140px] z-30" id="products">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2.5 scrollbar-hide">
            <button
              onClick={() => setFilters(f => ({ ...f, category: null }))}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                !filters.category ? 'ocean-gradient text-primary-foreground shadow-md' : 'bg-muted text-foreground hover:bg-primary/10'
              }`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilters(f => ({ ...f, category: f.category === cat ? null : cat }))}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  filters.category === cat ? 'ocean-gradient text-primary-foreground shadow-md' : 'bg-muted text-foreground hover:bg-primary/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main product listing */}
      <main className="container mx-auto px-4 py-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setFilterOpen(true)} className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted transition-colors">
              <Filter className="h-3.5 w-3.5" /> Bộ lọc
            </button>
            <nav className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
              <span>Trang chủ</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{filters.category || 'Tất cả sản phẩm'}</span>
            </nav>
          </div>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <button
                onClick={() => setFilters({ category: null, priceRange: null, grade: null, need: null, status: null })}
                className="text-xs text-coral hover:underline font-medium hidden md:inline"
              >
                ✕ Xóa bộ lọc
              </button>
            )}
            <div className="flex items-center gap-1.5 text-xs">
              <ArrowUpDown className="h-3.5 w-3.5 text-muted-foreground hidden sm:block" />
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="border border-border rounded-lg px-3 py-2 text-xs bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
              >
                <option value="default">Nổi bật</option>
                <option value="price-asc">Giá tăng dần</option>
                <option value="price-desc">Giá giảm dần</option>
                <option value="hot">Bán chạy nhất</option>
              </select>
            </div>
          </div>
        </div>

        <h2 className="text-lg md:text-xl font-extrabold text-foreground mb-4 flex items-center gap-2">
          {filters.category || 'TẤT CẢ SẢN PHẨM'}
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {filtered.length} sản phẩm
          </span>
        </h2>

        <div className="flex gap-6">
          <FilterSidebar filters={filters} onChange={setFilters} isOpen={filterOpen} onClose={() => setFilterOpen(false)} />

          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground bg-card rounded-xl border border-border">
                <p className="text-base mb-1">Không tìm thấy sản phẩm phù hợp</p>
                <p className="text-sm mb-4">Hãy thử thay đổi bộ lọc</p>
                <button
                  onClick={() => setFilters({ category: null, priceRange: null, grade: null, need: null, status: null })}
                  className="ocean-gradient text-primary-foreground px-5 py-2 rounded-full text-sm font-bold hover:opacity-90"
                >
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 md:gap-4">
                {filtered.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CTA banner */}
      <section className="ocean-gradient py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-xl md:text-2xl font-black text-primary-foreground mb-2">
            Đặt hàng ngay – Ship tận nhà!
          </h2>
          <p className="text-primary-foreground/80 text-sm mb-4">
            Hotline: <a href="tel:0123456789" className="font-bold text-accent hover:underline">0123.456.789</a> • Zalo: <a href="https://zalo.me/0123456789" className="font-bold text-accent hover:underline">0123.456.789</a>
          </p>
          <a
            href="tel:0123456789"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground font-bold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            📞 GỌI ĐẶT HÀNG NGAY
          </a>
        </div>
      </section>

      {/* III. Google Map */}
      <div id="map-section">
        <GoogleMap focusStoreId={focusStoreId} />
      </div>

      <Footer />
    </div>
  );
}
