import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Clock, Shield, Truck, RotateCcw, Award, ChevronRight } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="pb-[60px] md:pb-0">
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

      {/* Main footer - multi column like daohaisan.vn */}
      <div className="ocean-gradient text-primary-foreground">
        <div className="container mx-auto px-4 py-8 md:py-10">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6 md:gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <h3 className="text-lg font-black mb-2">GIANG NGUYEN <span className="text-accent">SEAFOOD</span></h3>
              <p className="text-xs text-primary-foreground/80 mb-3 leading-relaxed">Chuyên hải sản khô đặc sản biển Sầm Sơn – Cao cấp – Quà biếu – Du lịch</p>
              <div className="flex gap-2">
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full flex items-center justify-center text-xs font-bold transition-colors">FB</a>
                <a href="https://zalo.me/0986617939" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full flex items-center justify-center text-xs font-bold transition-colors">Zalo</a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full flex items-center justify-center text-xs font-bold transition-colors">TT</a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="w-8 h-8 bg-primary-foreground/20 hover:bg-primary-foreground/30 rounded-full flex items-center justify-center text-xs font-bold transition-colors">YT</a>
              </div>
            </div>

            {/* Thông tin */}
            <div>
              <h4 className="font-bold mb-3 text-accent text-sm">THÔNG TIN</h4>
              <div className="space-y-2 text-xs text-primary-foreground/80">
                <Link to="/gioi-thieu" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Giới thiệu</Link>
                <Link to="/blog" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Blog ẩm thực</Link>
                <Link to="/tin-tuc" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Tin tức</Link>
                <Link to="/mon-ngon" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Công thức món ngon</Link>
              </div>
            </div>

            {/* Chính sách */}
            <div>
              <h4 className="font-bold mb-3 text-accent text-sm">CHÍNH SÁCH</h4>
              <div className="space-y-2 text-xs text-primary-foreground/80">
                <Link to="/chinh-sach" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Chính sách bán hàng</Link>
                <Link to="/chinh-sach" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Đổi trả & hoàn tiền</Link>
                <Link to="/chinh-sach" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Vận chuyển & giao hàng</Link>
                <Link to="/chinh-sach" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Bảo mật thông tin</Link>
              </div>
            </div>

            {/* Danh mục */}
            <div>
              <h4 className="font-bold mb-3 text-accent text-sm">SẢN PHẨM</h4>
              <div className="space-y-2 text-xs text-primary-foreground/80">
                <Link to="/san-pham" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Tất cả sản phẩm</Link>
                <Link to="/san-pham?category=Mực+khô" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Mực khô Sầm Sơn</Link>
                <Link to="/san-pham?category=Hải+sản+1+nắng" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Hải sản 1 nắng</Link>
                <Link to="/combo" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Combo quà biếu</Link>
                <Link to="/khuyen-mai" className="flex items-center gap-1 hover:text-primary-foreground transition-colors"><ChevronRight className="h-3 w-3" /> Khuyến mãi</Link>
              </div>
            </div>

            {/* Liên hệ */}
            <div>
              <h4 className="font-bold mb-3 text-accent text-sm">LIÊN HỆ</h4>
              <div className="space-y-2.5 text-xs text-primary-foreground/80">
                <a href="tel:0986617939" className="flex items-center gap-2 hover:text-primary-foreground transition-colors"><Phone className="h-3.5 w-3.5 flex-shrink-0" /> 0986.617.939</a>
                <a href="mailto:giangnguyendriedseafood@gmail.com" className="flex items-center gap-2 hover:text-primary-foreground transition-colors"><Mail className="h-3.5 w-3.5 flex-shrink-0" /> giangnguyendriedseafood@gmail.com</a>
                <p className="flex items-center gap-2"><Clock className="h-3.5 w-3.5 flex-shrink-0" /> 7:00 – 21:00 hàng ngày</p>
                <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 flex-shrink-0" /> Chợ Cột Đỏ, Sầm Sơn, Thanh Hóa</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-primary-foreground/20 py-4">
          <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2">
            <p className="text-[11px] text-primary-foreground/60 text-center">
              © 2024 Giang Nguyen Seafood. All rights reserved. | Đặc sản biển Sầm Sơn chính gốc.
            </p>
            <div className="flex items-center gap-3">
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/ba/Stripe_Logo%2C_revised_2016.svg/120px-Stripe_Logo%2C_revised_2016.svg.png" alt="Secure" className="h-5 opacity-60" loading="lazy" />
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
