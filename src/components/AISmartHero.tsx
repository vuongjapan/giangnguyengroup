import { useState, useRef } from 'react';
import { Sparkles, Loader2, X, ShoppingCart, ArrowRight, Wallet, Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const SUGGESTIONS = [
  'quà biếu 1 triệu',
  'mực ngon nhậu cuối tuần',
  'tôm khô nấu canh',
  'combo Tết cao cấp',
];

const BUDGETS = [
  { label: '500K', value: 500000 },
  { label: '1 Triệu', value: 1000000 },
  { label: '2 Triệu', value: 2000000 },
  { label: '5 Triệu', value: 5000000 },
];

const NEEDS = [
  'Quà biếu gia đình',
  'Quà biếu đối tác',
  'Đồ nhậu cuối tuần',
  'Combo Tết',
];

interface AIItem {
  type: 'product' | 'combo';
  id: string;
  name: string;
  slug: string;
  price: number;
  unit?: string;
  image: string;
  reason: string;
}
interface AIResult { summary: string; items: AIItem[]; total_estimate: number; }

export default function AISmartHero() {
  const [mode, setMode] = useState<'search' | 'budget'>('search');
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState(1000000);
  const [need, setNeed] = useState('Quà biếu gia đình');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState('');
  const { addItem } = useCart();

  const sessionId = useRef(
    typeof window !== 'undefined'
      ? (localStorage.getItem('ai_session') || (() => {
          const id = `s_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
          localStorage.setItem('ai_session', id);
          return id;
        })())
      : 'srv',
  );

  const run = async (overrideQuery?: string) => {
    setError(''); setResult(null); setOpen(true); setLoading(true);
    try {
      const body = mode === 'search'
        ? { query: (overrideQuery ?? query).trim(), mode: 'search' }
        : { query: `${need}. Ngân sách ${budget.toLocaleString('vi-VN')}đ`, mode: 'budget', budget };
      if (mode === 'search' && !body.query) { setLoading(false); setOpen(false); return; }

      const { data, error: fnErr } = await supabase.functions.invoke('ai-search', {
        body, headers: { 'x-session-id': sessionId.current },
      });
      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);
      setResult(data as AIResult);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra, thử lại');
    } finally { setLoading(false); }
  };

  const quickAdd = (item: AIItem) => {
    if (item.type !== 'product') return;
    addItem({ productId: item.id, name: item.name, price: item.price, unit: item.unit || 'kg', image: item.image });
    toast.success(`Đã thêm ${item.name}`);
  };

  const addAll = () => {
    if (!result) return;
    let n = 0;
    result.items.forEach(i => { if (i.type === 'product') { quickAdd(i); n++; } });
    if (n > 0) toast.success(`Đã thêm ${n} sản phẩm`);
  };

  return (
    <>
      <section className="bg-gradient-to-b from-background via-primary/5 to-background py-5 md:py-7 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-4">
            <div className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1 rounded-full text-[11px] md:text-xs font-bold mb-2">
              <Sparkles className="h-3 w-3 animate-pulse" />
              TRỢ LÝ AI MUA SẮM
            </div>
            <h2 className="text-lg md:text-2xl font-extrabold text-foreground">
              Tìm món ngon hoặc <span className="text-primary">chia ngân sách thông minh</span>
            </h2>
          </div>

          {/* Mode tabs */}
          <div className="flex justify-center gap-1 mb-3 bg-muted rounded-full p-1 max-w-sm mx-auto">
            <button
              onClick={() => { setMode('search'); setResult(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${mode === 'search' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
            >
              <Search className="h-3.5 w-3.5" /> Tìm AI
            </button>
            <button
              onClick={() => { setMode('budget'); setResult(null); }}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${mode === 'budget' ? 'bg-card text-primary shadow-sm' : 'text-muted-foreground'}`}
            >
              <Wallet className="h-3.5 w-3.5" /> Chia NS
            </button>
          </div>

          {mode === 'search' ? (
            <div>
              <div className="flex items-center bg-background border-2 border-primary/30 rounded-full overflow-hidden shadow-md hover:border-primary transition-colors">
                <div className="pl-4 pr-1 text-primary"><Sparkles className="h-4 w-4 animate-pulse" /></div>
                <input
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && run()}
                  placeholder="VD: 'mực ngon nhậu', 'quà biếu 1 triệu'..."
                  className="flex-1 py-2.5 px-2 text-sm outline-none bg-transparent"
                />
                <button
                  onClick={() => run()}
                  disabled={loading || !query.trim()}
                  className="bg-primary text-primary-foreground px-4 md:px-5 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tìm'}
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 justify-center">
                {SUGGESTIONS.map(s => (
                  <button key={s} onClick={() => { setQuery(s); run(s); }}
                    className="text-[10px] md:text-xs bg-muted hover:bg-primary/10 text-foreground px-2.5 py-1 rounded-full">
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-xl p-3 md:p-4 shadow-sm">
              <div className="grid md:grid-cols-2 gap-3 mb-3">
                <div>
                  <label className="text-[11px] font-semibold mb-1.5 block text-muted-foreground">💰 NGÂN SÁCH</label>
                  <div className="flex flex-wrap gap-1.5">
                    {BUDGETS.map(b => (
                      <button key={b.value} onClick={() => setBudget(b.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold ${budget === b.value ? 'bg-primary text-primary-foreground shadow' : 'bg-muted'}`}>
                        {b.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold mb-1.5 block text-muted-foreground">🎁 MỤC ĐÍCH</label>
                  <div className="flex flex-wrap gap-1.5">
                    {NEEDS.map(n => (
                      <button key={n} onClick={() => setNeed(n)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-semibold ${need === n ? 'bg-accent text-accent-foreground shadow' : 'bg-muted'}`}>
                        {n}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <button onClick={() => run()} disabled={loading}
                className="w-full ocean-gradient text-primary-foreground font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 text-sm">
                {loading ? <><Loader2 className="h-4 w-4 animate-spin" /> Đang lập kế hoạch...</> : <><Sparkles className="h-4 w-4" /> Lập kế hoạch ngay</>}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Result modal */}
      {open && (
        <div className="fixed inset-0 z-[150] bg-foreground/50 backdrop-blur-sm flex items-start justify-center p-4 pt-16 md:pt-24" onClick={() => setOpen(false)}>
          <div className="bg-background rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-bold text-sm">{mode === 'budget' ? 'Kế hoạch theo ngân sách' : 'AI gợi ý cho bạn'}</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded-full"><X className="h-5 w-5" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              {loading && <div className="flex flex-col items-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary mb-3" /><p className="text-sm text-muted-foreground">AI đang chọn món...</p></div>}
              {error && <div className="text-center py-8"><p className="text-sm text-destructive">{error}</p></div>}
              {result && !loading && (
                <div>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                    <p className="text-sm">{result.summary}</p>
                    {result.total_estimate > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tổng: <span className="font-bold text-coral">{result.total_estimate.toLocaleString('vi-VN')}đ</span>
                        {mode === 'budget' && result.total_estimate <= budget && <span className="ml-2 text-green-600">✓ Trong ngân sách</span>}
                      </p>
                    )}
                  </div>
                  {result.items.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-8">Không tìm thấy. Thử từ khóa khác.</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        {result.items.map(item => (
                          <div key={`${item.type}-${item.id}`} className="flex gap-3 p-2 rounded-lg border border-border hover:bg-muted/30">
                            <Link to={item.type === 'product' ? `/product/${item.slug}` : `/combo`} onClick={() => setOpen(false)} className="flex-shrink-0">
                              <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" width={64} height={64} loading="lazy" />
                            </Link>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold line-clamp-1">{item.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">{item.reason}</p>
                              <div className="flex items-center justify-between mt-1.5">
                                <span className="text-sm font-bold text-coral">{item.price.toLocaleString('vi-VN')}đ</span>
                                {item.type === 'product' ? (
                                  <button onClick={() => quickAdd(item)} className="bg-primary text-primary-foreground px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                    <ShoppingCart className="h-3 w-3" /> Mua
                                  </button>
                                ) : (
                                  <Link to="/combo" onClick={() => setOpen(false)} className="bg-accent text-accent-foreground px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1">
                                    Xem <ArrowRight className="h-3 w-3" />
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      {mode === 'budget' && result.items.some(i => i.type === 'product') && (
                        <button onClick={addAll} className="mt-4 w-full bg-coral text-primary-foreground font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm">
                          <ShoppingCart className="h-4 w-4" /> Thêm tất cả vào giỏ
                        </button>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
