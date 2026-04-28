import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { useStores } from '@/hooks/useStores';

interface Props {
  onSelectStore?: (storeId: string) => void;
}

export default function StoreLocations({ onSelectStore }: Props) {
  const { stores, loading } = useStores();

  if (loading) return null;

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: '#f8f9fa' }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-black text-foreground">HỆ THỐNG CỬA HÀNG</h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full mt-3" />
          <p className="text-muted-foreground text-sm md:text-base mt-3">
            {stores.length} chi nhánh tại Sầm Sơn, Thanh Hóa – luôn mở cửa phục vụ bạn
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6 max-w-6xl mx-auto">
          {stores.map((store, index) => {
            const mapImg = `https://maps.googleapis.com/maps/api/staticmap?center=${store.lat},${store.lng}&zoom=16&size=600x300&markers=color:red%7C${store.lat},${store.lng}`;
            return (
              <div
                key={store.id}
                className="bg-card rounded-2xl border-2 border-transparent hover:border-primary overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col"
                onClick={() => onSelectStore?.(store.id)}
              >
                {/* Map preview / store photo */}
                <div className="relative aspect-[2/1] bg-muted overflow-hidden">
                  <img
                    src={mapImg}
                    alt={`Bản đồ ${store.name}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=600&h=300&fit=crop';
                    }}
                  />
                  <div className="absolute top-3 left-3 w-10 h-10 rounded-full ocean-gradient flex items-center justify-center shadow-lg">
                    <span className="text-primary-foreground font-black text-base">{index + 1}</span>
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-black text-foreground text-base md:text-lg mb-3 leading-tight">
                    {store.name}
                  </h3>
                  <div className="space-y-2.5 text-sm text-muted-foreground flex-1">
                    <p className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                      <span>{store.address}</span>
                    </p>
                    <p className="flex items-center gap-2">
                      <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                      <a
                        href={`tel:${store.phone}`}
                        onClick={e => e.stopPropagation()}
                        className="hover:text-primary font-semibold text-foreground"
                      >
                        {store.phone}
                      </a>
                    </p>
                    <p className="flex items-center gap-2">
                      <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
                      <span>7:00 - 21:00 hàng ngày</span>
                    </p>
                  </div>

                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={e => e.stopPropagation()}
                    className="mt-4 w-full inline-flex items-center justify-center gap-1.5 bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity"
                  >
                    <Navigation className="h-4 w-4" /> Xem Bản Đồ
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
