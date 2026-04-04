import { useState } from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { stores, Store } from '@/data/stores';

interface Props {
  focusStoreId?: string | null;
}

export default function GoogleMap({ focusStoreId }: Props) {
  const [selectedStore, setSelectedStore] = useState<Store | null>(
    focusStoreId ? stores.find(s => s.id === focusStoreId) || null : null
  );

  const center = selectedStore
    ? { lat: selectedStore.lat, lng: selectedStore.lng }
    : { lat: 19.755, lng: 105.904 };

  const zoom = selectedStore ? 16 : 14;

  // Build markers query for Google Maps embed
  const markersQuery = stores
    .map(s => `${s.lat},${s.lng}`)
    .join('|');

  const mapSrc = `https://maps.google.com/maps?q=${center.lat},${center.lng}&z=${zoom}&output=embed`;

  return (
    <section className="relative">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="section-title mx-auto">BẢN ĐỒ CỬA HÀNG</h2>
        </div>
      </div>

      <div className="relative w-full h-[300px] md:h-[450px]">
        <iframe
          src={mapSrc}
          className="w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Bản đồ cửa hàng Giang Nguyen Seafood"
        />

        {/* Store selector overlay */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 max-w-[280px]">
          {stores.map((store, i) => (
            <button
              key={store.id}
              onClick={() => setSelectedStore(store.id === selectedStore?.id ? null : store)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium shadow-lg transition-all text-left ${
                selectedStore?.id === store.id
                  ? 'ocean-gradient text-primary-foreground'
                  : 'bg-card text-foreground hover:bg-muted border border-border'
              }`}
            >
              <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold ${
                selectedStore?.id === store.id ? 'bg-accent text-accent-foreground' : 'ocean-gradient text-primary-foreground'
              }`}>
                {i + 1}
              </div>
              <span className="truncate">{store.name}</span>
            </button>
          ))}
        </div>

        {/* Selected store info popup */}
        {selectedStore && (
          <div className="absolute bottom-3 left-3 right-3 md:left-auto md:right-3 md:w-80 bg-card rounded-xl shadow-2xl border border-border p-4 z-10 animate-fade-in">
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-bold text-foreground text-sm">{selectedStore.name}</h3>
              <button onClick={() => setSelectedStore(null)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground flex items-start gap-1.5 mb-3">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-primary" />
              {selectedStore.address}
            </p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${selectedStore.lat},${selectedStore.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="ocean-gradient text-primary-foreground font-bold text-xs px-4 py-2 rounded-full inline-flex items-center gap-1.5 hover:opacity-90 transition-opacity"
            >
              <Navigation className="h-3.5 w-3.5" /> Chỉ đường trên Google Maps
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
