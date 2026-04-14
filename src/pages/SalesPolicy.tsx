import { Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useSiteContent } from '@/hooks/useSiteContent';

interface PolicySection {
  title: string;
  icon: string;
  intro?: string;
  items: { label: string; desc: string }[];
}

const DEFAULT_SECTIONS: PolicySection[] = [
  { title: 'Chính sách giao hàng', icon: '🚚', items: [
    { label: 'Khu vực Sầm Sơn – Thanh Hóa', desc: 'Giao nhanh 2–4 giờ' },
    { label: 'Toàn quốc', desc: '1–3 ngày (tùy khu vực)' },
    { label: 'Miễn phí vận chuyển', desc: 'Đơn từ 500.000₫' },
    { label: 'Kiểm tra hàng', desc: 'Trước khi thanh toán' },
    { label: 'Giao hỏa tốc', desc: 'Theo yêu cầu khách hàng' },
  ]},
  { title: 'Chính sách vận chuyển', icon: '📦', items: [
    { label: 'Đóng gói hút chân không', desc: 'Đảm bảo vệ sinh an toàn thực phẩm' },
    { label: 'Bảo quản khi vận chuyển', desc: 'Giữ khô, sạch, không ảnh hưởng chất lượng' },
    { label: 'Đơn vị vận chuyển uy tín', desc: 'Giao hàng nhanh, có tracking theo dõi' },
    { label: 'Lỗi vận chuyển', desc: 'Shop chịu 100% trách nhiệm' },
  ]},
  { title: 'Chính sách bảo hành', icon: '🛡️', intro: 'GIANG NGUYÊN GROUP cam kết: 100% hải sản tự nhiên – Không hóa chất – Đúng nguồn gốc biển Sầm Sơn.', items: [
    { label: 'Đổi 1–1', desc: 'Sản phẩm lỗi, không đúng mô tả, hoặc có dấu hiệu hư hỏng' },
    { label: 'Thời gian hỗ trợ', desc: 'Trong vòng 48h từ khi nhận hàng' },
    { label: 'Hoàn tiền 100%', desc: 'Nếu khách không hài lòng về chất lượng' },
    { label: 'Cam kết mạnh', desc: 'Sai hoàn tiền gấp đôi' },
  ]},
  { title: 'Chính sách bảo mật thông tin', icon: '🔒', items: [
    { label: 'Không chia sẻ thông tin', desc: 'Cho bất kỳ bên thứ 3 nào' },
    { label: 'Chỉ sử dụng thông tin để', desc: 'Xử lý đơn hàng & chăm sóc khách hàng' },
    { label: 'Bảo mật tuyệt đối', desc: 'Thông tin cá nhân, SĐT, địa chỉ' },
    { label: 'Thanh toán an toàn', desc: 'Không lưu thông tin nhạy cảm' },
  ]},
  { title: 'Chính sách thanh toán', icon: '💳', items: [
    { label: 'Thanh toán khi nhận hàng (COD)', desc: 'Kiểm tra hàng trước khi trả tiền' },
    { label: 'Chuyển khoản ngân hàng', desc: 'VietinBank – 104002912582 – VAN THI MINH LINH' },
    { label: 'Thanh toán QR SePay', desc: 'Nhanh chóng, tiện lợi' },
    { label: 'Nội dung chuyển khoản', desc: 'SEVQR + mã đơn hàng' },
    { label: 'Sau khi thanh toán', desc: 'Xác nhận tự động, gửi email + thông báo' },
  ]},
];

export default function SalesPolicy() {
  const { data: dbSections } = useSiteContent<PolicySection[] | null>('content_policy', null);
  const sections = dbSections && dbSections.length > 0 ? dbSections : DEFAULT_SECTIONS;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
        <Link to="/" className="inline-flex items-center gap-1 text-sm text-primary hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> Về trang chủ
        </Link>

        <div className="text-center mb-10">
          <h1 className="text-2xl md:text-3xl font-black text-foreground mb-2">CHÍNH SÁCH BÁN HÀNG</h1>
          <p className="text-muted-foreground text-sm">GIANG NGUYÊN GROUP – Uy tín tạo nên thương hiệu</p>
        </div>

        <div className="space-y-8">
          {sections.map((section, idx) => (
            <section key={idx} className="bg-card rounded-2xl border border-border p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-5">
                <div className="ocean-gradient p-3 rounded-xl">
                  <span className="text-xl">{section.icon}</span>
                </div>
                <h2 className="text-lg md:text-xl font-extrabold text-foreground">{section.title}</h2>
              </div>

              {section.intro && (
                <p className="text-sm text-foreground bg-primary/5 border border-primary/20 rounded-xl p-4 mb-5 font-medium">
                  {section.intro}
                </p>
              )}

              <div className="space-y-3">
                {section.items.map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-3 rounded-xl hover:bg-muted/50 transition-colors">
                    <CheckCircle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-foreground text-sm">{item.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-10 ocean-gradient rounded-2xl p-8 text-center">
          <h3 className="text-xl font-black text-primary-foreground mb-2">Mua sắm an tâm cùng Giang Nguyên Group</h3>
          <p className="text-primary-foreground/80 text-sm mb-4">Hotline hỗ trợ: 0933.562.286 • Zalo: 0933.562.286</p>
          <Link to="/"
            className="inline-block bg-accent text-accent-foreground font-bold px-8 py-3 rounded-full text-sm hover:opacity-90 transition-opacity">
            🛒 MUA HÀNG NGAY
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
