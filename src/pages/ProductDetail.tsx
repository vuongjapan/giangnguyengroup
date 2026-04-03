import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, ShieldCheck, Truck, RotateCcw, CheckCircle2, AlertTriangle, Snowflake, Users, Package, Phone } from 'lucide-react';
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
  const desc = product.description;

  return (
    <div className="min-h-screen flex flex-col bg-background">
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

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2 pt-2">
              <div className="flex flex-col items-center gap-1 p-2 bg-secondary/60 rounded-lg text-center">
                <ShieldCheck className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-medium text-foreground">100% chính gốc</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-secondary/60 rounded-lg text-center">
                <Truck className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-medium text-foreground">Ship toàn quốc</span>
              </div>
              <div className="flex flex-col items-center gap-1 p-2 bg-secondary/60 rounded-lg text-center">
                <RotateCcw className="h-5 w-5 text-primary" />
                <span className="text-[10px] font-medium text-foreground">Đổi trả 24h</span>
              </div>
            </div>

            {/* 1. Hook */}
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
              <p className="font-bold text-foreground text-lg italic leading-relaxed">{desc.hook}</p>
            </div>

            {/* 2. Intro */}
            <p className="text-sm text-muted-foreground leading-relaxed">{desc.intro}</p>
          </div>
        </div>

        {/* Detailed content sections */}
        <div className="mt-8 space-y-8 max-w-4xl mx-auto">

          {/* 3. Benefits */}
          <section>
            <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">
              💪 Lợi ích nổi bật
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {desc.benefits.map((b, i) => (
                <div key={i} className="flex items-start gap-2 bg-secondary/40 rounded-lg p-3">
                  <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-foreground">{b}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 4. Highlights */}
          <section>
            <h2 className="text-lg font-extrabold text-foreground mb-3">✨ Điểm nổi bật</h2>
            <div className="space-y-3">
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-bold text-foreground text-sm mb-1">📍 Nguồn gốc</h3>
                <p className="text-sm text-muted-foreground">{desc.highlights.origin}</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-bold text-foreground text-sm mb-1">☀️ Quy trình phơi sấy</h3>
                <p className="text-sm text-muted-foreground">{desc.highlights.process}</p>
              </div>
              <div className="border border-border rounded-lg p-4">
                <h3 className="font-bold text-foreground text-sm mb-1">📦 Đóng gói</h3>
                <p className="text-sm text-muted-foreground">{desc.highlights.packaging}</p>
              </div>
            </div>
          </section>

          {/* 5. Cooking methods */}
          <section className="bg-secondary/30 rounded-2xl p-5">
            <h2 className="text-lg font-extrabold text-foreground mb-4">🍳 Cách chế biến ngon nhất</h2>
            <div className="space-y-3">
              {desc.cooking.methods.map((m, i) => (
                <div key={i} className="bg-card rounded-xl p-4 border border-border">
                  <h3 className="font-bold text-foreground mb-1">{m.name}</h3>
                  <p className="text-sm text-muted-foreground">{m.detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <h3 className="font-bold text-foreground text-sm mb-2">💡 Gợi ý ăn kèm:</h3>
              <div className="flex flex-wrap gap-2">
                {desc.cooking.suggestions.map((s, i) => (
                  <span key={i} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>
                ))}
              </div>
            </div>
          </section>

          {/* 6. Choosing tips */}
          <section>
            <h2 className="text-lg font-extrabold text-foreground mb-3">🔍 Cách chọn {product.name} ngon</h2>
            <div className="space-y-2">
              {desc.choosingTips.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-sm text-foreground">{tip}</span>
                </div>
              ))}
            </div>
          </section>

          {/* 7. Real vs Fake */}
          <section>
            <h2 className="text-lg font-extrabold text-foreground mb-3">⚠️ Phân biệt hàng thật – hàng kém chất lượng</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                <h3 className="font-bold text-primary mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" /> Hàng ngon chuẩn
                </h3>
                <ul className="space-y-1.5">
                  {desc.realVsFake.real.map((r, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">✓</span> {r}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                <h3 className="font-bold text-destructive mb-2 flex items-center gap-1.5">
                  <AlertTriangle className="h-4 w-4" /> Hàng kém chất lượng
                </h3>
                <ul className="space-y-1.5">
                  {desc.realVsFake.fake.map((f, i) => (
                    <li key={i} className="text-sm text-foreground flex items-start gap-1.5">
                      <span className="text-destructive mt-0.5">✗</span> {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* 8. Storage */}
          <section>
            <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">
              <Snowflake className="h-5 w-5 text-primary" /> Cách bảo quản
            </h2>
            <div className="bg-secondary/40 rounded-xl p-4 space-y-2">
              {desc.storage.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <span className="text-primary font-bold">•</span> {s}
                </div>
              ))}
            </div>
          </section>

          {/* 9. Suitable for */}
          <section>
            <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" /> Phù hợp với
            </h2>
            <div className="flex flex-wrap gap-2">
              {desc.suitableFor.map((s, i) => (
                <span key={i} className="bg-accent/10 text-accent-foreground border border-accent/20 text-sm px-4 py-2 rounded-full">{s}</span>
              ))}
            </div>
          </section>

          {/* 10. Specs */}
          <section>
            <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">
              <Package className="h-5 w-5 text-primary" /> Thông tin sản phẩm
            </h2>
            <div className="border border-border rounded-xl overflow-hidden">
              <div className="grid grid-cols-[120px_1fr] text-sm">
                <div className="bg-secondary/60 p-3 font-bold text-foreground border-b border-border">Xuất xứ</div>
                <div className="p-3 text-muted-foreground border-b border-border">{desc.specs.origin}</div>
                <div className="bg-secondary/60 p-3 font-bold text-foreground border-b border-border">Quy cách</div>
                <div className="p-3 text-muted-foreground border-b border-border">{desc.specs.weight}</div>
                <div className="bg-secondary/60 p-3 font-bold text-foreground">Hạn dùng</div>
                <div className="p-3 text-muted-foreground">{desc.specs.expiry}</div>
              </div>
            </div>
          </section>

          {/* 11. Commitment */}
          <section>
            <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" /> Cam kết của shop
            </h2>
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
              {desc.commitment.map((c, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-foreground">
                  <ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> {c}
                </div>
              ))}
            </div>
          </section>

          {/* 12. CTA */}
          <section className="ocean-gradient rounded-2xl p-6 text-center">
            <p className="text-primary-foreground font-bold text-lg mb-3">{desc.cta}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={handleAddToCart}
                className="bg-card text-primary font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-card/90 active:scale-95 transition-all"
              >
                <ShoppingCart className="h-5 w-5" /> THÊM VÀO GIỎ HÀNG
              </button>
              <a
                href="tel:0123456789"
                className="bg-primary-foreground/20 text-primary-foreground font-bold px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-foreground/30 transition-all"
              >
                <Phone className="h-5 w-5" /> GỌI NGAY
              </a>
            </div>
          </section>
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
