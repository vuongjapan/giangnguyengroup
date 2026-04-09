import { useSiteContent } from '@/hooks/useSiteContent';
import { ShieldCheck, Truck, RefreshCw, Award, Leaf, HeadphonesIcon, Package } from 'lucide-react';

interface Reason {
  icon: string;
  title: string;
  details: string[];
}

interface WhyChooseData {
  heading: string;
  reasons: Reason[];
}

const DEFAULT_DATA: WhyChooseData = {
  heading: '7 LÝ DO NÊN CHỌN GIANG NGUYÊN SEAFOOD',
  reasons: [
    {
      icon: 'package',
      title: 'ĐA DẠNG HÀNG HÓA',
      details: [
        'Hải sản TƯƠI SỐNG, ĐÔNG LẠNH, KHÔ đa dạng chủng loại',
        'Hơn 50+ sản phẩm chính gốc Sầm Sơn',
        'Đặc sản theo mùa, quà biếu cao cấp',
      ],
    },
    {
      icon: 'shield',
      title: 'CAM KẾT CHẤT LƯỢNG',
      details: [
        'CHẤT LƯỢNG SẢN PHẨM ĐƯỢC CAM KẾT với chính sách đổi trả minh bạch',
        '100% hải sản sạch, không hóa chất, không chất bảo quản',
        'HOÀN TIỀN NHANH CHÓNG nếu sản phẩm không đạt yêu cầu',
      ],
    },
    {
      icon: 'truck',
      title: 'THANH TOÁN LINH HOẠT',
      details: [
        'Thanh toán COD, chuyển khoản, quét QR tiện lợi',
        'CAM KẾT BẢO MẬT thông tin khách hàng tuyệt đối',
        'Hỗ trợ cọc 50% cho đơn hàng từ xa',
      ],
    },
    {
      icon: 'award',
      title: 'QUYỀN LỢI KHÁCH HÀNG',
      details: [
        'Tích điểm khi mua hàng, đổi quà giá trị',
        'Giảm thêm 5% cho khách hàng thân thiết',
        'Ưu đãi sinh nhật, quà tặng bất ngờ',
      ],
    },
    {
      icon: 'refresh',
      title: 'DỄ DÀNG MUA SẮM',
      details: [
        'Website thân thiện, dễ sử dụng trên mọi thiết bị',
        'Đặt hàng online 24/7, giao tận cửa nhà',
        'Chat tư vấn trực tuyến, phản hồi nhanh',
      ],
    },
    {
      icon: 'headphones',
      title: 'GIAO HÀNG NHANH',
      details: [
        'Giao HỎA TỐC nội thành trong 2H',
        'MIỄN PHÍ VẬN CHUYỂN cho đơn hàng từ 500K',
        'Đóng gói cẩn thận, giữ độ tươi nguyên vẹn',
      ],
    },
    {
      icon: 'leaf',
      title: 'NGUỒN GỐC SẢN PHẨM',
      details: [
        '100% NGUỒN GỐC RÕ RÀNG, minh bạch',
        'Thu mua trực tiếp từ ngư dân Sầm Sơn',
        'Quy trình phơi sấy truyền thống, đảm bảo vệ sinh ATTP',
      ],
    },
  ],
};

const ICON_MAP: Record<string, React.ElementType> = {
  package: Package,
  shield: ShieldCheck,
  truck: Truck,
  award: Award,
  refresh: RefreshCw,
  headphones: HeadphonesIcon,
  leaf: Leaf,
};

export default function WhyChooseUs() {
  const { data } = useSiteContent<WhyChooseData>('why_choose_us', DEFAULT_DATA);
  const reasons = data.reasons?.length ? data.reasons : DEFAULT_DATA.reasons;
  const heading = data.heading || DEFAULT_DATA.heading;

  return (
    <section className="py-8 md:py-12">
      <div className="container mx-auto px-4">
        <div className="text-center mb-6">
          <h2 className="text-xl md:text-2xl font-black text-primary mb-1">
            {heading}
          </h2>
          <div className="w-20 h-1 bg-primary mx-auto rounded-full" />
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="border border-border rounded-2xl overflow-hidden bg-card shadow-lg">
            {/* Table header */}
            <div className="ocean-gradient px-4 py-3 grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr]">
              <span className="text-primary-foreground font-bold text-sm md:text-base">TIÊU CHÍ</span>
              <span className="text-primary-foreground font-bold text-sm md:text-base">MUA HÀNG TẠI GIANG NGUYÊN SEAFOOD</span>
            </div>

            {/* Rows */}
            {reasons.map((reason, i) => {
              const IconComp = ICON_MAP[reason.icon] || Package;
              return (
                <div
                  key={i}
                  className={`grid grid-cols-[140px_1fr] md:grid-cols-[200px_1fr] border-t border-border ${
                    i % 2 === 0 ? 'bg-card' : 'bg-secondary/30'
                  }`}
                >
                  <div className="px-4 py-3 flex flex-col items-center justify-center text-center border-r border-border">
                    <IconComp className="h-5 w-5 text-primary mb-1" />
                    <span className="text-xs md:text-sm font-bold text-foreground leading-tight">{reason.title}</span>
                  </div>
                  <div className="px-4 py-3 space-y-1">
                    {reason.details.map((d, j) => (
                      <p key={j} className="text-xs md:text-sm text-muted-foreground flex items-start gap-1.5">
                        <span className="text-primary mt-0.5 flex-shrink-0">✓</span>
                        <span dangerouslySetInnerHTML={{ __html: d.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground">$1</strong>') }} />
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
