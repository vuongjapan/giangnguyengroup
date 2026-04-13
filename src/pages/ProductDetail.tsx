import { useParams, Link } from 'react-router-dom';
import { useState } from 'react';
import { ArrowLeft, ShoppingCart, Minus, Plus, ChevronLeft, ChevronRight, ShieldCheck, Truck, RotateCcw, CheckCircle2, AlertTriangle, Snowflake, Users, Package, Phone, RefreshCw, ZoomIn, Star, Heart, Share2, Trash2, Loader2 } from 'lucide-react';
import { formatPrice } from '@/data/products';
import { useProduct, useProducts } from '@/hooks/useProducts';
import { useProductReviews } from '@/hooks/useProductReviews';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ProductGradeBadge from '@/components/ProductGradeBadge';
import QRTraceability from '@/components/QRTraceability';
import WhyChooseUs from '@/components/WhyChooseUs';
import SuggestedProducts from '@/components/SuggestedProducts';

export default function ProductDetail() {
  const { slug } = useParams();
  const { product, loading: productLoading } = useProduct(slug);
  const { products } = useProducts();
  const { addItem } = useCart();
  const { user, isAdmin } = useAuth();
  const [qty, setQty] = useState(1);
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'specs' | 'cooking' | 'reviews'>('description');

  // Reviews
  const { reviews, loading: reviewsLoading, addReview, deleteReview, avgRating } = useProductReviews(product?.id);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', name: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  if (productLoading) return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-primary" />
      </div>
    </div>
  );

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

  const handleSubmitReview = async () => {
    if (!user) { toast.error('Vui lòng đăng nhập để đánh giá'); return; }
    if (!reviewForm.comment.trim()) { toast.error('Vui lòng nhập nội dung đánh giá'); return; }
    setSubmittingReview(true);
    try {
      await addReview({
        product_id: product.id,
        user_id: user.id,
        rating: reviewForm.rating,
        comment: reviewForm.comment.trim(),
        reviewer_name: reviewForm.name.trim() || user.email?.split('@')[0] || 'Khách hàng',
      });
      setReviewForm({ rating: 5, comment: '', name: '' });
      toast.success('Đã gửi đánh giá!');
    } catch {
      toast.error('Lỗi gửi đánh giá');
    }
    setSubmittingReview(false);
  };

  const desc = product.description;

  const tabs = [
    { id: 'description' as const, label: '📋 Mô tả' },
    { id: 'specs' as const, label: '📦 Thông số' },
    { id: 'cooking' as const, label: '🍳 Chế biến' },
    { id: 'reviews' as const, label: `⭐ Đánh giá (${reviews.length})` },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      {/* Lightbox */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-[60] bg-foreground/90 flex items-center justify-center" onClick={() => setLightboxOpen(false)}>
          <button className="absolute top-4 right-4 text-primary-foreground text-3xl font-bold z-10" onClick={() => setLightboxOpen(false)}>✕</button>
          <img src={product.images[activeImg]} alt={product.name} className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg" />
          {product.images.length > 1 && (
            <>
              <button onClick={e => { e.stopPropagation(); setActiveImg(i => i > 0 ? i - 1 : product.images.length - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 bg-card/80 p-3 rounded-full">
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % product.images.length); }} className="absolute right-4 top-1/2 -translate-y-1/2 bg-card/80 p-3 rounded-full">
                <ChevronRight className="h-6 w-6" />
              </button>
            </>
          )}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {product.images.map((_, i) => (
              <button key={i} onClick={e => { e.stopPropagation(); setActiveImg(i); }}
                className={`w-3 h-3 rounded-full transition-colors ${i === activeImg ? 'bg-primary' : 'bg-primary-foreground/50'}`} />
            ))}
          </div>
        </div>
      )}

      <main className="container mx-auto px-3 md:px-4 py-4 md:py-6 flex-1 pb-24 md:pb-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 md:mb-4 overflow-x-auto">
          <Link to="/" className="hover:text-primary whitespace-nowrap">Trang chủ</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <Link to={`/san-pham?category=${encodeURIComponent(product.category)}`} className="hover:text-primary whitespace-nowrap">{product.category}</Link>
          <ChevronRight className="h-3 w-3 flex-shrink-0" />
          <span className="text-foreground font-medium truncate">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-10">
          {/* Images */}
          <div className="space-y-2 md:space-y-3">
            <div className="relative aspect-square rounded-xl overflow-hidden bg-muted cursor-zoom-in border border-border group" onClick={() => setLightboxOpen(true)}>
              <img src={product.images[activeImg]} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" width={600} height={600} />
              <div className="absolute bottom-3 right-3 bg-card/80 backdrop-blur-sm p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <ZoomIn className="h-5 w-5 text-foreground" />
              </div>
              {product.images.length > 1 && (
                <>
                  <button onClick={e => { e.stopPropagation(); setActiveImg(i => i > 0 ? i - 1 : product.images.length - 1); }} className="absolute left-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button onClick={e => { e.stopPropagation(); setActiveImg(i => (i + 1) % product.images.length); }} className="absolute right-2 top-1/2 -translate-y-1/2 bg-card/80 backdrop-blur-sm p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {product.badges.includes('hot') && <span className="badge-hot">🔥 Bán chạy</span>}
                {product.badges.includes('gift') && <span className="badge-gift">🎁 Quà biếu</span>}
                {product.badges.includes('limited') && <span className="badge-limited">⏳ Sắp hết</span>}
              </div>
              <div className="absolute bottom-3 left-3 bg-foreground/60 text-primary-foreground text-xs px-2.5 py-1 rounded-full md:hidden">
                {activeImg + 1}/{product.images.length}
              </div>
            </div>
            {product.images.length > 1 && (
              <div className="flex gap-1.5 md:gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`flex-shrink-0 w-14 h-14 md:w-16 md:h-16 rounded-lg overflow-hidden border-2 transition-all ${i === activeImg ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" loading="lazy" width={64} height={64} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-3 md:space-y-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link to={`/san-pham?category=${encodeURIComponent(product.category)}`} className="text-xs text-primary hover:underline font-medium">{product.category}</Link>
                <ProductGradeBadge grade={product.grade} size="md" />
              </div>
              <h1 className="text-xl md:text-3xl font-extrabold text-foreground leading-tight">{product.name}</h1>
              <div className="flex items-center gap-2 mt-1.5">
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`h-3.5 w-3.5 ${i < (avgRating || product.rating) ? 'fill-accent text-accent' : 'text-muted'}`} />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">({(avgRating || product.rating).toFixed(1)}/5)</span>
                <span className="text-xs text-muted-foreground">|</span>
                <span className="text-xs text-primary font-medium">{reviews.length} đánh giá</span>
              </div>
            </div>

            {/* Price block */}
            <div className="bg-gradient-to-r from-coral/10 to-primary/5 rounded-xl p-3 md:p-4">
              <p className="text-2xl md:text-3xl font-extrabold text-coral">
                {formatPrice(product.price)}
                <span className="text-sm md:text-base font-normal text-muted-foreground ml-1">/{product.unit}</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Còn <span className="font-bold text-foreground">{product.stock}</span> {product.unit} trong kho
                {product.stock < 10 && <span className="text-destructive font-bold ml-1">– Sắp hết!</span>}
              </p>
            </div>

            {/* Hook */}
            {desc.hook && (
              <div className="bg-primary/5 border-l-4 border-primary rounded-r-xl p-3 md:p-4">
                <p className="font-semibold text-foreground text-sm md:text-base italic leading-relaxed">{desc.hook}</p>
              </div>
            )}

            {desc.intro && <p className="text-sm text-muted-foreground leading-relaxed">{desc.intro}</p>}

            {/* Quantity + Buy */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-border rounded-lg bg-card">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="p-2.5 hover:bg-muted rounded-l-lg transition-colors">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-12 text-center font-bold text-sm">{qty}</span>
                <button onClick={() => setQty(q => q + 1)} className="p-2.5 hover:bg-muted rounded-r-lg transition-colors">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
              <button onClick={handleAddToCart}
                className="flex-1 ocean-gradient text-primary-foreground font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all text-sm md:text-base">
                <ShoppingCart className="h-5 w-5" /> MUA NGAY – {formatPrice(product.price * qty)}
              </button>
            </div>

            <a href="tel:0933562286" className="flex items-center justify-center gap-2 border-2 border-coral text-coral font-bold py-2.5 rounded-xl text-sm hover:bg-coral hover:text-primary-foreground transition-all">
              <Phone className="h-4 w-4" /> GỌI ĐẶT HÀNG: 093.356.2286
            </a>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: ShieldCheck, text: '100% chính gốc Sầm Sơn' },
                { icon: Truck, text: 'Freeship đơn từ 500K' },
                { icon: RotateCcw, text: 'Đổi trả trong 24h' },
              ].map((item, i) => (
                <div key={i} className="flex flex-col items-center gap-1 p-2 bg-secondary/60 rounded-lg text-center">
                  <item.icon className="h-5 w-5 text-primary" />
                  <span className="text-[10px] font-medium text-foreground leading-tight">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-6 md:mt-10 max-w-4xl mx-auto">
          <div className="flex border-b border-border overflow-x-auto scrollbar-hide">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 md:px-4 py-3 text-xs md:text-sm font-bold transition-colors relative whitespace-nowrap ${activeTab === tab.id ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`}>
                {tab.label}
                {activeTab === tab.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
              </button>
            ))}
          </div>

          <div className="py-5 md:py-8">
            {/* TAB: Description */}
            {activeTab === 'description' && (
              <div className="space-y-6">
                {desc.benefits?.length > 0 && (
                  <section>
                    <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2">💪 Lợi ích nổi bật</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {desc.benefits.map((b: string, i: number) => (
                        <div key={i} className="flex items-start gap-2 bg-secondary/40 rounded-lg p-3">
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-foreground">{b}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {(desc.highlights?.origin || desc.highlights?.process || desc.highlights?.packaging) && (
                  <section>
                    <h2 className="text-lg font-extrabold text-foreground mb-3">✨ Điểm nổi bật</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {desc.highlights.origin && (
                        <div className="border border-border rounded-xl p-4 text-center">
                          <span className="text-2xl">📍</span>
                          <h3 className="font-bold text-foreground text-sm mt-2 mb-1">Nguồn gốc</h3>
                          <p className="text-xs text-muted-foreground">{desc.highlights.origin}</p>
                        </div>
                      )}
                      {desc.highlights.process && (
                        <div className="border border-border rounded-xl p-4 text-center">
                          <span className="text-2xl">☀️</span>
                          <h3 className="font-bold text-foreground text-sm mt-2 mb-1">Quy trình</h3>
                          <p className="text-xs text-muted-foreground">{desc.highlights.process}</p>
                        </div>
                      )}
                      {desc.highlights.packaging && (
                        <div className="border border-border rounded-xl p-4 text-center">
                          <span className="text-2xl">📦</span>
                          <h3 className="font-bold text-foreground text-sm mt-2 mb-1">Đóng gói</h3>
                          <p className="text-xs text-muted-foreground">{desc.highlights.packaging}</p>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                {desc.choosingTips?.length > 0 && (
                  <section>
                    <h2 className="text-lg font-extrabold text-foreground mb-3">🔍 Cách chọn {product.name} ngon</h2>
                    <div className="space-y-2">
                      {desc.choosingTips.map((tip: string, i: number) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="bg-primary text-primary-foreground text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                          <span className="text-sm text-foreground">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {(desc.realVsFake?.real?.length > 0 || desc.realVsFake?.fake?.length > 0) && (
                  <section>
                    <h2 className="text-lg font-extrabold text-foreground mb-3">⚠️ Phân biệt hàng thật – hàng kém chất lượng</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="bg-primary/5 border border-primary/20 rounded-xl p-4">
                        <h3 className="font-bold text-primary mb-2 flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Hàng ngon chuẩn</h3>
                        <ul className="space-y-1.5">{desc.realVsFake.real.map((r: string, i: number) => (<li key={i} className="text-sm text-foreground flex items-start gap-1.5"><span className="text-primary mt-0.5">✓</span> {r}</li>))}</ul>
                      </div>
                      <div className="bg-destructive/5 border border-destructive/20 rounded-xl p-4">
                        <h3 className="font-bold text-destructive mb-2 flex items-center gap-1.5"><AlertTriangle className="h-4 w-4" /> Hàng kém chất lượng</h3>
                        <ul className="space-y-1.5">{desc.realVsFake.fake.map((f: string, i: number) => (<li key={i} className="text-sm text-foreground flex items-start gap-1.5"><span className="text-destructive mt-0.5">✗</span> {f}</li>))}</ul>
                      </div>
                    </div>
                  </section>
                )}

                {desc.suitableFor?.length > 0 && (
                  <section>
                    <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> Phù hợp với</h2>
                    <div className="flex flex-wrap gap-2">
                      {desc.suitableFor.map((s: string, i: number) => (<span key={i} className="bg-accent/10 text-accent-foreground border border-accent/20 text-sm px-4 py-2 rounded-full">{s}</span>))}
                    </div>
                  </section>
                )}

                {desc.storage?.length > 0 && (
                  <section>
                    <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2"><Snowflake className="h-5 w-5 text-primary" /> Cách bảo quản</h2>
                    <div className="bg-secondary/40 rounded-xl p-4 space-y-2">
                      {desc.storage.map((s: string, i: number) => (<div key={i} className="flex items-start gap-2 text-sm text-foreground"><span className="text-primary font-bold">•</span> {s}</div>))}
                    </div>
                  </section>
                )}

                {desc.commitment?.length > 0 && (
                  <section>
                    <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> Cam kết của shop</h2>
                    <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-2">
                      {desc.commitment.map((c: string, i: number) => (<div key={i} className="flex items-start gap-2 text-sm text-foreground"><ShieldCheck className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" /> {c}</div>))}
                    </div>
                  </section>
                )}
              </div>
            )}

            {/* TAB: Specs */}
            {activeTab === 'specs' && (
              <div className="space-y-6">
                <section>
                  <h2 className="text-lg font-extrabold text-foreground mb-3 flex items-center gap-2"><Package className="h-5 w-5 text-primary" /> Thông số sản phẩm</h2>
                  <div className="border border-border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <tbody>
                        {[
                          ['Tên sản phẩm', product.name],
                          ['Danh mục', product.category],
                          ['Phân loại', product.grade],
                          ['Xuất xứ', desc.specs?.origin || 'Sầm Sơn, Thanh Hóa'],
                          ['Quy cách', desc.specs?.weight || product.unit],
                          ['Hạn sử dụng', desc.specs?.expiry || '6-12 tháng'],
                          ['Đơn vị', product.unit],
                          ['Tình trạng', product.stock > 0 ? 'Còn hàng' : 'Hết hàng'],
                        ].map(([label, value], i) => (
                          <tr key={i} className={i % 2 === 0 ? 'bg-secondary/30' : ''}>
                            <td className="p-3 font-bold text-foreground border-b border-border w-1/3">{label}</td>
                            <td className="p-3 text-muted-foreground border-b border-border">{value}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
                <QRTraceability product={product} />
              </div>
            )}

            {/* TAB: Cooking */}
            {activeTab === 'cooking' && (
              <div className="space-y-6">
                {desc.cooking?.methods?.length > 0 ? (
                  <section>
                    <h2 className="text-lg font-extrabold text-foreground mb-4">🍳 Cách chế biến ngon nhất</h2>
                    <div className="space-y-3">
                      {desc.cooking.methods.map((m: any, i: number) => (
                        <div key={i} className="bg-card rounded-xl p-4 border border-border">
                          <h3 className="font-bold text-foreground mb-1">{m.name}</h3>
                          <p className="text-sm text-muted-foreground">{m.detail}</p>
                        </div>
                      ))}
                    </div>
                    {desc.cooking.suggestions?.length > 0 && (
                      <div className="mt-4">
                        <h3 className="font-bold text-foreground text-sm mb-2">💡 Gợi ý ăn kèm:</h3>
                        <div className="flex flex-wrap gap-2">
                          {desc.cooking.suggestions.map((s: string, i: number) => (
                            <span key={i} className="bg-primary/10 text-primary text-xs font-medium px-3 py-1.5 rounded-full">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </section>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <p className="text-sm">Chưa có hướng dẫn chế biến cho sản phẩm này.</p>
                    <p className="text-xs mt-1">Liên hệ shop để được tư vấn cách chế biến ngon nhất!</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB: Reviews - REAL from DB */}
            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {/* Summary */}
                <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-xl">
                  <div className="text-center">
                    <p className="text-3xl font-black text-foreground">{(avgRating || product.rating).toFixed(1)}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.round(avgRating || product.rating) ? 'fill-accent text-accent' : 'text-muted'}`} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{reviews.length} đánh giá</p>
                  </div>
                </div>

                {/* Review form */}
                {user ? (
                  <div className="bg-card rounded-xl border border-border p-4 space-y-3">
                    <h3 className="font-bold text-foreground text-sm">Viết đánh giá của bạn</h3>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <button key={i} onClick={() => setReviewForm(f => ({ ...f, rating: i + 1 }))}>
                          <Star className={`h-6 w-6 cursor-pointer transition-colors ${i < reviewForm.rating ? 'fill-accent text-accent' : 'text-muted hover:text-accent'}`} />
                        </button>
                      ))}
                    </div>
                    <input
                      value={reviewForm.name}
                      onChange={e => setReviewForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Tên hiển thị (tùy chọn)"
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <textarea
                      value={reviewForm.comment}
                      onChange={e => setReviewForm(f => ({ ...f, comment: e.target.value }))}
                      placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                      rows={3}
                      className="w-full border border-border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
                    />
                    <button onClick={handleSubmitReview} disabled={submittingReview}
                      className="ocean-gradient text-primary-foreground font-bold px-6 py-2.5 rounded-xl text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-2">
                      {submittingReview ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                      Gửi đánh giá
                    </button>
                  </div>
                ) : (
                  <div className="bg-primary/5 rounded-xl p-4 text-center">
                    <p className="text-sm text-foreground mb-2">Đăng nhập để viết đánh giá</p>
                    <Link to="/auth" className="text-primary font-bold text-sm hover:underline">Đăng nhập ngay →</Link>
                  </div>
                )}

                {/* Reviews list */}
                {reviewsLoading ? (
                  <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
                ) : reviews.length > 0 ? (
                  <div className="space-y-3">
                    {reviews.map(review => (
                      <div key={review.id} className="bg-secondary/40 rounded-xl p-4">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            {Array.from({ length: review.rating }).map((_, j) => <Star key={j} className="h-3 w-3 fill-accent text-accent" />)}
                          </div>
                          {(isAdmin || user?.id === review.user_id) && (
                            <button onClick={() => { if (confirm('Xóa đánh giá này?')) deleteReview(review.id); }}
                              className="text-muted-foreground hover:text-destructive p-1">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                        <p className="text-sm text-foreground mb-1">"{review.comment}"</p>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground font-medium">{review.reviewer_name}</p>
                          <p className="text-xs text-muted-foreground">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-muted-foreground text-sm py-8">Chưa có đánh giá nào. Hãy là người đầu tiên!</p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA */}
        {desc.cta && (
          <section className="ocean-gradient rounded-2xl p-5 md:p-6 text-center max-w-4xl mx-auto mb-8">
            <p className="text-primary-foreground font-bold text-base md:text-lg mb-3">{desc.cta}</p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button onClick={handleAddToCart} className="bg-card text-primary font-bold px-6 md:px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-card/90 active:scale-95 transition-all text-sm">
                <ShoppingCart className="h-5 w-5" /> THÊM VÀO GIỎ HÀNG
              </button>
              <a href="tel:0933562286" className="bg-primary-foreground/20 text-primary-foreground font-bold px-6 md:px-8 py-3 rounded-xl flex items-center gap-2 hover:bg-primary-foreground/30 transition-all text-sm">
                <Phone className="h-5 w-5" /> GỌI NGAY
              </a>
            </div>
          </section>
        )}

        <WhyChooseUs />
        <SuggestedProducts currentProductId={product.id} currentCategory={product.category} />
      </main>
      <Footer />
    </div>
  );
}
