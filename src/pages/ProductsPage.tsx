import { useState, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Filter, ArrowUpDown, ChevronRight, ArrowLeft } from 'lucide-react';
import { priceRanges, categories, formatPrice } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import FilterSidebar from '@/components/FilterSidebar';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

type SortOption = 'default' | 'price-asc' | 'price-desc' | 'hot';

interface Filters {
  category: string | null;
  priceRange: number | null;
  grade: string | null;
  need: string | null;
  status: string | null;
}

export default function ProductsPage() {
  const { products } = useProducts();
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
  }, [products, filters, sort]);

  const hasFilters = Object.values(filters).some(v => v !== null);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Category strip */}
      <div className="border-b border-border bg-card sticky top-[88px] md:top-[140px] z-30">
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

      <main className="container mx-auto px-4 py-5 flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <button onClick={() => setFilterOpen(true)} className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted transition-colors">
              <Filter className="h-3.5 w-3.5" /> Bộ lọc
            </button>
            <nav className="text-xs text-muted-foreground hidden md:flex items-center gap-1">
              <Link to="/" className="hover:text-primary">Trang chủ</Link>
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
      <Footer />
    </div>
  );
}
