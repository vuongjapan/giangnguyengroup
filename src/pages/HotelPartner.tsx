import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Gift, Truck, Clock, CheckCircle, Star, Phone, MapPin, Wifi, Car, UtensilsCrossed, ShieldCheck } from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { products, formatPrice } from '@/data/products';
import { useCart } from '@/contexts/CartContext';

const HOTEL_COMBOS = [
  {
    id: 'hotel-combo-1',
    name: 'Combo Ăn Tại Phòng',
    tag: 'Ưu đãi khách TUẤN ĐẠT',
    items: ['Mực Khô Loại 1 (200g)', 'Cá Thu 1 Nắng (500g)', 'Nem Chua Thanh Hóa (10 cái)'],
    originalPrice: 650000,
    comboPrice: 520000,
    description: 'Set hải sản nướng tại phòng, giao nhanh 30 phút',
    productIds: ['1', '5', '7'],
  },
  {
    id: 'hotel-combo-2',
    name: 'Combo Mang Về',
    tag: 'Bestseller',
    items: ['Mực Khô Loại 2 (500g)', 'Cá Chỉ Vàng (500g)', 'Nem Chua (20 cái)'],
    originalPrice: 900000,
    comboPrice: 720000,
    description: 'Mua về làm quà cho gia đình, bạn bè',
    productIds: ['2', '6', '7'],
  },
  {
    id: 'hotel-combo-3',
    name: 'Combo Quà Biếu VIP',
    tag: 'Cao cấp',
    items: ['Mực Khô Loại 1 (500g)', 'Mực Trứng (300g)', 'Hộp quà sang trọng'],
    originalPrice: 1200000,
    comboPrice: 960000,
    description: 'Quà biếu sang trọng, đóng hộp cao cấp kèm thiệp',
    productIds: ['1', '4'],
  },
];

const HOTEL_AMENITIES = [
  { icon: MapPin, label: 'Gần biển Sầm Sơn' },
  { icon: Wifi, label: 'WiFi miễn phí' },
  { icon: Car, label: 'Bãi đỗ xe rộng' },
  { icon: UtensilsCrossed, label: 'Nhà hàng hải sản' },
  { icon: Star, label: 'Phòng view biển' },
  { icon: ShieldCheck, label: 'An ninh 24/7' },
];

