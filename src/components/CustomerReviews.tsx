import { useState } from 'react';
import { Star, Send, User } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useQuery, useQueryClient } from '@tanstack/react-query';

const STATIC_REVIEWS = [
  {
    name: 'Chị Hương',
    location: 'Hà Nội',
    rating: 5,
    product: 'Mực Khô Loại 1',
    text: 'Mực khô loại 1 rất ngon, nướng lên thơm lừng cả nhà. Ship nhanh, đóng gói cẩn thận. Lần sau nhất định mua lại!',
    date: '2 tuần trước',
  },
  {
    name: 'Anh Tuấn',
    location: 'TP.HCM',
    rating: 5,
    product: 'Combo Quà Biếu',
    text: 'Mua làm quà biếu sếp dịp Tết, được khen hết lời. Hộp quà sang trọng, hải sản tươi ngon. Rất đáng tiền!',
    date: '1 tuần trước',
  },
  {
    name: 'Chị Mai',
    location: 'Đà Nẵng',
    rating: 5,
    product: 'Cá Thu 1 Nắng',
    text: 'Cá thu 1 nắng chiên lên vàng giòn, cả nhà ai cũng mê. Giá rất hợp lý, chất lượng tuyệt vời!',
    date: '3 ngày trước',
  },
  {
    name: 'Anh Đức',
    location: 'Hải Phòng',
    rating: 5,
    product: 'Mực Trứng',
    text: 'Mực trứng béo ngậy, nướng lên trứng nở bung ra. Lần đầu ăn mà nghiện luôn, đã mua lần 3 rồi!',
    date: '5 ngày trước',
  },
  {
    name: 'Chị Lan',
    location: 'Nghệ An',
    rating: 5,
    product: 'Nem Chua Thanh Hóa',
    text: 'Nem chua chua ngọt vừa miệng, ăn kèm tỏi ớt thì hết sảy. Con gái mình mê lắm, cứ đòi mua thêm hoài!',
    date: '1 tuần trước',
  },
];

export default function CustomerReviews() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);

  // Fetch user reviews from DB (general site reviews use a special product_id)
  const { data: userReviews = [] } = useQuery({
    queryKey: ['site-reviews'],
    queryFn: async () => {
      const { data } = await supabase
        .from('product_reviews')
        .select('*')
        .eq('product_id', 'site-review')
        .order('created_at', { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const handleSubmitReview = async () => {
    if (!user) {
      toast.error('Vui lòng đăng nhập để đánh giá');
      return;
    }
    if (!reviewText.trim() || !reviewName.trim()) {
      toast.error('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('product_reviews').insert({
      product_id: 'site-review',
      user_id: user.id,
      reviewer_name: reviewName,
      rating: reviewRating,
      comment: reviewText,
    });
    setSubmitting(false);
    if (error) {
      toast.error('Gửi đánh giá thất bại');
    } else {
      toast.success('Cảm ơn bạn đã đánh giá!');
      setReviewText('');
      setReviewName('');
      setReviewRating(5);
      setShowForm(false);
      queryClient.invalidateQueries({ queryKey: ['site-reviews'] });
    }
  };

  return (
    <section className="py-8 md:py-12 bg-card">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="section-title mx-auto">KHÁCH HÀNG NÓI GÌ VỀ CHÚNG TÔI</h2>
          <p className="text-sm text-muted-foreground mt-1">Hơn 10.000+ khách hàng hài lòng trên toàn quốc</p>
        </div>

        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
          {STATIC_REVIEWS.map((review, i) => (
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

          {/* User submitted reviews */}
          {userReviews.map((review: any) => (
            <div
              key={review.id}
              className="flex-shrink-0 w-72 md:w-80 bg-background rounded-xl border border-primary/20 p-5 snap-start hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-lg">
                  👤
                </div>
                <div className="flex-1">
                  <p className="font-bold text-foreground text-sm">{review.reviewer_name}</p>
                  <p className="text-[10px] text-muted-foreground">{new Date(review.created_at).toLocaleDateString('vi-VN')}</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-2">
                {Array.from({ length: review.rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-accent text-accent" />
                ))}
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">{review.comment}</p>
            </div>
          ))}
        </div>

        {/* Submit review */}
        <div className="mt-6 text-center">
          {!showForm ? (
            <button
              onClick={() => {
                if (!user) {
                  toast.error('Vui lòng đăng nhập để đánh giá');
                  return;
                }
                setShowForm(true);
              }}
              className="ocean-gradient text-primary-foreground font-bold px-6 py-2.5 rounded-full text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2"
            >
              <Star className="h-4 w-4" /> Viết đánh giá
            </button>
          ) : (
            <div className="max-w-md mx-auto bg-background rounded-xl border border-border p-4 text-left">
              <h3 className="font-bold text-foreground text-sm mb-3">Đánh giá của bạn</h3>
              <input
                value={reviewName}
                onChange={e => setReviewName(e.target.value)}
                placeholder="Tên hiển thị..."
                className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <div className="flex gap-1 mb-2">
                {[1, 2, 3, 4, 5].map(s => (
                  <button key={s} onClick={() => setReviewRating(s)}>
                    <Star className={`h-5 w-5 ${s <= reviewRating ? 'fill-accent text-accent' : 'text-muted-foreground'}`} />
                  </button>
                ))}
              </div>
              <textarea
                value={reviewText}
                onChange={e => setReviewText(e.target.value)}
                placeholder="Chia sẻ trải nghiệm của bạn..."
                rows={3}
                className="w-full border border-border rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleSubmitReview}
                  disabled={submitting}
                  className="ocean-gradient text-primary-foreground font-bold px-5 py-2 rounded-full text-sm hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="h-3.5 w-3.5" /> Gửi đánh giá
                </button>
                <button
                  onClick={() => setShowForm(false)}
                  className="border border-border text-foreground font-medium px-4 py-2 rounded-full text-sm hover:bg-muted"
                >
                  Hủy
                </button>
              </div>
            </div>
          )}
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
