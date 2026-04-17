import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Users, ShoppingCart, ChefHat } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { recipeLD, breadcrumbLD } from '@/lib/seo';
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
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=600&h=400&fit=crop',
    description: 'Mực khô nướng vàng giòn, phết sa tế cay nồng – món nhậu đỉnh cao.',
    time: '15 phút', servings: '2-3 người',
    ingredients: ['200g mực khô loại 1', '2 thìa sa tế', '1 quả chanh', 'Ớt tươi, tỏi băm', 'Rau thơm ăn kèm'],
    steps: ['Nướng mực trên lửa nhỏ, lật đều tay.', 'Xé mực thành miếng vừa ăn.', 'Pha sa tế với tỏi băm, nước cốt chanh.', 'Phết sa tế lên mực, nướng thêm 1-2 phút.', 'Bày ra đĩa, thưởng thức nóng!'],
    relatedProductIds: ['1', '2'],
  },
];

export default function RecipeDetail() {
  const { id } = useParams();
  const { addItem } = useCart();
  const { products: dbProducts } = useProducts();
  const { data: dbRecipes } = useSiteContent<Recipe[] | null>('content_recipes', null);

  const recipes = dbRecipes && dbRecipes.length > 0 ? dbRecipes : DEFAULT_RECIPES;
  const allProducts = dbProducts.length > 0 ? dbProducts : staticProducts;
  const recipe = recipes.find(r => r.id === id);

  if (!recipe) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-muted-foreground">Không tìm thấy công thức</p>
          <Link to="/mon-ngon" className="text-primary hover:underline mt-4 inline-block">← Quay lại</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const relatedProducts = allProducts.filter(p =>
    (recipe.relatedProductSlugs?.length && recipe.relatedProductSlugs.includes(p.slug)) ||
    (recipe.relatedProductIds?.length && recipe.relatedProductIds.includes(p.id))
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={`${recipe.title} – Công thức chế biến hải sản | Giang Nguyên Group`}
        description={recipe.description}
        image={recipe.image}
        type="article"
        jsonLd={[
          recipeLD({
            name: recipe.title,
            description: recipe.description,
            image: recipe.image,
            prepTime: recipe.time,
            servings: recipe.servings,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
          }),
          breadcrumbLD([
            { name: 'Trang chủ', url: '/' },
            { name: 'Món ngon', url: '/mon-ngon' },
            { name: recipe.title, url: `/mon-ngon/${recipe.id}` },
          ]),
        ]}
      />
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <Link to="/mon-ngon" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Quay lại Món ngon
        </Link>

        <span className="block text-xs font-bold text-primary bg-primary/10 px-3 py-1 rounded-full w-fit mb-3">{recipe.category}</span>
        <h1 className="text-2xl md:text-3xl font-black text-foreground mb-3">{recipe.title}</h1>
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-6">
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {recipe.time}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {recipe.servings}</span>
        </div>

        <img src={recipe.image} alt={recipe.title} className="w-full rounded-2xl mb-8 aspect-video object-cover" />
        <p className="text-foreground/90 leading-relaxed mb-8 text-sm">{recipe.description}</p>

        <div className="space-y-6">
          <div>
            <h2 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">🥘 Nguyên liệu</h2>
            <ul className="space-y-2">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary">•</span> {ing}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="font-bold text-lg text-foreground mb-3 flex items-center gap-2">👨‍🍳 Cách chế biến</h2>
            <ol className="space-y-3">
              {recipe.steps.map((step, i) => (
                <li key={i} className="text-sm text-muted-foreground flex gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full ocean-gradient text-primary-foreground flex items-center justify-center text-xs font-bold">{i + 1}</span>
                  <span className="pt-1">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>

        {relatedProducts.length > 0 && (
          <div className="mt-10 bg-primary/5 rounded-2xl p-6 border border-primary/20">
            <h3 className="text-lg font-extrabold text-foreground mb-1">🛒 Mua nguyên liệu tại shop</h3>
            <p className="text-sm text-muted-foreground mb-4">Hải sản chính gốc Sầm Sơn – Ship toàn quốc</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {relatedProducts.map(p => (
                <div key={p.id} className="bg-card rounded-xl border border-border p-3 flex items-center gap-3">
                  <Link to={`/product/${p.slug}`}>
                    <img src={p.images[0]} alt={p.name} className="w-20 h-20 object-cover rounded-lg flex-shrink-0" />
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link to={`/product/${p.slug}`} className="font-bold text-sm text-foreground hover:text-primary transition-colors line-clamp-1">{p.name}</Link>
                    <p className="text-coral font-extrabold text-sm">{formatPrice(p.price)}/{p.unit}</p>
                    <button
                      onClick={() => addItem({ productId: p.id, name: p.name, price: p.price, unit: p.unit, image: p.images[0] })}
                      className="mt-1 bg-coral text-primary-foreground text-xs font-bold px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity flex items-center gap-1"
                    >
                      <ShoppingCart className="h-3 w-3" /> Mua ngay
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
