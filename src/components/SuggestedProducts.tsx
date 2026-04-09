import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';

interface Props {
  currentProductId: string;
  currentCategory: string;
}

export default function SuggestedProducts({ currentProductId, currentCategory }: Props) {
  const { products } = useProducts();

  const sameCategory = products.filter(p => p.id !== currentProductId && p.category === currentCategory).slice(0, 4);
  const otherProducts = products.filter(p => p.id !== currentProductId && p.category !== currentCategory).slice(0, 4);

  return (
    <div className="space-y-8 mt-8">
      {/* Same category */}
      {sameCategory.length > 0 && (
        <section>
          <h2 className="text-lg font-extrabold text-foreground mb-4 flex items-center gap-2">
            📦 Cùng danh mục
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
            {sameCategory.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}

      {/* You might like */}
      {otherProducts.length > 0 && (
        <section>
          <h2 className="text-lg font-extrabold text-foreground mb-4 flex items-center gap-2">
            💡 Có thể bạn thích
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 md:gap-4">
            {otherProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}
