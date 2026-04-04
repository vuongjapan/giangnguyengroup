import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, MapPin, Star, Percent, Building2, Filter } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface Hotel {
  id: string;
  name: string;
  slug: string;
  description: string;
  images: string[];
  address: string;
  category: string;
  amenities: string[];
  discount_percent: number;
  phone: string;
}

const CATEGORIES = ['Tất cả', 'Cao cấp', 'Gần biển', 'Giá rẻ'];

export default function HotelsPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Tất cả');

  useEffect(() => {
    supabase.from('hotels').select('*').order('sort_order').then(({ data }) => {
      setHotels((data as any[]) || []);
      setLoading(false);
    });
  }, []);

  const filtered = useMemo(() => {
    let list = hotels;
    if (category !== 'Tất cả') list = list.filter(h => h.category === category);
    if (search.trim()) list = list.filter(h => h.name.toLowerCase().includes(search.toLowerCase()));
    return list;
  }, [hotels, category, search]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="ocean-gradient py-10 px-4 text-center">
          <Building2 className="h-12 w-12 text-primary-foreground mx-auto mb-3" />
          <h1 className="text-2xl md:text-3xl font-black text-primary-foreground mb-2">KHÁCH SẠN LIÊN KẾT</h1>
          <p className="text-primary-foreground/80 text-sm max-w-lg mx-auto">
            Lưu trú tại khách sạn đối tác – Nhận ưu đãi giảm giá hải sản giao tận phòng
          </p>
        </div>

        <div className="container mx-auto px-4 py-6">
          {/* Search & filter */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Tìm khách sạn..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                    category === cat
                      ? 'ocean-gradient text-primary-foreground'
                      : 'bg-muted text-foreground hover:bg-primary/10'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1,2,3].map(i => (
                <div key={i} className="bg-card rounded-2xl border border-border h-72 animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-16">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Không tìm thấy khách sạn nào</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map(hotel => (
                <Link
                  key={hotel.id}
                  to={`/khach-san/${hotel.slug}`}
                  className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-all group"
                >
                  <div className="relative h-48 bg-muted overflow-hidden">
                    {hotel.images.length > 0 ? (
                      <img src={hotel.images[0]} alt={hotel.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="h-16 w-16 text-muted-foreground/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className="bg-coral text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full">
                        Giảm {hotel.discount_percent}%
                      </span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="bg-card/90 backdrop-blur-sm text-foreground text-xs font-medium px-2 py-1 rounded-full">
                        {hotel.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-foreground text-base mb-1 group-hover:text-primary transition-colors">{hotel.name}</h3>
                    <p className="text-muted-foreground text-xs flex items-center gap-1 mb-2">
                      <MapPin className="h-3 w-3" /> {hotel.address}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{hotel.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {hotel.amenities.slice(0, 3).map(a => (
                        <span key={a} className="bg-primary/10 text-primary text-[10px] font-medium px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                      {hotel.amenities.length > 3 && (
                        <span className="text-muted-foreground text-[10px]">+{hotel.amenities.length - 3}</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