export default function HotelPartner() {
  const { addItem } = useCart();
  const [roomNumber, setRoomNumber] = useState('');
  const [guestName, setGuestName] = useState('');
  const [verified, setVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const handleVerify = () => {
    if (!roomNumber || !guestName) return;
    setVerifying(true);
    setTimeout(() => {
      setVerified(true);
      setVerifying(false);
    }, 1500);
  };

  const handleAddCombo = (combo: typeof HOTEL_COMBOS[0]) => {
    combo.productIds.forEach(pid => {
      const product = products.find(p => p.id === pid);
      if (product) {
        addItem({
          productId: product.id,
          name: product.name,
          price: Math.round(product.price * (verified ? 0.9 : 1)),
          unit: product.unit,
          image: product.images[0],
        });
      }
    });
  };

  const discountPercent = verified ? 10 : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative ocean-gradient text-primary-foreground py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Building2 className="h-5 w-5" />
            <span className="font-bold text-sm">ĐỐI TÁC CHIẾN LƯỢC</span>
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4">
            TUẤN ĐẠT LUXURY HOTEL
          </h1>
          <p className="text-lg md:text-xl opacity-90 mb-2">Khách sạn cao cấp bên bờ biển Sầm Sơn</p>
          <p className="text-base opacity-80 max-w-2xl mx-auto mb-8">
            Khách lưu trú được <span className="font-black text-xl text-yellow-300">GIẢM 5–10%</span> khi mua hải sản GIANG NGUYÊN GROUP – Giao tận phòng trong 30 phút
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <a href="#verify" className="bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-colors">
              Xác nhận khách sạn
            </a>
            <a href="#combos" className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors">
              Xem combo ưu đãi
            </a>
          </div>
        </div>
      </section>

      {/* Hotel amenities */}
      <section className="py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-black text-center text-foreground mb-8">Tiện ích Khách sạn</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {HOTEL_AMENITIES.map((a, i) => (
              <div key={i} className="bg-card rounded-xl p-4 text-center border border-border hover:shadow-md transition-shadow">
                <a.icon className="h-8 w-8 mx-auto text-primary mb-2" />
                <p className="text-sm font-semibold text-foreground">{a.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-black text-center text-foreground mb-8">Quyền lợi khách TUẤN ĐẠT LUXURY HOTEL</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: Gift, title: 'Giảm giá 5–10%', desc: 'Áp dụng trực tiếp trên giá sản phẩm, không cần mã giảm giá' },
              { icon: Truck, title: 'Giao tận phòng', desc: 'Giao nhanh 30–60 phút, trực tiếp đến phòng khách sạn' },
              { icon: Clock, title: 'Ưu tiên xử lý', desc: 'Đơn hàng khách sạn được ưu tiên sơ chế và giao trước' },
            ].map((b, i) => (
              <div key={i} className="bg-card rounded-2xl p-6 border border-border text-center hover:shadow-lg transition-shadow">
                <div className="w-16 h-16 rounded-full ocean-gradient flex items-center justify-center mx-auto mb-4">
                  <b.icon className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="font-bold text-lg text-foreground mb-2">{b.title}</h3>
                <p className="text-sm text-muted-foreground">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Verification */}
      <section id="verify" className="py-12 bg-muted/30">
        <div className="container mx-auto px-4 max-w-md">
          <h2 className="text-2xl font-black text-center text-foreground mb-2">Xác nhận khách TUẤN ĐẠT</h2>
          <p className="text-center text-muted-foreground text-sm mb-6">Nhập thông tin để nhận ưu đãi giảm giá</p>

          {verified ? (
            <div className="bg-green-50 dark:bg-green-950 border-2 border-green-500 rounded-2xl p-6 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h3 className="font-bold text-xl text-green-700 dark:text-green-400 mb-2">Xác nhận thành công!</h3>
              <p className="text-sm text-green-600 dark:text-green-300">
                Chào <strong>{guestName}</strong> – Phòng <strong>{roomNumber}</strong>
              </p>
              <p className="text-sm text-green-600 dark:text-green-300 mt-1">
                Bạn được giảm <strong>10%</strong> trên tất cả sản phẩm!
              </p>
            </div>
          ) : (
            <div className="bg-card rounded-2xl p-6 border border-border space-y-4">
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">Số phòng</label>
                <input
                  type="text"
                  placeholder="VD: 301"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 text-foreground focus:outline-none focus:border-primary"
                  value={roomNumber}
                  onChange={e => setRoomNumber(e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-foreground block mb-1">Tên khách</label>
                <input
                  type="text"
                  placeholder="VD: Nguyễn Văn A"
                  className="w-full px-4 py-3 rounded-xl border border-border bg-muted/50 text-foreground focus:outline-none focus:border-primary"
                  value={guestName}
                  onChange={e => setGuestName(e.target.value)}
                />
              </div>
              <button
                onClick={handleVerify}
                disabled={verifying || !roomNumber || !guestName}
                className="w-full ocean-gradient text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {verifying ? 'Đang xác nhận...' : 'Xác nhận & Nhận ưu đãi'}
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Hotel Combos */}
      <section id="combos" className="py-12">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-black text-center text-foreground mb-2">Combo riêng khách TUẤN ĐẠT</h2>
          <p className="text-center text-muted-foreground text-sm mb-8">Ưu đãi đặc biệt chỉ dành cho khách lưu trú</p>

          <div className="grid md:grid-cols-3 gap-6">
            {HOTEL_COMBOS.map(combo => {
              const finalPrice = verified ? Math.round(combo.comboPrice * 0.9) : combo.comboPrice;
              const savingPercent = Math.round((1 - finalPrice / combo.originalPrice) * 100);

              return (
                <div key={combo.id} className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-xl transition-shadow group">
                  <div className="ocean-gradient p-4 text-primary-foreground">
                    <div className="flex items-center justify-between mb-2">
                      <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-bold">{combo.tag}</span>
                      <span className="bg-coral px-3 py-1 rounded-full text-xs font-bold">-{savingPercent}%</span>
                    </div>
                    <h3 className="font-black text-lg">{combo.name}</h3>
                    <p className="text-sm opacity-80 mt-1">{combo.description}</p>
                  </div>
                  <div className="p-4 space-y-3">
                    <ul className="space-y-2">
                      {combo.items.map((item, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-foreground">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                    <div className="pt-3 border-t border-border">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-black text-coral">{formatPrice(finalPrice)}</span>
                        <span className="text-sm text-muted-foreground line-through">{formatPrice(combo.originalPrice)}</span>
                      </div>
                      {verified && (
                        <p className="text-xs text-green-600 font-semibold mt-1">✅ Đã áp dụng giảm thêm 10%</p>
                      )}
                    </div>
                    <button
                      onClick={() => handleAddCombo(combo)}
                      className="w-full bg-coral text-primary-foreground font-bold py-3 rounded-xl hover:opacity-90 transition-opacity"
                    >
                      🛒 Đặt combo – Giao tận phòng
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 ocean-gradient text-primary-foreground text-center">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-black mb-4">Đặt hải sản giao tận phòng ngay!</h2>
          <p className="opacity-90 mb-6 max-w-lg mx-auto">Gọi điện hoặc đặt trực tuyến – Giao nhanh 30 phút tại TUẤN ĐẠT LUXURY HOTEL</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/san-pham" className="bg-white text-primary font-bold px-8 py-3 rounded-full hover:bg-white/90 transition-colors">
              Xem tất cả sản phẩm
            </Link>
            <a href="tel:0933562286" className="border-2 border-white text-white font-bold px-8 py-3 rounded-full hover:bg-white/10 transition-colors flex items-center gap-2">
              <Phone className="h-5 w-5" /> Gọi đặt hàng
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
