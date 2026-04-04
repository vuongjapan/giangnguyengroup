import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Gift, Star, Percent, ShoppingCart } from 'lucide-react';
import { products, formatPrice } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

interface Combo {
  id: string;
  name: string;
  tag: string;
  tagColor: string;
  category: string;
  description: string;
  productIds: string[];
  originalPrice: number;
  comboPrice: number;
  image: string;
}

const combos: Combo[] = [
  {
    id: 'combo-tet',
    name: 'Combo Quà Tết Cao Cấp',
    tag: '🔥 HOT',
    tagColor: 'bg-coral text-primary-foreground',
    category: 'Quà Tết',
    description: 'Mực khô loại 1 + Mực trứng + Cá thu 1 nắng – Bộ 3 đặc sản biển Sầm Sơn sang trọng, thích hợp biếu Tết.',
    productIds: ['1', '4', '5'],
    originalPrice: 2230000,
    comboPrice: 1899000,
    image: products[0]?.images[0] || '',
  },
  {
    id: 'combo-bieu-sep',
    name: 'Combo Biếu Sếp – Diamond',
    tag: '💎 Cao cấp',
    tagColor: 'bg-purple-600 text-primary-foreground',
    category: 'Quà biếu sếp',
    description: 'Mực khô loại 1 + Mực trứng – Đóng hộp quà gỗ sang trọng, kèm thiệp chúc.',
    productIds: ['1', '4'],
    originalPrice: 1950000,
    comboPrice: 1699000,
    image: products[3]?.images[0] || '',
  },
  {
    id: 'combo-gia-dinh',
    name: 'Combo Gia Đình Vui Vẻ',
    tag: '⭐ Phổ biến',
    tagColor: 'bg-accent text-accent-foreground',
    category: 'Quà gia đình',
    description: 'Mực khô loại 2 + Cá thu 1 nắng + Nem chua – Bữa cơm gia đình thêm đặc biệt.',
    productIds: ['2', '5', '7'],
    originalPrice: 1680000,
    comboPrice: 1399000,
    image: products[1]?.images[0] || '',
  },
  {
    id: 'combo-tiet-kiem',
    name: 'Combo Tiết Kiệm – Nhập Môn',
    tag: '💰 Tiết kiệm',
    tagColor: 'bg-green-600 text-primary-foreground',
    category: 'Combo tiết kiệm',
    description: 'Mực 1 nắng + Cá chỉ vàng + Nem chua – Combo dành cho ai mới thử hải sản Sầm Sơn.',
    productIds: ['3', '6', '7'],
    originalPrice: 1050000,
    comboPrice: 849000,
    image: products[2]?.images[0] || '',
  },
];

const comboCategories = ['Tất cả', 'Quà Tết', 'Quà biếu sếp', 'Quà gia đình', 'Combo tiết kiệm'];

export default function ComboPage() {
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const { addItem } = useCart();

  const filtered = activeCategory === 'Tất cả' ? combos : combos.filter(c => c.category === activeCategory);

  const addComboToCart = (combo: Combo) => {
    combo.productIds.forEach(pid => {
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

        {/* Combos grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map(combo => {
            const savings = combo.originalPrice - combo.comboPrice;
            const savingsPercent = Math.round((savings / combo.originalPrice) * 100);
            const comboProducts = combo.productIds.map(id => products.find(p => p.id === id)).filter(Boolean);

            return (
              <div key={combo.id} className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-shadow">
                {/* Header with image */}
                <div className="relative h-48 bg-muted overflow-hidden">
                  <img src={combo.image} alt={combo.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
                  <div className="absolute top-3 left-3 flex gap-2">
                    <span className={`${combo.tagColor} px-3 py-1 rounded-full text-xs font-bold`}>
                      {combo.tag}
                    </span>
                    <span className="bg-coral text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                      <Percent className="h-3 w-3" /> -{savingsPercent}%
                    </span>
                  </div>
                  <div className="absolute bottom-3 left-4 right-4">
                    <h3 className="text-lg font-black text-primary-foreground">{combo.name}</h3>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <p className="text-sm text-muted-foreground mb-4">{combo.description}</p>

                  {/* Products in combo */}
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

                  {/* Price */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-xs text-muted-foreground line-through">{formatPrice(combo.originalPrice)}</p>
                      <p className="text-2xl font-black text-coral">{formatPrice(combo.comboPrice)}</p>
                    </div>
                    <div className="bg-accent/10 border border-accent/30 rounded-lg px-3 py-2 text-center">
                      <p className="text-xs text-muted-foreground">Tiết kiệm</p>
                      <p className="text-lg font-black text-accent">{formatPrice(savings)}</p>
                    </div>
                  </div>

                  {/* CTA */}
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

        {/* Trust section */}
        <div className="mt-10 ocean-gradient rounded-2xl p-8 text-center">
          <h3 className="text-xl font-black text-primary-foreground mb-2">Đặt combo ngay – Tiết kiệm đến 20%!</h3>
          <p className="text-primary-foreground/80 text-sm mb-4">Tất cả combo đều được đóng hộp quà sang trọng • Giao hàng toàn quốc</p>
          <a href="tel:0123456789"
            className="inline-block bg-accent text-accent-foreground font-bold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity">
            📞 GỌI ĐẶT HÀNG NGAY
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
