import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { stores } from '@/data/stores';

interface Props {
  onSelectStore?: (storeId: string) => void;
}

export default function StoreLocations({ onSelectStore }: Props) {
  return (
    <section className="py-8 md:py-12 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="section-title mx-auto">HỆ THỐNG CỬA HÀNG</h2>
          <p className="text-muted-foreground text-sm mt-3">3 chi nhánh tại Sầm Sơn, Thanh Hóa</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {stores.map((store, index) => (
            <div
              key={store.id}
              className="bg-background rounded-xl border border-border p-5 card-hover cursor-pointer group"
              onClick={() => onSelectStore?.(store.id)}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full ocean-gradient flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-foreground font-bold text-sm">{index + 1}</span>
                </div>
                <h3 className="font-bold text-foreground text-sm md:text-base">{store.name}</h3>
              </div>

              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                  {store.address}
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                  <a href={`tel:${store.phone}`} className="hover:text-primary font-medium">{store.phone}</a>
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
                  {store.hours}
                </p>
              </div>

              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline group-hover:text-accent transition-colors"
                onClick={e => e.stopPropagation()}
              >
                <Navigation className="h-3.5 w-3.5" /> Chỉ đường
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
