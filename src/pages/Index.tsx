import { useState, useMemo } from 'react';
import { Filter, ArrowUpDown } from 'lucide-react';
import heroImg from '@/assets/hero-seafood.jpg';
import { products, priceRanges } from '@/data/products';
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

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative h-48 md:h-64 overflow-hidden">
        <img src={heroImg} alt="Hải sản khô Sầm Sơn" className="w-full h-full object-cover" width={1920} height={800} />
        <div className="absolute inset-0 bg-gradient-to-r from-foreground/70 to-foreground/30 flex items-center">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-4xl font-extrabold text-primary-foreground mb-2">
              Hải Sản Khô <span className="text-accent">Sầm Sơn</span>
            </h2>
            <p className="text-primary-foreground/90 text-sm md:text-base max-w-md">
              Đặc sản biển chính gốc – Phơi nắng tự nhiên – Ship toàn quốc
            </p>
          </div>
        </div>
      </section>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6 flex-1">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setFilterOpen(true)} className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-card border border-border rounded-lg text-sm font-medium text-foreground">
              <Filter className="h-4 w-4" /> Bộ lọc
            </button>
            <h2 className="text-lg md:text-xl font-extrabold text-foreground">
              🔥 Sản phẩm ({filtered.length})
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            <select
              value={sort}
              onChange={e => setSort(e.target.value as SortOption)}
              className="border border-border rounded-lg px-2 py-1.5 text-sm bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <option value="default">Mặc định</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
              <option value="hot">Bán chạy</option>
            </select>
          </div>
        </div>

        <div className="flex gap-6">
          <FilterSidebar filters={filters} onChange={setFilters} isOpen={filterOpen} onClose={() => setFilterOpen(false)} />

          <div className="flex-1">
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <p className="text-lg">Không tìm thấy sản phẩm phù hợp</p>
                <button onClick={() => setFilters({ category: null, priceRange: null, grade: null, need: null, status: null })} className="mt-3 text-primary hover:underline text-sm font-medium">
                  Xóa bộ lọc
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
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
