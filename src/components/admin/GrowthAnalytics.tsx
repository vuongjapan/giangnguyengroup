import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { Loader2, ShoppingCart, Mail, CreditCard, Target, TrendingUp, Award } from 'lucide-react';

interface FunnelData { stage: string; value: number; }
interface DayData { date: string; carts: number; recovered: number; exit_shown: number; exit_converted: number; }

const COLORS = ['hsl(var(--primary))', 'hsl(var(--accent))', 'hsl(var(--coral))', 'hsl(var(--muted-foreground))'];

export default function GrowthAnalytics() {
  const [loading, setLoading] = useState(true);
  const [funnel, setFunnel] = useState<FunnelData[]>([]);
  const [trend, setTrend] = useState<DayData[]>([]);
  const [topLandings, setTopLandings] = useState<any[]>([]);
  const [topVouchers, setTopVouchers] = useState<any[]>([]);
  const [recoveryRate, setRecoveryRate] = useState(0);
  const [exitConversion, setExitConversion] = useState(0);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - 30 * 86400000).toISOString();

      // Carts (use lightweight aggregate query)
      const [cartsRes, recoveredRes, exitsRes, landingsRes, repeatRes] = await Promise.all([
        supabase.from('abandoned_carts').select('id, created_at, recovered, total_value').gte('created_at', since).limit(1000),
        supabase.from('abandoned_carts').select('id').eq('recovered', true).gte('created_at', since).limit(1000),
        supabase.from('exit_intent_events').select('event_type, created_at, cart_value').gte('created_at', since).limit(2000),
        supabase.from('seo_landing_pages').select('slug, keyword, views, status').order('views', { ascending: false }).limit(10),
        supabase.from('repeat_order_campaigns').select('voucher_code, reordered, opened').gte('sent_at', since).limit(1000),
      ]);

      const carts = cartsRes.data || [];
      const recovered = recoveredRes.data || [];
      const exits = exitsRes.data || [];
      const landings = landingsRes.data || [];
      const repeats = repeatRes.data || [];

      // Recovery rate
      setRecoveryRate(carts.length > 0 ? Math.round((recovered.length / carts.length) * 100) : 0);

      // Exit popup conversion
      const shown = exits.filter((e: any) => e.event_type === 'shown').length;
      const converted = exits.filter((e: any) => e.event_type === 'converted' || e.event_type === 'clicked').length;
      setExitConversion(shown > 0 ? Math.round((converted / shown) * 100) : 0);

      // Funnel
      setFunnel([
        { stage: 'Cart bỏ dở', value: carts.length },
        { stage: 'Exit popup hiển thị', value: shown },
        { stage: 'Click checkout', value: converted },
        { stage: 'Recovered', value: recovered.length },
      ]);

      // Top landings (only published)
      setTopLandings(landings.filter((l: any) => l.status === 'published').slice(0, 5));

      // Top vouchers from repeat orders
      const voucherMap: Record<string, { code: string; sent: number; used: number }> = {};
      repeats.forEach((r: any) => {
        if (!r.voucher_code) return;
        if (!voucherMap[r.voucher_code]) voucherMap[r.voucher_code] = { code: r.voucher_code, sent: 0, used: 0 };
        voucherMap[r.voucher_code].sent++;
        if (r.reordered) voucherMap[r.voucher_code].used++;
      });
      setTopVouchers(Object.values(voucherMap).sort((a, b) => b.used - a.used).slice(0, 5));

      // 14-day trend
      const days: DayData[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ds = d.toDateString();
        const dCarts = carts.filter((c: any) => new Date(c.created_at).toDateString() === ds);
        const dRecovered = dCarts.filter((c: any) => c.recovered);
        const dExits = exits.filter((e: any) => new Date(e.created_at).toDateString() === ds);
        days.push({
          date: d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
          carts: dCarts.length,
          recovered: dRecovered.length,
          exit_shown: dExits.filter((e: any) => e.event_type === 'shown').length,
          exit_converted: dExits.filter((e: any) => e.event_type === 'converted' || e.event_type === 'clicked').length,
        });
      }
      setTrend(days);

      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-bold flex items-center gap-2"><TrendingUp className="h-5 w-5 text-primary" /> Growth Analytics – 30 ngày</h2>
        <p className="text-xs text-muted-foreground">Tổng hợp 4 module: Cart Recovery + Exit Popup + SEO Landing + Repeat Order</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard icon={ShoppingCart} label="Cart Recovery" value={`${recoveryRate}%`} sub={`${funnel[3]?.value || 0} / ${funnel[0]?.value || 0} carts`} color="text-primary" />
        <KpiCard icon={Target} label="Exit Popup CVR" value={`${exitConversion}%`} sub={`${funnel[2]?.value || 0} / ${funnel[1]?.value || 0} shows`} color="text-coral" />
        <KpiCard icon={Mail} label="Top Voucher" value={topVouchers[0]?.code || '—'} sub={`${topVouchers[0]?.used || 0} dùng`} color="text-accent-foreground" />
        <KpiCard icon={Award} label="Top Landing" value={topLandings[0]?.views || 0} sub={topLandings[0]?.keyword || 'Chưa có'} color="text-primary" />
      </div>

      {/* Funnel */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold mb-3 text-sm">Phễu Cart → Exit → Click → Recovered</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={funnel}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="stage" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="value" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Trend */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="font-semibold mb-3 text-sm">Xu hướng 14 ngày</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={trend}>
            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
            <XAxis dataKey="date" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Line type="monotone" dataKey="carts" stroke="hsl(var(--primary))" name="Cart bỏ dở" strokeWidth={2} />
            <Line type="monotone" dataKey="recovered" stroke="hsl(var(--coral))" name="Recovered" strokeWidth={2} />
            <Line type="monotone" dataKey="exit_shown" stroke="hsl(var(--accent))" name="Exit shown" strokeWidth={2} strokeDasharray="3 3" />
            <Line type="monotone" dataKey="exit_converted" stroke="hsl(var(--muted-foreground))" name="Exit click" strokeWidth={2} strokeDasharray="3 3" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Top landings */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-sm">Top Landing Pages (theo views)</h3>
          {topLandings.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Chưa có landing nào published</p>
          ) : (
            <ul className="space-y-2">
              {topLandings.map((l, i) => (
                <li key={l.slug} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                    <a href={`/lp/${l.slug}`} target="_blank" rel="noreferrer" className="truncate hover:text-primary">{l.keyword}</a>
                  </div>
                  <span className="font-bold text-primary">{l.views}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Top vouchers */}
        <div className="bg-card border border-border rounded-xl p-4">
          <h3 className="font-semibold mb-3 text-sm">Top Voucher Repeat Order</h3>
          {topVouchers.length === 0 ? (
            <p className="text-xs text-muted-foreground py-4 text-center">Chưa có dữ liệu</p>
          ) : (
            <ul className="space-y-2">
              {topVouchers.map((v, i) => {
                const rate = v.sent > 0 ? Math.round((v.used / v.sent) * 100) : 0;
                return (
                  <li key={v.code} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-muted-foreground w-5">#{i + 1}</span>
                      <span className="font-mono text-xs bg-coral/10 text-coral px-1.5 py-0.5 rounded">{v.code}</span>
                    </div>
                    <span className="text-xs"><strong className="text-primary">{v.used}</strong>/{v.sent} <span className="text-muted-foreground">({rate}%)</span></span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="bg-card border border-border rounded-xl p-4">
      <div className="flex items-center gap-2 mb-1">
        <Icon className={`h-4 w-4 ${color}`} />
        <span className="text-xs text-muted-foreground">{label}</span>
      </div>
      <p className={`text-xl font-black ${color} truncate`}>{value}</p>
      <p className="text-[11px] text-muted-foreground truncate">{sub}</p>
    </div>
  );
}
