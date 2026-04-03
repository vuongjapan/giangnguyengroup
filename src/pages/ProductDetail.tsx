import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { products, formatPrice } from '@/data/products';
import { useCart } from '@/contexts/CartContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';

export default function ProductDetail() {
  const { slug } = useParams();
  const product = products.find(p => p.slug === slug);
  const { addItem } = useCart();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [zoomed, setZoomed] = useState(false);

  if (!product) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground mb-4">Sản phẩm không tồn tại</p>
          <Link to="/" className="text-primary hover:underline">← Về trang chủ</Link>
        </div>
      </div>
    </div>
  );

  const handleAddToCart = () => {
    addItem({ productId: product.id, name: product.name, price: product.price, unit: product.unit, image: product.images[0] }, qty);
    toast.success(`Đã thêm ${qty} ${product.unit} ${product.name}!`);
  };

  const related = products.filter(p => p.id !== product.id && p.category === product.category).slice(0, 4);

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="container mx-auto px-4 py-6 flex-1">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-4">
          <ArrowLeft className="h-4 w-4" /> Tất cả sản phẩm
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10">
          {/* Images */}
          <div className="space-y-3">
            <div
              className="relative aspect-square rounded-xl overflow-hidden bg-muted cursor-zoom-in border border-border"
              onClick={() => setZoomed(!zoomed)}
            >
              <img
                src={product.images[activeImg]}
                alt={product.name}
                className={`w-full h-full object-cover transition-transform duration-300 ${zoomed ? 'scale-150' : ''}`}
                width={600}
                height={600}
              />
              {product.images.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setActiveImg(i => i > 0 ? i - 1 : product.images.length - 1); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 p-1 rounded-full">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % product.images.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 p-1 rounded-full">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute top-3 left-3 flex gap-1">
                {product.badges.includes('hot') && <span className="badge-hot">🔥 Bán chạy</span>}
                {product.badges.includes('gift') && <span className="badge-gift">🎁 Quà biếu</span>}
                {product.badges.includes('limited') && <span className="badge-limited">⏳ Sắp hết</span>}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-2">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)} className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${i === activeImg ? 'border-primary' : 'border-border'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" width={64} height={64} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{product.category} / {product.grade}</p>
              <h1 className="text-2xl md:text-3xl font-extrabold text-foreground">{product.name}</h1>
              <div className="flex items-center gap-1 mt-1">
                {Array.from({ length: product.rating }).map((_, i) => <span key={i} className="text-accent">★</span>)}
                <span className="text-sm text-muted-foreground ml-1">({product.rating}/5)</span>
              </div>
            </div>

            <p className="text-3xl font-extrabold text-primary">
              {formatPrice(product.price)}
              <span className="text-base font-normal text-muted-foreground">/{product.unit}</span>
            </p>

            <p className="text-sm text-muted-foreground">
              Còn <span className="font-bold text-foreground">{product.stock}</span> {product.unit} trong kho
            </p>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 border border-border rounded-lg">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2 hover:bg-muted rounded-l-lg">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-10 text-center font-bold">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="p-2 hover:bg-muted rounded-r-lg">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button
                onClick={handleAddToCart}
                className="flex-1 ocean-gradient text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all"
              >
                <ShoppingCart className="h-5 w-5" /> MUA NGAY
              </button>
            </div>

            <div className="space-y-4 pt-4 border-t border-border">
              <div className="bg-secondary/60 rounded-xl p-4">
                <p className="font-bold text-foreground italic">{product.description.hook}</p>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">💪 Lợi ích</h3>
                <p className="text-sm text-muted-foreground">{product.description.benefits}</p>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">✨ Đặc điểm</h3>
                <p className="text-sm text-muted-foreground">{product.description.features}</p>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">🍳 Cách dùng</h3>
                <p className="text-sm text-muted-foreground">{product.description.usage}</p>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">👥 Dành cho</h3>
                <p className="text-sm text-muted-foreground">{product.description.audience}</p>
              </div>
              <div>
                <h3 className="font-bold text-foreground mb-1">🛡️ Cam kết</h3>
                <p className="text-sm text-muted-foreground">{product.description.commitment}</p>
              </div>
              <div className="bg-gold-soft p-4 rounded-xl">
                <p className="font-bold text-accent-foreground text-center">{product.description.cta}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-extrabold text-foreground mb-4">Sản phẩm liên quan</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
              {related.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
