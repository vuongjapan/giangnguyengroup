import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
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

  return (
    <Link to={`/product/${product.slug}`} className="group block">
      <div className="bg-card rounded-xl overflow-hidden border border-border card-hover">
        <div className="relative aspect-square overflow-hidden bg-muted">
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
            width={400}
            height={400}
          />
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {product.badges.includes('hot') && <span className="badge-hot">🔥 Bán chạy</span>}
            {product.badges.includes('gift') && <span className="badge-gift">🎁 Quà biếu</span>}
            {product.badges.includes('limited') && <span className="badge-limited">⏳ Sắp hết</span>}
          </div>
          {product.stock < 10 && (
            <div className="absolute bottom-2 left-2 bg-foreground/80 text-primary-foreground text-xs px-2 py-0.5 rounded">
              Còn {product.stock} {product.unit}
            </div>
          )}
        </div>

        <div className="p-3 md:p-4 space-y-2">
          <h3 className="font-bold text-sm md:text-base text-foreground line-clamp-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <div className="flex items-center gap-1">
            {Array.from({ length: product.rating }).map((_, i) => (
              <span key={i} className="text-accent text-xs">★</span>
            ))}
          </div>
          <div className="flex items-end justify-between">
            <p className="text-lg md:text-xl font-extrabold text-primary">
              {formatPrice(product.price)}
              <span className="text-xs font-normal text-muted-foreground">/{product.unit}</span>
            </p>
          </div>
          <button
            onClick={handleBuy}
            className="w-full ocean-gradient text-primary-foreground font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm hover:opacity-90 transition-opacity active:scale-95"
          >
            <ShoppingCart className="h-4 w-4" />
            MUA NGAY
          </button>
        </div>
      </div>
    </Link>
  );
}
