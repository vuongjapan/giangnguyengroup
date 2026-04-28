import { Link } from 'react-router-dom';
import { Phone, MapPin, Mail, Facebook, MessageCircle, Music2, Youtube } from 'lucide-react';
import defaultLogo from '@/assets/logo-giang-nguyen.jpg';

const PRODUCT_LINKS = [
  { label: 'Mực Khô', href: '/san-pham?category=' + encodeURIComponent('Mực khô') },
  { label: 'Tôm Khô', href: '/san-pham?category=' + encodeURIComponent('Tôm khô') },
  { label: 'Cá Khô', href: '/san-pham?category=' + encodeURIComponent('Cá khô') },
  { label: 'Ruốc & Mắm', href: '/san-pham?category=' + encodeURIComponent('Đặc sản khác') },
  { label: 'Combo Quà Tặng', href: '/combo' },
];

const SUPPORT_LINKS = [
  { label: 'Chính sách đổi trả', href: '/chinh-sach' },
  { label: 'Chính sách vận chuyển', href: '/chinh-sach' },
  { label: 'Hướng dẫn đặt hàng', href: '/chinh-sach' },
  { label: 'Liên hệ', href: '/he-thong-cua-hang' },
];

const SOCIALS = [
  { Icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
  { Icon: MessageCircle, href: 'https://zalo.me/0933562286', label: 'Zalo' },
  { Icon: Music2, href: 'https://tiktok.com', label: 'TikTok' },
  { Icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
];

export default function Footer() {
  return (
    <footer
      className="text-white pb-[60px] md:pb-0"
      style={{ backgroundColor: '#0a3d4e' }}
    >
      <div className="container mx-auto px-4 py-10 md:py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-10">
          {/* Column 1 - Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <img
                src={defaultLogo}
                alt="Giang Nguyên Group"
                className="h-12 w-12 rounded-lg bg-white/95 p-1"
              />
              <div className="leading-tight">
                <p className="text-[10px] text-white/70 font-bold tracking-wider">CÔNG TY TNHH</p>
                <p className="text-base font-black">
                  GIANG NGUYÊN <span className="text-accent">GROUP</span>
                </p>
              </div>
            </div>
            <p className="text-sm text-white/80 mb-4 leading-relaxed">
              Hải sản khô – Hải sản một nắng – Đặc sản biển Sầm Sơn, Thanh Hóa.
            </p>
            <div className="flex gap-2">
              {SOCIALS.map(({ Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-primary text-white hover:text-primary-foreground flex items-center justify-center transition-colors"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 - Categories */}
          <div>
            <h4 className="font-black mb-4 text-accent text-sm uppercase tracking-wider">Danh Mục</h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              {PRODUCT_LINKS.map(l => (
                <li key={l.label}>
                  <Link to={l.href} className="hover:text-accent transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 - Support */}
          <div>
            <h4 className="font-black mb-4 text-accent text-sm uppercase tracking-wider">Hỗ Trợ</h4>
            <ul className="space-y-2.5 text-sm text-white/80">
              {SUPPORT_LINKS.map(l => (
                <li key={l.label}>
                  <Link to={l.href} className="hover:text-accent transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 - Contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="font-black mb-4 text-accent text-sm uppercase tracking-wider">Liên Hệ</h4>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2">
                <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5 text-accent" />
                <span>Chợ Cột Đỏ, Sầm Sơn, Thanh Hóa</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-4 w-4 flex-shrink-0 text-accent" />
                <a href="tel:0933562286" className="hover:text-accent font-semibold">
                  0933.562.286
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 flex-shrink-0 text-accent" />
                <a
                  href="mailto:giangnguyendriedseafood@gmail.com"
                  className="hover:text-accent break-all"
                >
                  giangnguyendriedseafood@gmail.com
                </a>
              </li>
            </ul>
            <div className="mt-4 inline-block bg-white p-2 rounded-lg">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent('https://zalo.me/0933562286')}`}
                alt="QR Zalo"
                className="w-[100px] h-[100px]"
                loading="lazy"
              />
              <p className="text-[10px] text-foreground text-center mt-1 font-bold">Zalo: 0933.562.286</p>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-2 text-[12px] text-white/60">
          <p>© 2026 Công ty TNHH Giang Nguyên Group. All rights reserved.</p>
          <p>Thiết kế bởi <span className="text-accent font-semibold">Giang Nguyên Tech</span></p>
        </div>
      </div>
    </footer>
  );
}
