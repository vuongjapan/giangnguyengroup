import { useSiteContent } from '@/hooks/useSiteContent';

interface Reason {
  icon: string;
  title: string;
  desc: string;
}

interface WhyChooseData {
  heading: string;
  reasons: Reason[];
}

const DEFAULT_DATA: WhyChooseData = {
  heading: 'TẠI SAO NÊN CHỌN GIANG NGUYÊN SEAFOOD',
  reasons: [
    {
      icon: '🌊',
      title: 'Nguồn Gốc Sầm Sơn',
      desc: 'Thu mua trực tiếp từ ngư dân Sầm Sơn – Thanh Hóa, đảm bảo nguồn gốc rõ ràng và minh bạch.',
    },
    {
      icon: '✅',
      title: 'Kiểm Định Sạch',
      desc: '100% hải sản đạt chứng nhận ATTP, không hóa chất, không chất bảo quản, an toàn cho cả gia đình.',
    },
    {
      icon: '📦',
      title: 'Đóng Gói Chân Không',
      desc: 'Đóng gói chân không cao cấp, giữ trọn hương vị tươi ngon, sang trọng – phù hợp làm quà biếu.',
    },
    {
      icon: '🚚',
      title: 'Giao Toàn Quốc',
      desc: 'Free ship đơn từ 1.5 triệu, giao hỏa tốc nội thành 2H, đổi trả 24h hoàn tiền 100%.',
    },
  ],
};

export default function WhyChooseUs() {
  const { data } = useSiteContent<WhyChooseData>('why_choose_us', DEFAULT_DATA);
  const reasons = data.reasons?.length ? data.reasons : DEFAULT_DATA.reasons;
  const heading = data.heading || DEFAULT_DATA.heading;

  return (
    <section className="py-10 md:py-14 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-xl md:text-3xl font-black text-primary mb-2">
            {heading}
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 max-w-6xl mx-auto">
          {reasons.slice(0, 4).map((r, i) => (
            <div
              key={i}
              className="relative bg-card rounded-2xl p-5 md:p-6 border-t-4 border-t-primary border border-border shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 text-center"
            >
              <div className="text-5xl md:text-[48px] mb-3 leading-none">{r.icon}</div>
              <h3 className="font-bold text-foreground text-sm md:text-base mb-2 leading-tight">
                {r.title}
              </h3>
              <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">
                {r.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
