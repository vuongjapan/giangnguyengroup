import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ShoppingCart, Clock, Users, Flame } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { products as staticProducts, formatPrice } from '@/data/products';
import { useProducts } from '@/hooks/useProducts';
import { useCart } from '@/contexts/CartContext';
import { useSiteContent } from '@/hooks/useSiteContent';

interface Recipe {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  time: string;
  servings: string;
  ingredients: string[];
  steps: string[];
  relatedProductIds: string[];
}

const RECIPES: Recipe[] = [
  {
    id: 'r1',
    title: 'Mực khô nướng sa tế',
    category: 'Mực',
    image: products[0].images[0],
    description: 'Mực khô nướng vàng giòn, phết sa tế cay nồng – món nhậu đỉnh cao mỗi cuối tuần.',
    time: '15 phút',
    servings: '2-3 người',
    ingredients: ['200g mực khô loại 1', '2 thìa sa tế', '1 quả chanh', 'Ớt tươi, tỏi băm', 'Rau thơm ăn kèm'],
    steps: [
      'Nướng mực trên lửa nhỏ, lật đều tay đến khi phồng lên vàng rộm.',
      'Xé mực thành miếng vừa ăn, dùng chày đập nhẹ cho mềm.',
      'Pha sa tế với tỏi băm, nước cốt chanh, đường.',
      'Phết sa tế lên mực, nướng thêm 1-2 phút cho thấm.',
      'Bày ra đĩa, thêm rau thơm, ớt tươi. Thưởng thức nóng!',
    ],
    relatedProductIds: ['1', '2'],
  },
  {
    id: 'r2',
    title: 'Cá thu 1 nắng chiên giòn',
    category: 'Cá',
    image: products[4].images[0],
    description: 'Da cá giòn tan, thịt trắng mềm ngọt lịm – chấm nước mắm tỏi ớt, cả nhà hao cơm.',
    time: '20 phút',
    servings: '3-4 người',
    ingredients: ['500g cá thu 1 nắng', '2 thìa bột chiên giòn', 'Dầu ăn', 'Nước mắm, tỏi, ớt, chanh, đường'],
    steps: [
      'Rã đông cá thu tự nhiên, thấm khô bằng khăn giấy.',
      'Tẩm bột mỏng đều hai mặt (tùy chọn).',
      'Chiên lửa vừa trong dầu nóng đến khi da vàng giòn.',
      'Pha nước mắm: 2 thìa nước mắm + 1 thìa đường + chanh + tỏi ớt băm.',
      'Bày cá ra đĩa lá chuối, rắc hành phi. Chấm nước mắm – tuyệt vời!',
    ],
    relatedProductIds: ['5'],
  },
  {
    id: 'r3',
    title: 'Mực trứng hấp bia',
    category: 'Mực',
    image: products[3].images[0],
    description: 'Trứng mực béo ngậy nở bung khi hấp bia – món thần thánh dân nhậu Sầm Sơn.',
    time: '25 phút',
    servings: '2 người',
    ingredients: ['300g mực trứng', '1 lon bia', 'Gừng thái sợi', 'Hành lá, rau mùi', 'Muối tiêu chanh'],
    steps: [
      'Rửa sạch mực trứng, giữ nguyên con. Không bóp mạnh sẽ vỡ trứng.',
      'Xếp mực vào nồi hấp, rải gừng sợi lên trên.',
      'Đổ bia vào, đậy nắp. Hấp lửa vừa 15-20 phút.',
      'Mực chín, trứng nở bung ra vàng ươm. Rắc hành lá, rau mùi.',
      'Chấm muối tiêu chanh – béo ngậy, thơm lừng. Cực phẩm!',
    ],
    relatedProductIds: ['4'],
  },
  {
    id: 'r4',
    title: 'Cá chỉ vàng nướng tỏi ớt',
    category: 'Cá',
    image: products[5].images[0],
    description: 'Xé từng sợi cá chỉ vàng nướng giòn, tỏi ớt cay nhẹ – bạn nhậu hoàn hảo của bia lạnh.',
    time: '10 phút',
    servings: '2-3 người',
    ingredients: ['200g cá chỉ vàng khô', '3 tép tỏi băm', 'Ớt bột', 'Mật ong hoặc đường', '1 thìa dầu mè'],
    steps: [
      'Nướng cá chỉ vàng trên lửa nhỏ đều, lật thường xuyên.',
      'Xé cá thành sợi mỏng vừa ăn.',
      'Phi tỏi băm thơm, thêm ớt bột, mật ong, dầu mè trộn đều.',
      'Trộn sốt tỏi ớt với cá đã xé.',
      'Bày ra đĩa, thêm lá chanh thái sợi. Nhắm bia lạnh – chuẩn!',
    ],
    relatedProductIds: ['6'],
  },
  {
    id: 'r5',
    title: 'Nem chua cuốn rau sống',
    category: 'Tôm',
    image: products[6].images[0],
    description: 'Nem chua Thanh Hóa chua dịu cuốn bánh tráng rau sống – đơn giản mà ngon bất ngờ.',
    time: '5 phút',
    servings: '3-4 người',
    ingredients: ['20 cái nem chua Thanh Hóa', 'Bánh tráng', 'Rau sống: xà lách, rau thơm, dưa leo', 'Tương ớt, tỏi phi'],
    steps: [
      'Bóc nem chua ra đĩa, cắt đôi hoặc để nguyên.',
      'Rửa sạch rau sống, thái dưa leo thanh dài.',
      'Nhúng bánh tráng nước nhanh cho mềm.',
      'Đặt rau, nem, dưa leo lên bánh tráng. Cuốn chặt.',
      'Chấm tương ớt hoặc mắm chua ngọt. Ăn vặt cực đã!',
    ],
    relatedProductIds: ['7'],
  },
];

