import { useSiteContent } from '@/hooks/useSiteContent';

interface CertItem {
  icon: string;
  name: string;
  desc: string;
}

const DEFAULT_CERTIFICATIONS: CertItem[] = [
  { icon: '🏅', name: 'Chứng nhận ATTP', desc: 'An toàn Thực phẩm' },
  { icon: '⭐', name: 'OCOP 4 sao', desc: 'Sản phẩm đặc trưng địa phương' },
  { icon: '🛡️', name: 'Tem chống giả', desc: 'QR truy xuất nguồn gốc' },
  { icon: '✅', name: 'ISO 22000', desc: 'Quản lý an toàn thực phẩm' },
];

export default function SocialProof() {
  const { data: certifications } = useSiteContent<CertItem[]>('certifications', DEFAULT_CERTIFICATIONS);
  const certs = certifications?.length ? certifications : DEFAULT_CERTIFICATIONS;

  return (
    <section className="py-10 md:py-14 bg-muted/40">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="section-title mx-auto">Chứng nhận chất lượng</h2>
          <p className="text-sm text-muted-foreground mt-2">Cam kết chuẩn quốc gia – minh bạch nguồn gốc</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-5xl mx-auto">
          {certs.map(cert => (
            <div
              key={cert.name}
              className="bg-card rounded-2xl p-5 md:p-6 border border-border text-center shadow-sm hover:shadow-lg transition-shadow flex flex-col items-center justify-center min-h-[180px]"
            >
              <div className="w-[120px] h-[120px] rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center mb-3">
                <span className="text-6xl">{cert.icon}</span>
              </div>
              <h3 className="font-bold text-foreground text-sm md:text-base leading-tight">{cert.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{cert.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
