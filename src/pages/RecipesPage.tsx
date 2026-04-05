import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, ShoppingCart, Clock, Users } from 'lucide-react';
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
  relatedProductIds?: string[];
  relatedProductSlugs?: string[];
}

const DEFAULT_RECIPES: Recipe[] = [
  {
    id: 'r1', title: 'Mực khô nướng sa tế', category: 'Mực',
    image: staticProducts[0]?.images[0] || '/placeholder.svg',
    description: 'Mực khô nướng vàng giòn, phết sa tế cay nồng – món nhậu đỉnh cao mỗi cuối tuần.',
    time: '15 phút', servings: '2-3 người',
    ingredients: ['200g mực khô loại 1', '2 thìa sa tế', '1 quả chanh', 'Ớt tươi, tỏi băm', 'Rau thơm ăn kèm'],
    steps: ['Nướng mực trên lửa nhỏ.', 'Xé mực thành miếng vừa ăn.', 'Pha sa tế với tỏi băm, nước cốt chanh.', 'Phết sa tế lên mực, nướng thêm.', 'Thưởng thức nóng!'],
    relatedProductIds: ['1', '2'],
  },
  {
    id: 'r2', title: 'Cá thu 1 nắng chiên giòn', category: 'Cá',
    image: staticProducts[4]?.images[0] || '/placeholder.svg',
    description: 'Da cá giòn tan, thịt trắng mềm ngọt – chấm nước mắm tỏi ớt, cả nhà hao cơm.',
    time: '20 phút', servings: '3-4 người',
    ingredients: ['500g cá thu 1 nắng', '2 thìa bột chiên giòn', 'Dầu ăn', 'Nước mắm, tỏi, ớt, chanh'],
    steps: ['Rã đông cá thu tự nhiên.', 'Tẩm bột mỏng đều.', 'Chiên lửa vừa đến vàng giòn.', 'Pha nước mắm chua ngọt.', 'Chấm nước mắm!'],
    relatedProductIds: ['5'],
  },
  {
    id: 'r3', title: 'Mực trứng hấp bia', category: 'Mực',
    image: staticProducts[3]?.images[0] || '/placeholder.svg',
    description: 'Trứng mực béo ngậy nở bung khi hấp bia – món thần thánh.',
    time: '25 phút', servings: '2 người',
    ingredients: ['300g mực trứng', '1 lon bia', 'Gừng thái sợi', 'Hành lá, rau mùi', 'Muối tiêu chanh'],
    steps: ['Rửa sạch mực trứng.', 'Xếp mực vào nồi hấp, rải gừng sợi.', 'Đổ bia vào, hấp 15-20 phút.', 'Rắc hành lá.', 'Chấm muối tiêu chanh!'],
    relatedProductIds: ['4'],
  },
  {
    id: 'r4', title: 'Cá chỉ vàng nướng tỏi ớt', category: 'Cá',
    image: staticProducts[5]?.images[0] || '/placeholder.svg',
    description: 'Xé từng sợi cá chỉ vàng nướng giòn, tỏi ớt cay nhẹ.',
    time: '10 phút', servings: '2-3 người',
    ingredients: ['200g cá chỉ vàng khô', '3 tép tỏi băm', 'Ớt bột', 'Mật ong', '1 thìa dầu mè'],
    steps: ['Nướng cá trên lửa nhỏ.', 'Xé cá thành sợi mỏng.', 'Phi tỏi, thêm ớt bột, mật ong.', 'Trộn sốt với cá.', 'Nhắm bia lạnh!'],
    relatedProductIds: ['6'],
  },
  {
    id: 'r5', title: 'Nem chua cuốn rau sống', category: 'Tôm',
    image: staticProducts[6]?.images[0] || '/placeholder.svg',
    description: 'Nem chua Thanh Hóa chua dịu cuốn bánh tráng rau sống.',
    time: '5 phút', servings: '3-4 người',
    ingredients: ['20 cái nem chua', 'Bánh tráng', 'Rau sống', 'Tương ớt'],
    steps: ['Bóc nem chua ra đĩa.', 'Rửa sạch rau sống.', 'Nhúng bánh tráng cho mềm.', 'Cuốn rau, nem, dưa leo.', 'Chấm tương ớt!'],
    relatedProductIds: ['7'],
  },
];

const CATEGORIES = ['Tất cả', 'Mực', 'Cá', 'Tôm'];

export default function RecipesPage() {
  const { addItem } = useCart();
  const { products: dbProducts } = useProducts();
  const { data: dbRecipes } = useSiteContent<Recipe[] | null>('content_recipes', null);
  const [activeCategory, setActiveCategory] = useState('Tất cả');

  const recipes = dbRecipes && dbRecipes.length > 0 ? dbRecipes : DEFAULT_RECIPES;
  const allProducts = dbProducts.length > 0 ? dbProducts : staticProducts;
  const filtered = activeCategory === 'Tất cả' ? recipes : recipes.filter(r => r.category === activeCategory);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <section className="ocean-gradient text-primary-foreground py-12 md:py-16 text-center">
        <div className="container mx-auto px-4">
          <ChefHat className="h-12 w-12 mx-auto mb-4 opacity-80" />
          <h1 className="text-3xl md:text-4xl font-black mb-3">MÓN NGON ẨM THỰC</h1>
          <p className="text-lg opacity-90 max-w-xl mx-auto">Hướng dẫn chế biến hải sản Sầm Sơn chuẩn vị – Mua nguyên liệu ngay tại shop!</p>
        </div>
      </section>

      <section className="py-6 border-b border-border sticky top-0 bg-background z-30">
        <div className="container mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto pb-1">
            {CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setActiveCategory(cat)}
                className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors ${activeCategory === cat ? 'ocean-gradient text-primary-foreground' : 'bg-muted text-foreground hover:bg-muted/80'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(recipe => {
              const relatedProducts = allProducts.filter(p =>
                (recipe.relatedProductSlugs?.length && recipe.relatedProductSlugs.includes(p.slug)) ||
                (recipe.relatedProductIds?.length && recipe.relatedProductIds.includes(p.id))
              );

              return (
                <div key={recipe.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow group">
                  <Link to={`/mon-ngon/${recipe.id}`}>
                    <div className="aspect-[4/3] overflow-hidden relative">
                      <img src={recipe.image} alt={recipe.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                      <div className="absolute bottom-3 left-3 flex gap-2">
                        <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {recipe.time}
                        </span>
                        <span className="bg-card text-foreground px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                          <Users className="h-3 w-3" /> {recipe.servings}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="p-5">
                    <span className="text-xs font-bold text-primary uppercase">{recipe.category}</span>
                    <Link to={`/mon-ngon/${recipe.id}`}>
                      <h3 className="font-black text-lg text-foreground mt-1 mb-2 hover:text-primary transition-colors">{recipe.title}</h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mb-4">{recipe.description}</p>

                    <Link to={`/mon-ngon/${recipe.id}`}
                      className="text-sm font-bold text-primary hover:underline mb-4 inline-block">
                      Xem chi tiết →
                    </Link>

                    {relatedProducts.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-xs font-bold text-muted-foreground mb-2 uppercase">Nguyên liệu tại shop</p>
                        <div className="space-y-2">
                          {relatedProducts.slice(0, 2).map(p => (
                            <Link key={p.id} to={`/product/${p.slug}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-muted transition-colors">
                              <img src={p.images[0]} alt={p.name} className="w-12 h-12 rounded-lg object-cover" loading="lazy" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-foreground truncate">{p.name}</p>
                                <p className="text-xs text-coral font-bold">{formatPrice(p.price)}/{p.unit}</p>
                              </div>
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
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
