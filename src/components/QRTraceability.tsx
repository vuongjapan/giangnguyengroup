import { useState } from 'react';
import { QrCode, MapPin, Calendar, Factory, Camera, ChevronDown, ChevronUp } from 'lucide-react';

interface Props {
  product: {
    name: string;
    description: {
      specs: { origin: string; weight: string; expiry: string };
      highlights: { origin: string; process: string; packaging: string };
    };
  };
}

export default function QRTraceability({ product }: Props) {
  const [expanded, setExpanded] = useState(false);
  const batchCode = `GN-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000 + 1000))}`;
  const packDate = new Date(Date.now() - 7 * 86400000).toLocaleDateString('vi-VN');

  return (
    <section className="border border-primary/20 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 bg-primary/5 hover:bg-primary/10 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg ocean-gradient flex items-center justify-center">
            <QrCode className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="text-left">
            <h3 className="font-bold text-foreground text-sm">Truy xuất nguồn gốc</h3>
            <p className="text-[10px] text-muted-foreground">Mã lô: {batchCode}</p>
          </div>
        </div>
        {expanded ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
      </button>

      {expanded && (
        <div className="p-4 space-y-4 animate-fade-in">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="flex items-start gap-3 bg-secondary/40 rounded-lg p-3">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Ngày đóng gói</p>
                <p className="text-xs text-muted-foreground">{packDate}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-secondary/40 rounded-lg p-3">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Nguồn gốc</p>
                <p className="text-xs text-muted-foreground">{product.description.specs.origin}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-secondary/40 rounded-lg p-3">
              <Factory className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Quy trình sản xuất</p>
                <p className="text-xs text-muted-foreground">{product.description.highlights.process}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 bg-secondary/40 rounded-lg p-3">
              <Camera className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-foreground">Đóng gói</p>
                <p className="text-xs text-muted-foreground">{product.description.highlights.packaging}</p>
              </div>
            </div>
          </div>

          <div className="text-center py-3 bg-muted rounded-lg">
            <QrCode className="h-20 w-20 mx-auto text-foreground mb-2" />
            <p className="text-[10px] text-muted-foreground">Quét QR để xác minh sản phẩm</p>
            <p className="text-xs font-bold text-primary mt-1">{batchCode}</p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-success">
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
            Sản phẩm đã được xác minh chính gốc Sầm Sơn
          </div>
        </div>
      )}
    </section>
  );
}
