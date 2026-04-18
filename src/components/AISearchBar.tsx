import { useState, useRef, useEffect } from 'react';
import { Sparkles, Loader2, X, ShoppingCart, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

const SUGGESTIONS = [
  'quà biếu 1 triệu',
  'mực ngon nhậu cuối tuần',
  'tôm khô nấu canh',
  'đồ gửi Nhật được',
  'combo Tết cao cấp',
  'đặc sản Sầm Sơn',
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
  original_price?: number;
}

interface AIResult {
  summary: string;
  items: AIItem[];
  total_estimate: number;
}

export default function AISearchBar() {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
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

  const handleSearch = async (q?: string) => {
    const text = (q ?? query).trim();
    if (!text) return;
    setQuery(text);
    setOpen(true);
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const { data, error: fnErr } = await supabase.functions.invoke('ai-search', {
        body: { query: text, mode: 'search' },
        headers: { 'x-session-id': sessionId.current },
      });

      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);

      setResult(data as AIResult);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (item: AIItem) => {
    if (item.type !== 'product') return;
    addItem({
      productId: item.id,
      name: item.name,
      price: item.price,
      unit: item.unit || 'kg',
      image: item.image,
    });
    toast.success(`Đã thêm ${item.name}`);
    // Log click
    supabase.functions.invoke('ai-search').catch(() => {});
    supabase.from('ai_logs').insert({
      session_id: sessionId.current,
      event_type: 'ai_search_add',
      payload: { product_id: item.id, name: item.name },
    });
  };

  const handleClick = (item: AIItem) => {
    supabase.from('ai_logs').insert({
      session_id: sessionId.current,
      event_type: 'ai_search_click',
      payload: { id: item.id, type: item.type, name: item.name },
    });
    setOpen(false);
  };

  return (
    <>
      {/* Bar */}
      <div className="relative w-full">
        <div className="flex items-center bg-background border-2 border-primary/30 rounded-full overflow-hidden shadow-lg hover:border-primary transition-colors">
          <div className="flex items-center gap-1.5 pl-4 pr-2 text-primary">
            <Sparkles className="h-4 w-4 animate-pulse" />
            <span className="text-xs font-bold hidden sm:inline">AI</span>
          </div>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            onFocus={() => !result && setOpen(false)}
            placeholder="Bạn muốn mua gì? VD: 'quà biếu 1 triệu'..."
            className="flex-1 py-2.5 px-2 text-sm outline-none bg-transparent text-foreground placeholder:text-muted-foreground"
          />
          <button
            onClick={() => handleSearch()}
            disabled={loading || !query.trim()}
            className="bg-primary text-primary-foreground px-4 py-2.5 text-sm font-bold hover:opacity-90 disabled:opacity-50 transition-opacity"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tìm'}
          </button>
        </div>
        {/* Quick suggestions */}
        <div className="flex flex-wrap gap-1.5 mt-2 px-1">
          {SUGGESTIONS.slice(0, 4).map((s) => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              className="text-[10px] md:text-xs bg-muted hover:bg-primary/10 text-foreground px-2 py-1 rounded-full transition-colors"
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Result modal */}
      {open && (
        <div
          className="fixed inset-0 z-[150] bg-foreground/50 backdrop-blur-sm flex items-start justify-center p-4 pt-16 md:pt-24 animate-fade-in"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-background rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col shadow-2xl animate-slide-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-gradient-to-r from-primary/5 to-accent/5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="font-bold">AI gợi ý cho bạn</span>
              </div>
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-muted rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {loading && (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
                  <p className="text-sm text-muted-foreground">AI đang tìm món phù hợp nhất...</p>
                </div>
              )}

              {error && (
                <div className="text-center py-8">
                  <p className="text-sm text-destructive">{error}</p>
                  <button
                    onClick={() => handleSearch()}
                    className="mt-3 text-sm text-primary hover:underline"
                  >
                    Thử lại
                  </button>
                </div>
              )}

              {result && !loading && (
                <div>
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                    <p className="text-sm text-foreground">{result.summary}</p>
                    {result.total_estimate > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Tổng dự kiến: <span className="font-bold text-coral">{result.total_estimate.toLocaleString('vi-VN')}đ</span>
                      </p>
                    )}
                  </div>

                  {result.items.length === 0 ? (
                    <p className="text-sm text-center text-muted-foreground py-8">
                      Không tìm thấy món phù hợp. Hãy thử từ khóa khác.
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {result.items.map((item) => (
                        <div
                          key={`${item.type}-${item.id}`}
                          className="flex gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors border border-border"
                        >
                          <Link
                            to={item.type === 'product' ? `/product/${item.slug}` : `/combo`}
                            onClick={() => handleClick(item)}
                            className="flex-shrink-0"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 rounded-lg object-cover"
                              width={64}
                              height={64}
                              loading="lazy"
                            />
                          </Link>
                          <div className="flex-1 min-w-0">
                            <Link
                              to={item.type === 'product' ? `/product/${item.slug}` : `/combo`}
                              onClick={() => handleClick(item)}
                              className="block"
                            >
                              <h4 className="text-sm font-semibold text-foreground hover:text-primary line-clamp-1">
                                {item.name}
                              </h4>
                              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.reason}</p>
                            </Link>
                            <div className="flex items-center justify-between mt-1.5">
                              <span className="text-sm font-bold text-coral">
                                {item.price.toLocaleString('vi-VN')}đ
                                {item.unit && <span className="text-[10px] text-muted-foreground font-normal">/{item.unit}</span>}
                              </span>
                              {item.type === 'product' ? (
                                <button
                                  onClick={() => handleQuickAdd(item)}
                                  className="bg-primary text-primary-foreground px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1 hover:opacity-90"
                                >
                                  <ShoppingCart className="h-3 w-3" />
                                  Mua
                                </button>
                              ) : (
                                <Link
                                  to="/combo"
                                  onClick={() => handleClick(item)}
                                  className="bg-accent text-accent-foreground px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1"
                                >
                                  Xem <ArrowRight className="h-3 w-3" />
                                </Link>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
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
