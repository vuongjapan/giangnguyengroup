import { Link } from 'react-router-dom';
import { ShoppingCart, Eye } from 'lucide-react';
import type { Product } from '@/data/products';
import { formatPrice } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();

  const handleBuy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.images[0],
    });
    toast.success(`Đã thêm ${product.name} vào giỏ hàng!`);
  };

  const hasDiscount = product.badges.includes('hot');

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="bg-card rounded-lg overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
        {/* Image container */}
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
            width={400}
            height={400}
          />
          
          {/* Badges top-left */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.badges.includes('hot') && (
              <span className="badge-hot text-[10px] md:text-xs">🔥 Bán chạy</span>
            )}
            {product.badges.includes('gift') && (
              <span className="badge-gift text-[10px] md:text-xs">🎁 Quà biếu</span>
            )}
            {product.badges.includes('limited') && (
              <span className="badge-limited text-[10px] md:text-xs">⏳ Sắp hết</span>
            )}
          </div>

          {/* Stock warning */}
          {product.stock < 10 && (
            <div className="absolute top-2 right-2 bg-destructive text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded">
              Còn {product.stock}
            </div>
          )}

          {/* Hover overlay with buttons - like Haisannang */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex gap-0">
            <button
              onClick={handleBuy}
              className="flex-1 ocean-gradient text-primary-foreground font-bold py-2.5 flex items-center justify-center gap-1.5 text-xs md:text-sm hover:opacity-90 active:scale-95"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Mua ngay
            </button>
            <span className="flex items-center justify-center px-3 bg-foreground/80 text-primary-foreground text-xs">
              <Eye className="h-3.5 w-3.5" />
            </span>
          </div>
        </div>

        {/* Info - minimal like Camudo */}
        <div className="p-2.5 md:p-3">
          <h3 className="font-semibold text-xs md:text-sm text-foreground line-clamp-2 min-h-[2.5em] leading-tight group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-base md:text-lg font-extrabold text-coral">
              {formatPrice(product.price)}
            </span>
            <span className="text-[10px] md:text-xs text-muted-foreground">/ {product.unit}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
