import { Star, Quote } from 'lucide-react';

const REVIEWS = [
  {
    name: 'Chị Hương',
    location: 'Hà Nội',
    avatar: '👩',
    rating: 5,
    product: 'Mực Khô Loại 1',
    text: 'Mực khô loại 1 rất ngon, nướng lên thơm lừng cả nhà. Ship nhanh, đóng gói cẩn thận. Lần sau nhất định mua lại!',
    date: '2 tuần trước',
  },
  {
    name: 'Anh Tuấn',
    location: 'TP.HCM',
    avatar: '👨',
    rating: 5,
    product: 'Combo Quà Biếu',
    text: 'Mua làm quà biếu sếp dịp Tết, được khen hết lời. Hộp quà sang trọng, hải sản tươi ngon. Rất đáng tiền!',
    date: '1 tuần trước',
  },
  {
    name: 'Chị Mai',
    location: 'Đà Nẵng',
    avatar: '👩‍🍳',
    rating: 5,
    product: 'Cá Thu 1 Nắng',
    text: 'Cá thu 1 nắng chiên lên vàng giòn, cả nhà ai cũng mê. Giá rất hợp lý, chất lượng tuyệt vời!',
    date: '3 ngày trước',
  },
  {
    name: 'Anh Đức',
    location: 'Hải Phòng',
    avatar: '🧑',
    rating: 5,
    product: 'Mực Trứng',
    text: 'Mực trứng béo ngậy, nướng lên trứng nở bung ra. Lần đầu ăn mà nghiện luôn, đã mua lần 3 rồi!',
    date: '5 ngày trước',
  },
  {
    name: 'Chị Lan',
    location: 'Nghệ An',
    avatar: '👩‍💼',
    rating: 5,
    product: 'Nem Chua Thanh Hóa',
    text: 'Nem chua chua ngọt vừa miệng, ăn kèm tỏi ớt thì hết sảy. Con gái mình mê lắm, cứ đòi mua thêm hoài!',
    date: '1 tuần trước',
  },
];

export default function CustomerReviews() {
  return (
    <section className="py-8 md:py-12 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="section-title mx-auto">KHÁCH HÀNG NÓI GÌ VỀ CHÚNG TÔI</h2>
          <p className="text-sm text-muted-foreground mt-1">Hơn 10.000+ khách hàng hài lòng trên toàn quốc</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {REVIEWS.map((review, i) => (
            <div
              key={i}
              className="flex-shrink-0 w-72 md:w-80 bg-background rounded-xl border border-border p-5 snap-start hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full ocean-gradient flex items-center justify-center text-lg">
                  {review.avatar}
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{review.name}</p>
                  <p className="text-[10px] text-muted-foreground">{review.location} • {review.date}</p>
                </div>
                <Quote className="h-5 w-5 text-primary/20" />
              </div>

              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                ))}
              </div>

              <p className="text-xs text-muted-foreground mb-2 leading-relaxed line-clamp-3">{review.text}</p>

              <div className="flex items-center gap-1.5 mt-auto">
                <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                  ✓ Đã mua: {review.product}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Trust stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 max-w-lg mx-auto">
          {[
            { value: '10.000+', label: 'Khách hàng' },
            { value: '4.9/5', label: 'Đánh giá' },
            { value: '98%', label: 'Hài lòng' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-lg md:text-xl font-black text-primary">{stat.value}</p>
              <p className="text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
