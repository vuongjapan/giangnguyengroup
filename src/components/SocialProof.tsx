import { Star, Shield, Award, CheckCircle, Play } from 'lucide-react';

const CERTIFICATIONS = [
  { icon: '🏅', name: 'Chứng nhận ATTP', desc: 'An toàn Thực phẩm' },
  { icon: '⭐', name: 'OCOP 4 sao', desc: 'Sản phẩm đặc trưng địa phương' },
  { icon: '🛡️', name: 'Tem chống giả', desc: 'QR truy xuất nguồn gốc' },
  { icon: '✅', name: 'ISO 22000', desc: 'Quản lý an toàn thực phẩm' },
];

const REVIEWS = [
  {
    name: 'Chị Hương', location: 'Hà Nội', rating: 5,
    text: 'Mực khô loại 1 rất ngon, nướng lên thơm lừng cả xóm. Ship nhanh, đóng gói cẩn thận. Sẽ mua lại!',
    product: 'Mực Khô Loại 1', avatar: '👩',
  },
  {
    name: 'Anh Tuấn', location: 'TP.HCM', rating: 5,
    text: 'Mua làm quà biếu sếp, được khen hết lời. Hộp quà sang trọng, hải sản tươi ngon.',
    product: 'Combo Quà Biếu', avatar: '👨',
  },
  {
    name: 'Chị Mai', location: 'Đà Nẵng', rating: 5,
    text: 'Cá thu 1 nắng chiên lên vàng giòn, cả nhà ai cũng mê. Giá rất hợp lý!',
    product: 'Cá Thu 1 Nắng', avatar: '👩',
  },
  {
    name: 'Anh Minh', location: 'Hải Phòng', rating: 5,
    text: 'Mực trứng hiếm lắm mới mua được, trứng béo ngậy, thịt mực thơm ngọt. Đỉnh thật sự!',
    product: 'Mực Trứng', avatar: '👨',
  },
  {
    name: 'Chị Linh', location: 'Thanh Hóa', rating: 5,
    text: 'Người Sầm Sơn mà cũng phải mua bên Giang Nguyen vì chất lượng ổn định, giá không bị chém.',
    product: 'Mực Khô Loại 2', avatar: '👩',
  },
  {
    name: 'Anh Đức', location: 'Nghệ An', rating: 5,
    text: 'Mua nem chua làm mồi nhậu, vị chua ngọt cay đủ cả. Ship lạnh nên đến tay vẫn tươi ngon.',
    product: 'Nem Chua Thanh Hóa', avatar: '👨',
  },
];

const STATS = [
  { value: '10,000+', label: 'Khách hàng' },
  { value: '50,000+', label: 'Đơn hàng' },
  { value: '4.9/5', label: 'Đánh giá' },
  { value: '99%', label: 'Hài lòng' },
];

export default function SocialProof() {
  return (
    <>
      {/* Stats */}
      <section className="py-8 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-2xl md:text-3xl font-black text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications */}
      <section className="py-8 md:py-10 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="section-title mx-auto">Chứng nhận chất lượng</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {CERTIFICATIONS.map(cert => (
              <div key={cert.name} className="bg-card rounded-xl p-4 border border-border text-center card-hover">
                <span className="text-3xl block mb-2">{cert.icon}</span>
                <h3 className="font-bold text-foreground text-xs">{cert.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer reviews */}
      <section className="py-8 md:py-10 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-6">
            <h2 className="section-title mx-auto">Khách hàng thân thiết</h2>
            <p className="text-sm text-muted-foreground mt-3">Hàng nghìn khách hàng tin tưởng và quay lại mua</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {REVIEWS.map((r, i) => (
              <div key={i} className="bg-card rounded-xl border border-border p-5 card-hover">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl">{r.avatar}</span>
                  <div>
                    <p className="font-bold text-foreground text-sm">{r.name}</p>
                    <p className="text-[10px] text-muted-foreground">{r.location}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {Array.from({ length: r.rating }).map((_, j) => (
                      <Star key={j} className="h-3 w-3 fill-accent text-accent" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-foreground italic mb-2">"{r.text}"</p>
                <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                  {r.product}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
