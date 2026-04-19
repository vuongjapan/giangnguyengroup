import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface LandingPage {
  slug: string;
  title: string;
  meta_description: string;
  h1: string;
  intro: string;
  content_html: string;
  faq: { q: string; a: string }[];
  json_ld: any;
  related_product_ids: string[];
  hero_image: string;
}

export default function SeoLandingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const { data } = await supabase
        .from('seo_landing_pages')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();
      setPage(data as any);
      if (data?.related_product_ids?.length) {
        const { data: prods } = await supabase
          .from('products')
          .select('id, name, slug, price, unit, images')
          .in('id', data.related_product_ids)
          .limit(6);
        setProducts(prods || []);
      }
      // Increment views fire-and-forget
      if (data) {
        await supabase.from('seo_landing_pages').update({ views: (data as any).views + 1 }).eq('slug', slug);
      }
      setLoading(false);
    })();
  }, [slug]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin h-8 w-8 text-primary" /></div>;
  }
  if (!page) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <h1 className="text-2xl">Trang không tồn tại</h1>
        <Link to="/"><Button>Về trang chủ</Button></Link>
      </div>
    );
  }

  const fullJsonLd = [
    page.json_ld,
    page.faq?.length ? {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: page.faq.map(f => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    } : null,
  ].filter(Boolean);

  return (
    <>
      <SEO
        title={page.title}
        description={page.meta_description}
        canonical={`https://giangnguyengroup.lovable.app/lp/${page.slug}`}
        jsonLd={fullJsonLd}
      />
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <article>
          <h1 className="text-3xl md:text-4xl font-bold text-primary mb-4">{page.h1}</h1>
          <p className="text-lg text-muted-foreground mb-8">{page.intro}</p>
          <div className="prose prose-lg max-w-none mb-12" dangerouslySetInnerHTML={{ __html: page.content_html }} />

          {products.length > 0 && (
            <section className="my-12">
              <h2 className="text-2xl font-bold mb-6">Sản phẩm gợi ý</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {products.map(p => (
                  <Link key={p.id} to={`/product/${p.slug}`} className="border rounded-lg overflow-hidden hover:shadow-lg transition">
                    <img src={p.images?.[0]} alt={p.name} width={300} height={300} loading="lazy" className="w-full aspect-square object-cover" />
                    <div className="p-3">
                      <div className="font-semibold text-sm line-clamp-2">{p.name}</div>
                      <div className="text-primary font-bold mt-1">{p.price.toLocaleString('vi-VN')}₫</div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {page.faq?.length > 0 && (
            <section className="my-12">
              <h2 className="text-2xl font-bold mb-6">Câu hỏi thường gặp</h2>
              <div className="space-y-4">
                {page.faq.map((f, i) => (
                  <details key={i} className="border rounded-lg p-4">
                    <summary className="font-semibold cursor-pointer">{f.q}</summary>
                    <p className="mt-2 text-muted-foreground">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          <div className="bg-primary/5 rounded-xl p-8 text-center mt-12">
            <h3 className="text-xl font-bold mb-2">Mua hải sản khô Giang Nguyên ngay hôm nay</h3>
            <p className="text-muted-foreground mb-4">Giao toàn quốc – Cam kết chất lượng</p>
            <Link to="/san-pham"><Button size="lg">Xem tất cả sản phẩm</Button></Link>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
