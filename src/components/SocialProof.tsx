import { useSiteContent } from '@/hooks/useSiteContent';

interface CertItem {
  icon: string;
  name: string;
  desc: string;
}

interface CommitmentItem {
  icon: string;
  title: string;
  desc: string;
}

const DEFAULT_CERTIFICATIONS: CertItem[] = [
  { icon: '🏅', name: 'Chứng nhận ATTP', desc: 'An toàn Thực phẩm' },
  { icon: '⭐', name: 'OCOP 4 sao', desc: 'Sản phẩm đặc trưng địa phương' },
  { icon: '🛡️', name: 'Tem chống giả', desc: 'QR truy xuất nguồn gốc' },
  { icon: '✅', name: 'ISO 22000', desc: 'Quản lý an toàn thực phẩm' },
];

const STATS = [
  { value: '10,000+', label: 'Khách hàng' },
  { value: '50,000+', label: 'Đơn hàng' },
  { value: '4.9/5', label: 'Đánh giá' },
  { value: '99%', label: 'Hài lòng' },
];

export default function SocialProof() {
  const { data: certifications } = useSiteContent<CertItem[]>('certifications', DEFAULT_CERTIFICATIONS);
  const certs = certifications?.length ? certifications : DEFAULT_CERTIFICATIONS;

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
            {certs.map(cert => (
              <div key={cert.name} className="bg-card rounded-xl p-4 border border-border text-center card-hover">
                <span className="text-3xl block mb-2">{cert.icon}</span>
                <h3 className="font-bold text-foreground text-xs">{cert.name}</h3>
                <p className="text-[10px] text-muted-foreground mt-0.5">{cert.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
