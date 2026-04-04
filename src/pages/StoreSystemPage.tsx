import { useState } from 'react';
import { MapPin, Phone, Clock, Navigation, Store, ChevronRight } from 'lucide-react';
import { stores } from '@/data/stores';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import GoogleMap from '@/components/GoogleMap';

export default function StoreSystemPage() {
  const [focusStoreId, setFocusStoreId] = useState<string | null>(null);

  const handleSelectStore = (storeId: string) => {
    setFocusStoreId(storeId);
    document.getElementById('map-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-xs text-muted-foreground flex items-center gap-1">
            <a href="/" className="hover:text-primary">Trang chủ</a>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-medium">Hệ thống cửa hàng</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="ocean-gradient py-10 md:py-14">
        <div className="container mx-auto px-4 text-center">
          <Store className="h-10 w-10 text-primary-foreground/80 mx-auto mb-3" />
          <h1 className="text-2xl md:text-3xl font-black text-primary-foreground mb-2">
            HỆ THỐNG CỬA HÀNG
          </h1>
          <p className="text-primary-foreground/80 text-sm md:text-base max-w-lg mx-auto">
            {stores.length} chi nhánh tại Sầm Sơn, Thanh Hóa – Ghé thăm để trải nghiệm hải sản tươi ngon nhất
          </p>
        </div>
      </section>

      {/* Store list */}
      <section className="py-8 md:py-12 bg-card">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {stores.map((store, index) => (
              <div
                key={store.id}
                className={`bg-background rounded-xl border-2 p-5 card-hover cursor-pointer group transition-all ${
                  focusStoreId === store.id ? 'border-primary shadow-lg' : 'border-border'
                }`}
                onClick={() => handleSelectStore(store.id)}
              >
                {/* Store number badge */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-full ocean-gradient flex items-center justify-center flex-shrink-0 shadow-md">
                    <span className="text-primary-foreground font-black text-lg">{index + 1}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-foreground text-sm md:text-base">{store.name}</h3>
                    <span className="text-[10px] text-primary font-semibold bg-primary/10 px-2 py-0.5 rounded-full">
                      Đang mở cửa
                    </span>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <p className="flex items-start gap-2.5 text-muted-foreground">
                    <MapPin className="h-4 w-4 flex-shrink-0 text-primary mt-0.5" />
                    <span>{store.address}</span>
                  </p>
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                    <a
                      href={`tel:${store.phone}`}
                      className="font-bold text-primary hover:underline"
                      onClick={e => e.stopPropagation()}
                    >
                      {store.phone}
                    </a>
                  </div>
                  <p className="flex items-center gap-2.5 text-muted-foreground">
                    <Clock className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>{store.hours}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2">
                  <a
                    href={`tel:${store.phone}`}
                    className="flex-1 ocean-gradient text-primary-foreground font-bold text-xs px-4 py-2.5 rounded-full text-center hover:opacity-90 transition-opacity flex items-center justify-center gap-1.5"
                    onClick={e => e.stopPropagation()}
                  >
                    <Phone className="h-3.5 w-3.5" /> Gọi ngay
                  </a>
                  <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-muted text-foreground font-bold text-xs px-4 py-2.5 rounded-full text-center hover:bg-primary/10 transition-colors flex items-center justify-center gap-1.5 border border-border"
                    onClick={e => e.stopPropagation()}
                  >
                    <Navigation className="h-3.5 w-3.5" /> Chỉ đường
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Google Map */}
      <div id="map-section">
        <GoogleMap focusStoreId={focusStoreId} />
      </div>

      {/* CTA */}
      <section className="bg-accent/10 py-8">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-lg md:text-xl font-black text-foreground mb-2">
            Không tiện ghé cửa hàng?
          </h2>
          <p className="text-muted-foreground text-sm mb-4">
            Đặt hàng online – Giao tận nhà toàn quốc
          </p>
          <a
            href="/san-pham"
            className="inline-flex items-center gap-2 ocean-gradient text-primary-foreground font-bold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity"
          >
            🛒 Mua hàng online ngay
          </a>
        </div>
      </section>

      <Footer />
    </div>
  );
}
