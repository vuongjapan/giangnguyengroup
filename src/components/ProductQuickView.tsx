import { useState, useEffect } from 'react';
import { X, ShoppingCart, MessageCircle, Phone, ChevronLeft, ChevronRight, Star, Truck, Shield, Award } from 'lucide-react';
import type { Product } from '@/data/products';
import { formatPrice } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import ProductGradeBadge from '@/components/ProductGradeBadge';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

interface Props {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

const ZALO_URL = 'https://zalo.me/0975982613';
const HOTLINE = '0975982613';

export default function ProductQuickView({ product, open, onClose }: Props) {
  const { addItem } = useCart();
  const [imgIdx, setImgIdx] = useState(0);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    if (open) {
      setImgIdx(0);
      setQty(1);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [open, product?.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!open || !product) return null;

  const images = product.images?.length ? product.images : [''];
  const totalPrice = product.price * qty;
  const discountPercent = product.badges.includes('hot') ? 10 : 0;
  const oldPrice = discountPercent > 0 ? Math.round(product.price * (100 + discountPercent) / 100) : 0;

  const handleBuyNow = () => {
    addItem({
      productId: product.id,
      name: product.name,
      price: product.price,
      unit: product.unit,
      image: product.images[0],
    });
    toast.success(`Đã thêm ${qty} ${product.unit} ${product.name} vào giỏ`);
    onClose();
  };

  const wholesaleMsg = encodeURIComponent(`Xin chào, tôi muốn báo giá sỉ sản phẩm: ${product.name}`);

  return (
    <div
      className="fixed inset-0 z-[200] flex items-end md:items-center justify-center bg-foreground/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-background w-full md:max-w-4xl md:max-h-[90vh] max-h-[95vh] md:rounded-2xl rounded-t-3xl overflow-hidden shadow-2xl animate-slide-in-up flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 py-3 bg-background border-b border-border">
          <div className="flex items-center gap-2 min-w-0">
            <ProductGradeBadge grade={product.grade} />
            <span className="text-xs text-muted-foreground truncate">Xem nhanh</span>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
            aria-label="Đóng"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-0">
            {/* Gallery */}
            <div className="relative bg-muted">
              <div className="aspect-square relative overflow-hidden">
                <img
                  src={images[imgIdx]}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  width={600}
                  height={600}
                  loading="eager"
                  decoding="async"
                />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setImgIdx((i) => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-md"
                      aria-label="Ảnh trước"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setImgIdx((i) => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-background/80 hover:bg-background p-2 rounded-full shadow-md"
                      aria-label="Ảnh sau"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </>
                )}
                {/* Badges */}
                <div className="absolute top-3 left-3 flex flex-col gap-1">
                  {product.badges.includes('hot') && <span className="badge-hot">🔥 Bán chạy</span>}
                  {product.badges.includes('gift') && <span className="badge-gift">🎁 Quà biếu</span>}
                  {product.badges.includes('limited') && <span className="badge-limited">⏳ Sắp hết</span>}
                </div>
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 overflow-x-auto">
                  {images.map((src, i) => (
                    <button
                      key={i}
                      onClick={() => setImgIdx(i)}
                      className={`flex-shrink-0 w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${i === imgIdx ? 'border-primary' : 'border-transparent opacity-60'}`}
                    >
                      <img src={src} alt="" className="w-full h-full object-cover" width={56} height={56} loading="lazy" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-5 space-y-4">
              <div>
                <h2 className="text-xl md:text-2xl font-bold leading-tight">{product.name}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-4 w-4 ${i < product.rating ? 'fill-accent text-accent' : 'text-muted'}`} />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">({product.rating}.0)</span>
                  <span className="text-xs text-muted-foreground">·</span>
                  <span className="text-xs text-muted-foreground">{product.category}</span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-3xl font-extrabold text-coral">{formatPrice(product.price)}</span>
                <span className="text-sm text-muted-foreground">/ {product.unit}</span>
                {oldPrice > 0 && (
                  <>
                    <span className="text-sm line-through text-muted-foreground">{formatPrice(oldPrice)}</span>
                    <span className="text-xs bg-destructive text-primary-foreground px-1.5 py-0.5 rounded font-bold">-{discountPercent}%</span>
                  </>
                )}
              </div>

              {/* Hook */}
              {product.description?.hook && (
                <p className="text-sm bg-accent/10 border border-accent/30 rounded-lg p-3 text-foreground/90">
                  {product.description.hook}
                </p>
              )}

              {/* Quick specs */}
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="bg-muted/50 rounded-lg p-2">
                  <Award className="h-4 w-4 mx-auto text-primary mb-1" />
                  <div className="text-[10px] text-muted-foreground">Xuất xứ</div>
                  <div className="text-xs font-semibold">{product.description?.specs?.origin || 'Sầm Sơn'}</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <Truck className="h-4 w-4 mx-auto text-primary mb-1" />
                  <div className="text-[10px] text-muted-foreground">Giao hàng</div>
                  <div className="text-xs font-semibold">2-3 ngày</div>
                </div>
                <div className="bg-muted/50 rounded-lg p-2">
                  <Shield className="h-4 w-4 mx-auto text-primary mb-1" />
                  <div className="text-[10px] text-muted-foreground">Bảo hành</div>
                  <div className="text-xs font-semibold">Hoàn tiền</div>
                </div>
              </div>

              {/* Benefits */}
              {product.description?.benefits && product.description.benefits.length > 0 && (
                <div>
                  <div className="text-sm font-semibold mb-2">Điểm nổi bật</div>
                  <ul className="space-y-1">
                    {product.description.benefits.slice(0, 3).map((b, i) => (
                      <li key={i} className="text-xs text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5">✓</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity */}
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium">Số lượng:</span>
                <div className="flex items-center border border-border rounded-lg">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 py-1.5 hover:bg-muted">−</button>
                  <span className="px-4 py-1.5 font-semibold min-w-[3rem] text-center">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="px-3 py-1.5 hover:bg-muted">+</button>
                </div>
                <span className="text-sm text-muted-foreground">= <span className="font-bold text-coral">{formatPrice(totalPrice)}</span></span>
              </div>

              {/* Link xem chi tiết */}
              <Link
                to={`/product/${product.slug}`}
                onClick={onClose}
                className="block text-center text-sm text-primary hover:underline"
              >
                Xem mô tả chi tiết đầy đủ →
              </Link>
            </div>
          </div>
        </div>

        {/* Sticky CTA */}
        <div className="sticky bottom-0 z-10 bg-background border-t border-border p-3 grid grid-cols-3 gap-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
          <button
            onClick={handleBuyNow}
            className="col-span-1 ocean-gradient text-primary-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-1.5 text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <ShoppingCart className="h-4 w-4" />
            Mua ngay
          </button>
          <a
            href={ZALO_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-blue-500 text-primary-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-1.5 text-sm hover:bg-blue-600 active:scale-95 transition-all"
          >
            <MessageCircle className="h-4 w-4" />
            Chat Zalo
          </a>
          <a
            href={`${ZALO_URL}?msg=${wholesaleMsg}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-accent text-accent-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-1.5 text-sm hover:opacity-90 active:scale-95 transition-all"
          >
            <Phone className="h-4 w-4" />
            Báo giá sỉ
          </a>
        </div>
      </div>
    </div>
  );
}
