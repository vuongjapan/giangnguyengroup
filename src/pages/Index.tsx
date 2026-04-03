import { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, ChevronRight, Star, ShoppingCart, Truck, Shield, RotateCcw, Award, Gift, Flame, TrendingUp } from 'lucide-react';
import heroImg from '@/assets/hero-seafood.jpg';
import { products, priceRanges, categories, formatPrice } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
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

  const handleQuickBuy = (product: typeof products[0]) => {
    addItem({ productId: product.id, name: product.name, price: product.price, unit: product.unit, image: product.images[0] });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero banner */}
      <section className="relative h-48 md:h-72 overflow-hidden">
        <img src={heroImg} alt="Hải sản khô đặc sản Sầm Sơn" className="w-full h-full object-cover" width={1920} height={800} />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/80 via-foreground/50 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-lg animate-slide-up">
              <span className="inline-block bg-accent text-accent-foreground text-[10px] md:text-xs font-bold px-3 py-1 rounded-full mb-2">
                🏆 #1 Hải sản khô Sầm Sơn
              </span>
              <h2 className="text-2xl md:text-4xl font-black text-primary-foreground leading-tight">
                Hải Sản Khô<br />
                <span className="text-accent">Đặc Sản Sầm Sơn</span>
              </h2>
              <p className="text-primary-foreground/80 text-xs md:text-sm mt-2 max-w-sm">
                Phơi nắng tự nhiên • Cam kết chính gốc • Ship toàn quốc
              </p>
              <div className="flex gap-2 mt-4">
                <a href="#products" className="ocean-gradient text-primary-foreground font-bold px-5 py-2.5 rounded-full text-xs md:text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-1.5">
                  <ShoppingCart className="h-4 w-4" /> Mua ngay
                </a>
                <a href="tel:0123456789" className="bg-primary-foreground/20 backdrop-blur text-primary-foreground font-bold px-5 py-2.5 rounded-full text-xs md:text-sm hover:bg-primary-foreground/30 transition-colors">
                  📞 Gọi đặt hàng
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

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
        {/* Toolbar */}
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

        {/* Title */}
        <h1 className="text-lg md:text-xl font-extrabold text-foreground mb-4 flex items-center gap-2">
          {filters.category || 'TẤT CẢ SẢN PHẨM'}
          <span className="text-sm font-normal text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
            {filtered.length} sản phẩm
          </span>
        </h1>

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

      {/* Testimonials */}
      <section className="bg-secondary/30 py-8 md:py-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="section-title mx-auto">KHÁCH HÀNG NÓI GÌ?</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 animate-fade-in">
                <div className="flex gap-0.5 mb-2">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-accent text-accent" />
                  ))}
                </div>
                <p className="text-sm text-foreground italic mb-3">"{t.text}"</p>
                <p className="text-xs font-bold text-primary">{t.name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

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

      <Footer />
    </div>
  );
}