const CATEGORIES = ['Tất cả', 'Mực', 'Cá', 'Tôm'];

export default function RecipesPage() {
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);

  const filtered = activeCategory === 'Tất cả' ? RECIPES : RECIPES.filter(r => r.category === activeCategory);

  const handleBuyIngredients = (productIds: string[]) => {
    productIds.forEach(pid => {
      const product = products.find(p => p.id === pid);
      if (product) {
        addItem({
          productId: product.id,
          name: product.name,
          price: product.price,
          unit: product.unit,
          image: product.images[0],
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="ocean-gradient text-primary-foreground py-12 md:py-16 text-center">
        <div className="container mx-auto px-4">
          <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-black mb-3">MÓN NGON ẨM THỰC</h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto">
            Hướng dẫn chế biến hải sản Sầm Sơn chuẩn vị – Mua nguyên liệu ngay tại shop!
          </p>
        </div>
      </section>

      {/* Category filter */}
      <section className="py-6 border-b border-border sticky top-0 bg-background z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'ocean-gradient text-primary-foreground'
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Recipes */}
      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(recipe => {
              const isExpanded = expandedRecipe === recipe.id;
              const relatedProducts = recipe.relatedProductIds.map(id => products.find(p => p.id === id)).filter(Boolean);

              return (
                <div key={recipe.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover" loading="lazy" />
                    <div className="absolute bottom-3 left-3 flex gap-2">
                      <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Clock className="h-3 w-3" /> {recipe.time}
                      </span>
                      <span className="bg-card text-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                        <Users className="h-3 w-3" /> {recipe.servings}
                      </span>
                    </div>
                  </div>

                  <div className="p-5">
                    <span className="text-xs font-bold text-primary uppercase">{recipe.category}</span>
                    <h3 className="font-black text-lg text-foreground mt-1 mb-2">{recipe.title}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{recipe.description}</p>

                    <button
                      onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
                      className="text-sm font-bold text-primary hover:underline mb-4"
                    >
                      {isExpanded ? 'Thu gọn ↑' : 'Xem công thức ↓'}
                    </button>

                    {isExpanded && (
                      <div className="space-y-4 mt-4 border-t border-border pt-4 animate-fade-in">
                        <div>
                          <h4 className="font-bold text-sm text-foreground mb-2">🥘 Nguyên liệu</h4>
                          <ul className="space-y-1">
                            {recipe.ingredients.map((ing, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <span className="text-primary">•</span> {ing}
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-foreground mb-2">👨‍🍳 Cách chế biến</h4>
                          <ol className="space-y-2">
                            {recipe.steps.map((step, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex gap-3">
                                <span className="flex-shrink-0 w-6 h-6 rounded-full ocean-gradient text-primary-foreground flex items-center justify-center text-xs font-bold">{i + 1}</span>
                                <span>{step}</span>
                              </li>
                            ))}
                          </ol>
                        </div>
                      </div>
                    )}

                    {/* Related products */}
                    <div className="mt-4 pt-4 border-t border-border">
                      <p className="text-xs font-bold text-muted-foreground mb-2 uppercase">Nguyên liệu tại shop</p>
                      <div className="space-y-2">
                        {relatedProducts.map(p => p && (
                          <Link
                            key={p.id}
                            to={`/product/${p.slug}`}
                            className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors"
                          >
                            <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                              <p className="text-xs text-coral font-bold">{formatPrice(p.price)}/{p.unit}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <button
                        onClick={() => handleBuyIngredients(recipe.relatedProductIds)}
                        className="w-full mt-3 bg-coral text-primary-foreground font-bold py-2.5 rounded-xl text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="h-4 w-4" /> Mua nguyên liệu ngay
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
