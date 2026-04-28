import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Eye, Star } from 'lucide-react';
import type { Product } from '@/data/products';
import { formatPrice } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import ProductGradeBadge from '@/components/ProductGradeBadge';
import ProductQuickView from '@/components/ProductQuickView';

interface Props {
  product: Product;
}

export default function ProductCard({ product }: Props) {
  const { addItem } = useCart();
  const [quickOpen, setQuickOpen] = useState(false);

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

  const handleQuick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickOpen(true);
  };

  // Compute fake "original price" for products with hot/limited badge to show discount
  const hasDiscount = product.badges.includes('hot') || product.badges.includes('limited');
  const discountPct = product.badges.includes('limited') ? 25 : 20;
  const originalPrice = hasDiscount ? Math.round((product.price / (100 - discountPct)) * 100 / 1000) * 1000 : null;

  return (
    <>
      <Link to={`/product/${product.slug}`} className="group block h-full">
        <div className="bg-card rounded-xl overflow-hidden border border-border hover:border-primary hover:shadow-xl transition-all duration-300 md:hover:-translate-y-1 h-full flex flex-col">
          {/* Image container - square */}
          <div className="relative aspect-square overflow-hidden bg-muted">
            <img
              src={product.images[0]}
              alt={product.name}
              className="w-full h-full object-cover md:group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
              decoding="async"
              width={800}
              height={800}
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              style={{ imageRendering: 'auto' }}
            />

            {/* Discount badge top-right (red circle) */}
            {hasDiscount && (
              <div className="absolute top-2 right-2 z-10 w-12 h-12 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center font-black text-xs shadow-lg">
                -{discountPct}%
              </div>
            )}
            {!hasDiscount && (
              <div className="absolute top-2 right-2 z-10">
                <ProductGradeBadge grade={product.grade} />
              </div>
            )}

            {/* Badges top-left */}
            <div className="absolute top-2 left-2 flex flex-col gap-1">
              {product.badges.includes('hot') && (
                <span className="badge-hot">🔥 Bán chạy</span>
              )}
              {product.badges.includes('gift') && (
                <span className="badge-gift">🎁 Quà biếu</span>
              )}
              {product.badges.includes('limited') && (
                <span className="badge-limited">⏳ Sắp hết</span>
              )}
            </div>

            {/* Stock warning */}
            {product.stock < 10 && (
              <div className="absolute bottom-2 left-2 bg-destructive text-primary-foreground text-[10px] font-bold px-1.5 py-0.5 rounded animate-pulse-soft">
                Còn {product.stock}
              </div>
            )}

            {/* Mobile: always-visible button bar at bottom */}
            <div className="md:hidden absolute inset-x-0 bottom-0 flex">
              <button
                onClick={handleBuy}
                className="flex-1 ocean-gradient text-primary-foreground font-bold py-2.5 flex items-center justify-center gap-1.5 text-xs"
              >
                <ShoppingCart className="h-3.5 w-3.5" /> Thêm vào giỏ
              </button>
            </div>

            {/* Desktop hover slide-up overlay */}
            <div className="hidden md:flex absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
              <button
                onClick={handleBuy}
                className="flex-1 ocean-gradient text-primary-foreground font-bold py-3 flex items-center justify-center gap-1.5 text-sm hover:opacity-90 active:scale-95 transition-all"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Thêm vào giỏ
              </button>
              <button
                type="button"
                onClick={handleQuick}
                className="flex items-center justify-center px-3.5 bg-foreground/80 text-primary-foreground text-xs hover:bg-foreground/90 transition-colors"
                aria-label="Xem nhanh"
              >
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="p-3 flex-1 flex flex-col">
            {/* Rating stars */}
            <div className="flex items-center gap-0.5 mb-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${i < product.rating ? 'fill-accent text-accent' : 'text-muted'}`}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">({product.rating})</span>
            </div>

            <h3 className="font-semibold text-xs md:text-sm text-foreground line-clamp-2 min-h-[2.5em] leading-tight group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
              <span className="text-base md:text-lg font-extrabold text-destructive">
                {formatPrice(product.price)}
              </span>
              {originalPrice && (
                <span className="text-[11px] md:text-xs text-muted-foreground line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
              <span className="text-[10px] md:text-xs text-muted-foreground">/ {product.unit}</span>
            </div>

            {/* Quick info */}
            <div className="mt-auto pt-2 flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <span className="bg-ocean-light text-primary px-1.5 py-0.5 rounded font-medium">
                {product.stock > 20 ? '✓ Còn hàng' : `Còn ${product.stock}`}
              </span>
            </div>
          </div>
        </div>
      </Link>
      <ProductQuickView product={product} open={quickOpen} onClose={() => setQuickOpen(false)} />
    </>
  );
}
