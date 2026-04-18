import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, CheckCircle2, Package, TrendingUp, Users, Phone, Award, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import SEO from '@/components/SEO';

export default function WholesalePage() {
  const [form, setForm] = useState({
    shop_name: '',
    contact_name: '',
    phone: '',
    email: '',
    region: '',
    products_interest: '',
    expected_volume: '',
    note: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<{ message: string; score: number } | null>(null);
  const [error, setError] = useState('');

  const handleChange = (k: string, v: string) => {
    setForm((p) => ({ ...p, [k]: v }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data, error: fnErr } = await supabase.functions.invoke('wholesale-lead', {
        body: { ...form, source: 'wholesale_page' },
      });

      if (fnErr) throw fnErr;
      if (data?.error) throw new Error(data.error);

      setSuccess({ message: data.message, score: data.lead_score });
      setForm({
        shop_name: '', contact_name: '', phone: '', email: '',
        region: '', products_interest: '', expected_volume: '', note: '',
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra, vui lòng thử lại');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <SEO
        title="Đăng ký đại lý / mua sỉ hải sản khô - Giang Nguyên Group"
        description="Trở thành đại lý phân phối hải sản khô Giang Nguyên Group. Giá sỉ ưu đãi, hỗ trợ marketing, giao hàng toàn quốc."
        url="https://giangnguyengroup.lovable.app/dai-ly"
      />
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-background via-primary/5 to-background pb-12">
        {/* Hero */}
        <section className="ocean-gradient text-primary-foreground py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-primary-foreground/20 px-3 py-1 rounded-full text-xs font-bold mb-3">
              <Users className="h-3.5 w-3.5" />
              CHƯƠNG TRÌNH ĐẠI LÝ
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold mb-3">
              Trở thành Đại lý Giang Nguyên Group
            </h1>
            <p className="text-base md:text-lg opacity-95 max-w-2xl mx-auto">
              Cùng chúng tôi đưa hải sản khô Sầm Sơn cao cấp đến tay người tiêu dùng cả nước
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="container mx-auto px-4 py-10">
          <div className="grid md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {[
              { icon: TrendingUp, title: 'Lợi nhuận 25-40%', desc: 'Biên lợi nhuận hấp dẫn ngành đặc sản' },
              { icon: Package, title: 'Hàng chính hãng', desc: 'Cam kết nguồn gốc, chất lượng đồng đều' },
              { icon: Truck, title: 'Giao toàn quốc', desc: 'Hỗ trợ vận chuyển, đóng gói chuyên nghiệp' },
              { icon: Award, title: 'Hỗ trợ marketing', desc: 'Cung cấp ảnh, video, content sẵn sàng' },
            ].map((b, i) => (
              <div key={i} className="bg-card border border-border rounded-xl p-4 text-center hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 mx-auto bg-primary/10 rounded-full flex items-center justify-center mb-3">
                  <b.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-bold text-sm mb-1">{b.title}</h3>
                <p className="text-xs text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Form */}
        <section className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto bg-card border border-border rounded-2xl p-6 md:p-8 shadow-xl">
            <h2 className="text-2xl font-bold mb-2">Đăng ký nhận báo giá sỉ</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Điền thông tin, chúng tôi sẽ gọi lại trong 24h
            </p>

            {success ? (
              <div className="text-center py-8">
                <CheckCircle2 className="h-16 w-16 mx-auto text-success mb-4" />
                <h3 className="text-xl font-bold mb-2">Đăng ký thành công!</h3>
                <p className="text-sm text-muted-foreground mb-1">{success.message}</p>
                <p className="text-xs text-muted-foreground mb-6">Mã ưu tiên: {success.score}/100</p>
                <div className="flex flex-col sm:flex-row gap-2 justify-center">
                  <button
                    onClick={() => setSuccess(null)}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-semibold text-sm"
                  >
                    Đăng ký thêm
                  </button>
                  <Link
                    to="/san-pham"
                    className="bg-muted text-foreground px-4 py-2 rounded-lg font-semibold text-sm"
                  >
                    Xem sản phẩm
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">
                      Tên cửa hàng <span className="text-destructive">*</span>
                    </label>
                    <input
                      required
                      maxLength={200}
                      value={form.shop_name}
                      onChange={(e) => handleChange('shop_name', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      placeholder="Cửa hàng đặc sản ABC"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">
                      Người liên hệ <span className="text-destructive">*</span>
                    </label>
                    <input
                      required
                      maxLength={100}
                      value={form.contact_name}
                      onChange={(e) => handleChange('contact_name', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-semibold mb-1 block">
                      Số điện thoại <span className="text-destructive">*</span>
                    </label>
                    <input
                      required
                      type="tel"
                      maxLength={20}
                      value={form.phone}
                      onChange={(e) => handleChange('phone', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      placeholder="0975xxxxxx"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-semibold mb-1 block">Email</label>
                    <input
                      type="email"
                      maxLength={200}
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                      placeholder="email@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block">Khu vực kinh doanh</label>
                  <input
                    maxLength={200}
                    value={form.region}
                    onChange={(e) => handleChange('region', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                    placeholder="Hà Nội, TP.HCM, Đà Nẵng..."
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block">Sản phẩm quan tâm</label>
                  <input
                    maxLength={500}
                    value={form.products_interest}
                    onChange={(e) => handleChange('products_interest', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                    placeholder="Mực khô, tôm khô, cá chỉ vàng..."
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block">Số lượng dự kiến / tháng</label>
                  <select
                    value={form.expected_volume}
                    onChange={(e) => handleChange('expected_volume', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background"
                  >
                    <option value="">-- Chọn --</option>
                    <option value="Dưới 10kg">Dưới 10kg</option>
                    <option value="10-50kg">10-50kg</option>
                    <option value="50-100kg">50-100kg</option>
                    <option value="Trên 100kg">Trên 100kg</option>
                    <option value="Trên 1 tấn">Trên 1 tấn</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm font-semibold mb-1 block">Ghi chú thêm</label>
                  <textarea
                    maxLength={1000}
                    rows={3}
                    value={form.note}
                    onChange={(e) => handleChange('note', e.target.value)}
                    className="w-full px-3 py-2 border border-border rounded-lg text-sm bg-background resize-none"
                    placeholder="Yêu cầu đặc biệt, đối tượng khách hàng..."
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive bg-destructive/10 p-2 rounded">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Đang gửi...</>
                  ) : (
                    <><Phone className="h-4 w-4" /> Gửi đăng ký</>
                  )}
                </button>

                <p className="text-xs text-center text-muted-foreground">
                  Bằng cách gửi form, bạn đồng ý nhận liên hệ từ Giang Nguyên Group
                </p>
              </form>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
