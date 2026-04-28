import { Link } from 'react-router-dom';
import { useStores } from '@/hooks/useStores';

export default function LocationThumbnails() {
  const { stores } = useStores();
  const items = (stores || []).slice(0, 4);
  if (items.length === 0) return null;

  return (
    <section className="py-10 md:py-12 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-black text-foreground">📍 Cửa Hàng Tại Sầm Sơn</h2>
          <p className="text-sm text-muted-foreground mt-1">Ghé thăm để được trải nghiệm trực tiếp</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5 max-w-5xl mx-auto">
          {items.map((s, i) => {
            const img = `https://maps.googleapis.com/maps/api/staticmap?center=${s.lat},${s.lng}&zoom=17&size=400x400&markers=color:red%7C${s.lat},${s.lng}`;
            const fallback = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=500&h=500&fit=crop';
            return (
              <Link
                key={s.id}
                to="/he-thong-cua-hang"
                className="group block"
              >
                <div className="relative aspect-square overflow-hidden rounded-xl shadow-md">
                  <img
                    src={img}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = fallback; }}
                  />
                  <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/55 transition-colors flex items-center justify-center p-3">
                    <span className="text-white font-bold text-center text-sm md:text-base opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg">
                      {s.name}
                    </span>
                  </div>
                </div>
                <p className="mt-2 text-center text-xs md:text-sm font-bold text-foreground line-clamp-2">
                  {s.name}
                </p>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
