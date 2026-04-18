import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { Sparkles, MousePointerClick, TrendingUp, Package, RefreshCw } from 'lucide-react';

interface AILog {
  id: string;
  session_id: string;
  event_type: string;
  payload: any;
  created_at: string;
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--coral))', 'hsl(45,90%,55%)', 'hsl(200,80%,40%)', 'hsl(130,60%,45%)', 'hsl(280,60%,55%)'];

const EVENT_LABELS: Record<string, string> = {
  page_view: 'Xem trang',
  product_view: 'Xem sản phẩm',
  add_to_cart: 'Thêm giỏ',
  idle: 'Không hoạt động',
  close_ai: 'Đóng AI',
  click_ai_cta: 'Click CTA',
  ai_show: 'AI hiển thị',
  purchase: 'Mua hàng',
};

export default function AIAnalyticsDashboard() {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [loading, setLoading] = useState(true);
  const [days, setDays] = useState(7);

  const fetchLogs = async () => {
    setLoading(true);
    const since = new Date();
    since.setDate(since.getDate() - days);
    const { data } = await supabase
      .from('ai_logs')
      .select('*')
      .gte('created_at', since.toISOString())
      .order('created_at', { ascending: false })
      .limit(5000);
    if (data) setLogs(data as AILog[]);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, [days]);

  // Group events by day
  const dailyData = useMemo(() => {
    const map = new Map<string, Record<string, number>>();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      map.set(key, { name: key, total: 0 });
    }
    logs.forEach(l => {
      const d = new Date(l.created_at);
      const key = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' });
      const row = map.get(key);
      if (!row) return;
      row[l.event_type] = (row[l.event_type] || 0) + 1;
      row.total = (row.total || 0) + 1;
    });
    return Array.from(map.values());
  }, [logs, days]);

  // Event type distribution
  const eventDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach(l => { counts[l.event_type] = (counts[l.event_type] || 0) + 1; });
    return Object.entries(counts)
      .map(([name, value]) => ({ name: EVENT_LABELS[name] || name, value, raw: name }))
      .sort((a, b) => b.value - a.value);
  }, [logs]);

  // CTA click rate
  const ctaStats = useMemo(() => {
    const shows = logs.filter(l => l.event_type === 'ai_show').length;
    const clicks = logs.filter(l => l.event_type === 'click_ai_cta').length;
    const closes = logs.filter(l => l.event_type === 'close_ai').length;
    const rate = shows > 0 ? Math.round((clicks / shows) * 100) : 0;
    const closeRate = shows > 0 ? Math.round((closes / shows) * 100) : 0;
    return { shows, clicks, closes, rate, closeRate };
  }, [logs]);

  // Top trigger by clicks
  const triggerEffectiveness = useMemo(() => {
    const stats: Record<string, { shown: number; clicked: number }> = {};
    logs.forEach(l => {
      const trigger = l.payload?.trigger_type || l.payload?.trigger || 'unknown';
      if (!stats[trigger]) stats[trigger] = { shown: 0, clicked: 0 };
      if (l.event_type === 'ai_show') stats[trigger].shown++;
      if (l.event_type === 'click_ai_cta') stats[trigger].clicked++;
    });
    return Object.entries(stats)
      .filter(([k]) => k !== 'unknown')
      .map(([trigger, s]) => ({
        trigger,
        shown: s.shown,
        clicked: s.clicked,
        rate: s.shown > 0 ? Math.round((s.clicked / s.shown) * 100) : 0,
      }))
      .sort((a, b) => b.rate - a.rate)
      .slice(0, 8);
  }, [logs]);

  // Top products clicked via AI
  const topProducts = useMemo(() => {
    const counts: Record<string, { name: string; count: number }> = {};
    logs.forEach(l => {
      if (l.event_type !== 'click_ai_cta' && l.event_type !== 'product_view') return;
      const productName = l.payload?.product_name || l.payload?.productName;
      const productId = l.payload?.product_id || l.payload?.productId;
      const key = productId || productName;
      if (!key) return;
      if (!counts[key]) counts[key] = { name: productName || key, count: 0 };
      counts[key].count++;
    });
    return Object.values(counts).sort((a, b) => b.count - a.count).slice(0, 10);
  }, [logs]);

  const eventKeys = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => set.add(l.event_type));
    return Array.from(set);
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black text-foreground flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" /> AI Analytics
        </h2>
        <div className="flex items-center gap-2">
          <select
            value={days}
            onChange={e => setDays(Number(e.target.value))}
            className="px-3 py-1.5 rounded-lg border border-border bg-card text-sm"
          >
            <option value={1}>Hôm nay</option>
            <option value={7}>7 ngày</option>
            <option value={30}>30 ngày</option>
          </select>
          <button onClick={fetchLogs} className="p-1.5 hover:bg-muted rounded-lg" title="Làm mới">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Tổng events', value: logs.length, icon: TrendingUp, color: 'text-primary' },
          { label: 'AI hiển thị', value: ctaStats.shows, icon: Sparkles, color: 'text-coral' },
          { label: 'CTR (click/show)', value: `${ctaStats.rate}%`, icon: MousePointerClick, color: 'text-primary' },
          { label: 'Sản phẩm click', value: topProducts.length, icon: Package, color: 'text-coral' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-xl border border-border p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
            <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Daily events chart */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-bold text-foreground mb-4">Events theo ngày</h3>
        {dailyData.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
        ) : (
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} />
              <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
              <Legend />
              {eventKeys.map((k, i) => (
                <Line
                  key={k}
                  type="monotone"
                  dataKey={k}
                  name={EVENT_LABELS[k] || k}
                  stroke={COLORS[i % COLORS.length]}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Event distribution */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-bold text-foreground mb-4">Phân bố event_type</h3>
          {eventDistribution.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={eventDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  fill="hsl(var(--primary))"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                  labelLine={false}
                  fontSize={10}
                >
                  {eventDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Trigger effectiveness */}
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-bold text-foreground mb-4">Hiệu quả Trigger (CTR)</h3>
          {triggerEffectiveness.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={triggerEffectiveness} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={11} />
                <YAxis type="category" dataKey="trigger" stroke="hsl(var(--muted-foreground))" fontSize={11} width={90} />
                <Tooltip contentStyle={{ background: 'hsl(var(--card))', border: '1px solid hsl(var(--border))', borderRadius: 8 }} />
                <Bar dataKey="rate" name="CTR (%)" fill="hsl(var(--primary))" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top products */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-bold text-foreground mb-4">Top sản phẩm được click qua AI</h3>
        {topProducts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">Chưa có dữ liệu</p>
        ) : (
          <div className="space-y-2">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-6 text-xs font-bold text-muted-foreground">#{i + 1}</span>
                <span className="flex-1 text-sm font-semibold text-foreground truncate">{p.name}</span>
                <div className="flex-1 max-w-[200px] h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full ocean-gradient"
                    style={{ width: `${(p.count / topProducts[0].count) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-bold text-primary w-10 text-right">{p.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Engagement summary */}
      <div className="bg-card rounded-xl border border-border p-4">
        <h3 className="font-bold text-foreground mb-3">Tóm tắt tương tác</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">AI hiển thị</p>
            <p className="text-lg font-black text-primary">{ctaStats.shows}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Click CTA</p>
            <p className="text-lg font-black text-coral">{ctaStats.clicks}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Đóng AI</p>
            <p className="text-lg font-black text-foreground">{ctaStats.closes}</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Tỷ lệ click (CTR)</p>
            <p className="text-lg font-black text-primary">{ctaStats.rate}%</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Tỷ lệ đóng</p>
            <p className="text-lg font-black text-coral">{ctaStats.closeRate}%</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-xs text-muted-foreground">Trigger tốt nhất</p>
            <p className="text-sm font-black text-primary">{triggerEffectiveness[0]?.trigger || '—'}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
