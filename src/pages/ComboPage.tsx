import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gift, Percent, ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface DBCombo {
  id: string; name: string; slug: string; tag: string; tag_color: string;
  category: string; description: string; product_ids: string[];
  original_price: number; combo_price: number; image: string; images: string[];
  is_active: boolean; sort_order: number;
}

interface DBProduct {
  id: string; name: string; slug: string; price: number; unit: string;
  images: string[]; grade: string;
}

const comboCategories = ['Tất cả', 'Quà Tết', 'Quà biếu sếp', 'Quà gia đình', 'Combo tiết kiệm', 'Quà biếu'];

export default function ComboPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [combos, setCombos] = useState<DBCombo[]>([]);
  const [products, setProducts] = useState<DBProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      const [combosRes, productsRes] = await Promise.all([
        supabase.from('combos').select('*').eq('is_active', true).order('sort_order'),
        supabase.from('products').select('id, name, slug, price, unit, images, grade').eq('is_active', true),
      ]);
      if (combosRes.data) setCombos(combosRes.data as unknown as DBCombo[]);
      if (productsRes.data) setProducts(productsRes.data as unknown as DBProduct[]);
      setLoading(false);
    };
    fetchData();
  }, []);

  const filtered = activeCategory === 'Tất cả' ? combos : combos.filter(c => c.category === activeCategory);

  const addComboToCart = (combo: DBCombo) => {
    combo.product_ids.forEach(pid => {
      const product = products.find(p => p.id === pid);
      if (product) {
        addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          image: product.images[0],
          unit: product.unit,
        });
      }
    });
    toast.success(`Đã thêm ${combo.name} vào giỏ hàng!`);
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-6xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Về trang chủ
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2 flex items-center justify-center gap-2">
            <Gift className="h-7 w-7 text-accent" /> COMBO QUÀ BIẾU
          </h1>
          <p className="text-muted-foreground text-sm">Tiết kiệm hơn khi mua combo – Đóng hộp quà sang trọng</p>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-6 scrollbar-hide">
          {comboCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`flex-shrink-0 px-5 py-2 rounded-full text-sm font-bold transition-all ${
                activeCategory === cat
                  ? 'ocean-gradient text-primary-foreground shadow-md'
                  : 'bg-muted text-foreground hover:bg-primary/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <Gift className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Chưa có combo nào trong danh mục này.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filtered.map(combo => {
              const savings = combo.original_price - combo.combo_price;
              const savingsPercent = combo.original_price > 0 ? Math.round((savings / combo.original_price) * 100) : 0;
              const comboProducts = combo.product_ids.map(id => products.find(p => p.id === id)).filter(Boolean);

              return (
                <div key={combo.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-muted overflow-hidden">
                    <img src={combo.image || combo.images?.[0] || '/placeholder.svg'} alt={combo.name} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                    <div className="absolute top-3 left-3 flex gap-2">
                      {combo.tag && (
                        <span className={`${combo.tag_color} px-3 py-1 rounded-full text-xs font-bold`}>{combo.tag}</span>
                      )}
                      {savingsPercent > 0 && (
                        <span className="bg-coral text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Percent className="h-3 w-3" /> -{savingsPercent}%
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-3 left-4 right-4">
                      <h3 className="text-lg font-black text-primary-foreground">{combo.name}</h3>
                    </div>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-muted-foreground mb-4">{combo.description}</p>

                    {comboProducts.length > 0 && (
                      <div className="space-y-2 mb-4">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Bao gồm:</p>
                        {comboProducts.map(p => p && (
                          <div key={p.id} className="flex items-center gap-3 p-2 bg-muted rounded-lg">
                            <img src={p.images[0]} alt={p.name} className="w-10 h-10 rounded-lg object-cover" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-foreground">{p.name}</p>
                              <p className="text-xs text-muted-foreground">{p.grade}</p>
                            </div>
                            <span className="text-xs text-muted-foreground line-through">{formatPrice(p.price)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground line-through">{formatPrice(combo.original_price)}</p>
                        <p className="text-2xl font-black text-coral">{formatPrice(combo.combo_price)}</p>
                      </div>
                      {savings > 0 && (
                        <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-center">
                          <p className="text-xs text-muted-foreground">Tiết kiệm</p>
                          <p className="text-lg font-black text-accent">{formatPrice(savings)}</p>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => addComboToCart(combo)}
                      className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-xl text-sm hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                      <ShoppingCart className="h-4 w-4" /> THÊM VÀO GIỎ HÀNG
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-10 ocean-gradient rounded-2xl p-8 text-center">
          <h3 className="text-xl font-black text-primary-foreground mb-2">Đặt combo ngay – Tiết kiệm đến 20%!</h3>
          <p className="text-primary-foreground/80 text-sm mb-4">Tất cả combo đều được đóng hộp quà sang trọng • Giao hàng toàn quốc</p>
          <a href="tel:0933562286"
            className="inline-block bg-accent text-accent-foreground font-bold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity">
            📞 GỌI ĐẶT HÀNG NGAY
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
