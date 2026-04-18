import { useState } from 'react';
import { Wallet, Loader2, Sparkles, ShoppingCart } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

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
  'Gửi cho người thân ở xa',
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

interface AIResult {
  summary: string;
  items: AIItem[];
  total_estimate: number;
}

export default function AIBudgetPlanner() {
  const [budget, setBudget] = useState<number>(1000000);
  const [need, setNeed] = useState('Quà biếu gia đình');
  const [customNote, setCustomNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AIResult | null>(null);
  const [error, setError] = useState('');
  const { addItem } = useCart();

  const handlePlan = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const query = `${need}. Ngân sách ${budget.toLocaleString('vi-VN')}đ. ${customNote}`.trim();
      const { data, error: fnErr } = await supabase.functions.invoke('ai-search', {
        body: { query, mode: 'budget', budget },
      });

      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);

      setResult(data as AIResult);
    } catch (e) {
      console.error(e);
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  const addAllToCart = () => {
    if (!result) return;
    let added = 0;
    result.items.forEach((item) => {
      if (item.type === 'product') {
        addItem({
          productId: item.id,
          name: item.name,
          price: item.price,
          unit: item.unit || 'kg',
          image: item.image,
        });
        added++;
      }
    });
    if (added > 0) toast.success(`Đã thêm ${added} sản phẩm vào giỏ`);
  };

  return (
    <section className="py-12 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            AI BUDGET PLANNER
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Chia ngân sách thông minh</h2>
          <p className="text-sm text-muted-foreground">
            Nhập ngân sách + nhu cầu, AI sẽ chọn combo tối ưu cho bạn
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-5 md:p-6 shadow-lg">
          {/* Budget */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">💰 Ngân sách</label>
            <div className="flex flex-wrap gap-2 mb-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.value}
                  onClick={() => setBudget(b.value)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-all ${
                    budget === b.value
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'bg-muted text-foreground hover:bg-primary/10'
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(Number(e.target.value) || 0)}
              min={100000}
              step={100000}
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
              placeholder="Nhập số tiền (VND)"
            />
          </div>

          {/* Need */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">🎁 Mục đích</label>
            <div className="flex flex-wrap gap-2">
              {NEEDS.map((n) => (
                <button
                  key={n}
                  onClick={() => setNeed(n)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    need === n
                      ? 'bg-accent text-accent-foreground shadow-md'
                      : 'bg-muted text-foreground hover:bg-accent/10'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Custom note */}
          <div className="mb-4">
            <label className="text-sm font-semibold mb-2 block">📝 Ghi chú (tùy chọn)</label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder="VD: gia đình 5 người, thích mực, không ăn cay..."
              className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
              maxLength={200}
            />
          </div>

          <button
            onClick={handlePlan}
            disabled={loading || budget < 100000}
            className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Đang lập kế hoạch...</>
            ) : (
              <><Sparkles className="h-4 w-4" /> Lập kế hoạch ngay</>
            )}
          </button>

          {error && (
            <p className="mt-3 text-sm text-destructive text-center">{error}</p>
          )}

          {result && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
                <p className="text-sm">{result.summary}</p>
                <p className="text-xs text-muted-foreground mt-1.5">
                  Tổng dự kiến: <span className="font-bold text-coral text-base">{result.total_estimate.toLocaleString('vi-VN')}đ</span>
                  {result.total_estimate <= budget && (
                    <span className="ml-2 text-xs text-green-600">✓ Trong ngân sách</span>
                  )}
                </p>
              </div>

              <div className="space-y-2 mb-4">
                {result.items.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="flex gap-3 p-2 border border-border rounded-lg">
                    <Link
                      to={item.type === 'product' ? `/product/${item.slug}` : '/combo'}
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
                        to={item.type === 'product' ? `/product/${item.slug}` : '/combo'}
                        className="text-sm font-semibold text-foreground hover:text-primary line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{item.reason}</p>
                      <span className="text-sm font-bold text-coral">{item.price.toLocaleString('vi-VN')}đ</span>
                    </div>
                  </div>
                ))}
              </div>

              {result.items.some((i) => i.type === 'product') && (
                <button
                  onClick={addAllToCart}
                  className="w-full bg-coral text-primary-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Thêm tất cả sản phẩm vào giỏ
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
