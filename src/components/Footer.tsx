import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Clock, Shield, Truck, RotateCcw, Award } from 'lucide-react';
import { useStores } from '@/hooks/useStores';

const FooterInner = () => {
  const { stores } = useStores();

export default function Footer() {
  return (
    <footer>
      {/* Trust strip */}
      <div className="bg-ocean-light border-t border-b border-border py-6">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Shield, title: 'Cam kết chất lượng', desc: '100% hải sản sạch Sầm Sơn' },
              { icon: Truck, title: 'Miễn phí vận chuyển', desc: 'Đơn hàng từ 500.000₫' },
              { icon: RotateCcw, title: 'Đổi trả 24h', desc: 'Hoàn tiền nếu không hài lòng' },
              { icon: Award, title: 'Uy tín 10 năm', desc: 'Hàng nghìn khách hàng tin tưởng' },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full ocean-gradient flex items-center justify-center flex-shrink-0">
                  <item.icon className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main footer */}
      <div className="ocean-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <h3 className="text-xl font-black mb-2">GIANG NGUYEN <span className="text-accent">SEAFOOD</span></h3>
            <p className="text-sm text-primary-foreground/80 mb-4">Chuyên hải sản khô đặc sản biển Sầm Sơn – Cao cấp – Quà biếu – Du lịch</p>
            <div className="flex gap-2">
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full flex items-center justify-center text-sm font-bold transition-colors">
                FB
              </a>
              <a href="https://zalo.me/0123456789" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full flex items-center justify-center text-sm font-bold transition-colors">
                Zalo
              </a>
              <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-9 h-9 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full flex items-center justify-center text-sm font-bold transition-colors">
                TT
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="font-bold mb-3 text-accent">Danh mục</h4>
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <Link to="/san-pham" className="block hover:text-primary-foreground transition-colors">Tất cả sản phẩm</Link>
              <Link to="/san-pham?category=M%E1%BB%B1c+kh%C3%B4" className="block hover:text-primary-foreground transition-colors">Mực khô Sầm Sơn</Link>
              <Link to="/san-pham?category=H%E1%BA%A3i+s%E1%BA%A3n+1+n%E1%BA%AFng" className="block hover:text-primary-foreground transition-colors">Hải sản 1 nắng</Link>
              <Link to="/combo" className="block hover:text-primary-foreground transition-colors">Combo quà biếu</Link>
            </div>
          </div>

          {/* Info links */}
          <div>
            <h4 className="font-bold mb-3 text-accent">Thông tin</h4>
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <Link to="/gioi-thieu" className="block hover:text-primary-foreground transition-colors">Giới thiệu</Link>
              <Link to="/blog" className="block hover:text-primary-foreground transition-colors">Ẩm thực blog</Link>
              <Link to="/chinh-sach" className="block hover:text-primary-foreground transition-colors">Chính sách bán hàng</Link>
              <Link to="/auth" className="block hover:text-primary-foreground transition-colors">Đăng ký thành viên</Link>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold mb-3 text-accent">Liên hệ</h4>
            <div className="space-y-2.5 text-sm text-primary-foreground/80">
              <a href="tel:0123456789" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Phone className="h-4 w-4 flex-shrink-0" /> 0123.456.789
              </a>
              <a href="mailto:giangnguyendriedseafood@gmail.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors">
                <Mail className="h-4 w-4 flex-shrink-0" /> giangnguyendriedseafood@gmail.com
              </a>
              <p className="flex items-center gap-2">
                <Clock className="h-4 w-4 flex-shrink-0" /> 7:00 – 21:00 hàng ngày
              </p>
              <p className="flex items-center gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0" /> Sầm Sơn, Thanh Hóa
              </p>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 py-4 text-center text-xs text-primary-foreground/60">
          © 2024 Giang Nguyen Seafood. All rights reserved. | Đặc sản biển Sầm Sơn chính gốc.
        </div>
      </div>
    </footer>
  );
};

export default function Footer() {
  return <FooterInner />;
}
