import { Link } from 'react-router-dom';
import { Clock, ChevronRight } from 'lucide-react';
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed';
import { formatPrice } from '@/data/products';

export default function RecentlyViewed() {
  const { viewed } = useRecentlyViewed();

  if (viewed.length === 0) return null;

  return (
    <section className="py-6 md:py-8 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <h2 className="section-title">SẢN PHẨM ĐÃ XEM</h2>
          </div>
          <Link to="/" className="text-xs text-primary hover:underline font-medium flex items-center gap-0.5">
            Xem tất cả <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {viewed.slice(0, 8).map(p => (
            <Link
              key={p.id}
              to={`/product/${p.slug}`}
              className="flex-shrink-0 w-36 md:w-44 bg-card rounded-xl border border-border overflow-hidden hover:shadow-lg transition-shadow group"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={p.image}
                  alt={p.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                  width={176}
                  height={176}
                />
              </div>
              <div className="p-2.5">
                <p className="text-xs font-semibold text-foreground truncate">{p.name}</p>
                <p className="text-sm font-bold text-coral mt-0.5">{formatPrice(p.price)}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
