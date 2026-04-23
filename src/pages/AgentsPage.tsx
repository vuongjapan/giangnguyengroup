import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Phone, MessageCircle, MapPin, Search, Loader2, Store } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

interface Agent {
  id: string;
  name: string;
  slug: string;
  region: string;
  address: string;
  phone: string;
  zalo: string;
  avatar: string;
  description: string;
  products_distributed: string[];
}

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [region, setRegion] = useState<string>('');

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('agents' as any)
        .select('*')
        .eq('is_active', true)
        .order('sort_order', { ascending: true });
      setAgents((data as any) || []);
      setLoading(false);
    })();
  }, []);

  const regions = Array.from(new Set(agents.map(a => a.region).filter(Boolean)));

  const filtered = agents.filter(a => {
    if (region && a.region !== region) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!a.name.toLowerCase().includes(q) && !a.address.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO title="Đại lý phân phối | GIANG NGUYEN SEAFOOD" description="Hệ thống đại lý phân phối hải sản khô Sầm Sơn trên toàn quốc" />
      <Header />
      <main className="flex-1 container mx-auto px-3 py-6">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-xs font-bold mb-2">
            <Store className="h-3.5 w-3.5" /> ĐẠI LÝ CHÍNH HÃNG
          </div>
          <h1 className="text-2xl md:text-3xl font-black text-foreground">Hệ thống Đại lý Phân phối</h1>
          <p className="text-sm text-muted-foreground mt-1">Liên hệ trực tiếp đại lý gần bạn để được tư vấn & nhận giá tốt</p>
        </div>

        {/* Search + filter */}
        <div className="flex flex-col sm:flex-row gap-2 mb-5 max-w-2xl mx-auto">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Tìm theo tên hoặc địa chỉ..."
              className="w-full pl-10 pr-3 py-2.5 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
          <select value={region} onChange={e => setRegion(e.target.value)}
            className="px-3 py-2.5 rounded-lg border border-border bg-card text-sm">
            <option value="">Tất cả khu vực</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Store className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Chưa có đại lý nào{search || region ? ' phù hợp' : ''}.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(a => (
              <article key={a.id} className="bg-card rounded-2xl border border-border p-4 hover:shadow-lg transition-shadow">
                <div className="flex gap-3 mb-3">
                  {a.avatar ? (
                    <img src={a.avatar} alt={a.name} loading="lazy"
                      className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Store className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-foreground leading-tight">{a.name}</h3>
                    {a.region && <span className="inline-block mt-1 text-[10px] font-bold uppercase bg-primary/10 text-primary px-2 py-0.5 rounded">{a.region}</span>}
                  </div>
                </div>

                {a.address && (
                  <p className="text-xs text-muted-foreground flex items-start gap-1 mb-2">
                    <MapPin className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                    <span>{a.address}</span>
                  </p>
                )}

                {a.description && (
                  <p className="text-xs text-foreground/80 line-clamp-2 mb-3">{a.description}</p>
                )}

                {a.products_distributed.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {a.products_distributed.slice(0, 3).map((p, i) => (
                      <span key={i} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded">{p}</span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 pt-3 border-t border-border">
                  {a.phone && (
                    <a href={`tel:${a.phone}`}
                      className="flex-1 ocean-gradient text-primary-foreground font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 hover:opacity-90">
                      <Phone className="h-3.5 w-3.5" /> Gọi
                    </a>
                  )}
                  {a.zalo && (
                    <a href={`https://zalo.me/${a.zalo.replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer"
                      className="flex-1 bg-[#0068ff] text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1 hover:opacity-90">
                      <MessageCircle className="h-3.5 w-3.5" /> Zalo
                    </a>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
