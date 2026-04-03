import { useState, useMemo } from 'react';
import { Filter, ArrowUpDown, ChevronRight } from 'lucide-react';
import heroImg from '@/assets/hero-seafood.jpg';
import { products, priceRanges, categories } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Link } from 'react-router-dom';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'hot';

interface Filters {
  category: string | null;
  priceRange: number | null;
  grade: string | null;
  need: string | null;
  status: string | null;
}

export default function Index() {
  const [filters, setFilters] = useState<Filters>({ category: null, priceRange: null, grade: null, need: null, status: null });
  const [sort, setSort] = useState<SortOption>('default');
  const [filterOpen, setFilterOpen] = useState(false);

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

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Hero - compact like Camudo banners */}
      <section className="relative h-40 md:h-56 overflow-hidden">
        <img src={heroImg} alt="Hải sản khô Sầm Sơn" className="w-full h-full object-cover" width={1920} height={800} />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 via-foreground/40 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <h2 className="text-xl md:text-3xl font-extrabold text-primary-foreground leading-tight">
              Hải Sản Khô <span className="text-accent">Sầm Sơn</span>
            </h2>
            <p className="text-primary-foreground/80 text-xs md:text-sm mt-1 max-w-sm">
              Đặc sản biển chính gốc • Phơi nắng tự nhiên • Ship toàn quốc
            </p>
          </div>
        </div>
      </section>

      {/* Quick category strip - like Camudo sidebar but horizontal on mobile */}
      <div className="border-b border-border bg-card">
        <div className="container mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto py-2 scrollbar-hide">
            <button
              onClick={() => setFilters(f => ({ ...f, category: null }))}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                !filters.category ? 'ocean-gradient text-primary-foreground' : 'bg-muted text-foreground hover:bg-primary/10'
              }`}
            >
              Tất cả
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setFilters(f => ({ ...f, category: f.category === cat ? null : cat }))}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  filters.category === cat ? 'ocean-gradient text-primary-foreground' : 'bg-muted text-foreground hover:bg-primary/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="container mx-auto px-4 py-4 flex-1">
        {/* Breadcrumb + toolbar */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <button onClick={() => setFilterOpen(true)} className="lg:hidden flex items-center gap-1 px-2.5 py-1.5 bg-card border border-border rounded text-xs font-medium text-foreground hover:bg-muted">
              <Filter className="h-3.5 w-3.5" /> Bộ lọc
            </button>
            <span className="text-xs text-muted-foreground hidden md:inline">
              Trang chủ <ChevronRight className="inline h-3 w-3" /> {filters.category || 'Tất cả sản phẩm'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasFilters && (
              <button onClick={() => setFilters({ category: null, priceRange: null, grade: null, need: null, status: null })} className="text-xs text-primary hover:underline font-medium hidden md:inline">
                Xóa hết
              </button>
            )}
            <div className="flex items-center gap-1 text-xs">
              <span className="text-muted-foreground hidden sm:inline">Sắp xếp:</span>
              <select
                value={sort}
                onChange={e => setSort(e.target.value as SortOption)}
                className="border border-border rounded px-2 py-1.5 text-xs bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40"
              >
                <option value="default">Sản phẩm nổi bật</option>
                <option value="price-asc">Giá: Tăng dần</option>
                <option value="price-desc">Giá: Giảm dần</option>
                <option value="hot">Bán chạy nhất</option>
              </select>
            </div>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-lg md:text-xl font-extrabold text-foreground mb-4">
          {filters.category || 'TẤT CẢ SẢN PHẨM'}
          <span className="text-sm font-normal text-muted-foreground ml-2">({filtered.length} sản phẩm)</span>
        </h1>

        <div className="flex gap-5">
          <FilterSidebar filters={filters} onChange={setFilters} isOpen={filterOpen} onClose={() => setFilterOpen(false)} />

          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-base">Không tìm thấy sản phẩm phù hợp</p>
                <button onClick={() => setFilters({ category: null, priceRange: null, grade: null, need: null, status: null })} className="mt-3 text-primary hover:underline text-sm font-medium">
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

      <Footer />
    </div>
  );
}
