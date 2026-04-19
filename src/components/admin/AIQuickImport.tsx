import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Sparkles } from 'lucide-react';

export default function AIQuickImport() {
  const [raw, setRaw] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any[]>([]);

  const importNow = async () => {
    if (!raw.trim()) { toast.error('Paste danh sách sản phẩm'); return; }
    setLoading(true);
    setResult([]);
    try {
      const { data, error } = await supabase.functions.invoke('ai-quick-import', {
        body: { raw_list: raw },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setResult(data.products || []);
      toast.success(`Đã tạo ${data.created} sản phẩm`);
      setRaw('');
    } catch (e: any) {
      toast.error(e.message || 'Lỗi import');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-primary/5 rounded-lg p-4">
        <h3 className="font-semibold mb-2 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          AI Quick Import (tối đa 25 sản phẩm/lần)
        </h3>
        <p className="text-sm text-muted-foreground mb-3">
          Paste mỗi dòng 1 sản phẩm. AI sẽ tự chuẩn hóa tên, slug, category, mô tả, meta SEO, tags.
          Sản phẩm thiếu thông tin sẽ có status "needs_review".
        </p>
        <Textarea
          placeholder={`Mực khô loại 1 500g
Tôm khô đặc biệt 1kg
Cá chỉ vàng 300g 250k
Combo quà biếu Tết A
...`}
          value={raw}
          onChange={e => setRaw(e.target.value)}
          rows={12}
          className="font-mono text-sm"
          disabled={loading}
        />
        <div className="flex justify-between items-center mt-3">
          <div className="text-xs text-muted-foreground">
            {raw.split('\n').filter(l => l.trim().length > 3).length} dòng hợp lệ
          </div>
          <Button onClick={importNow} disabled={loading || !raw.trim()}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
            {loading ? 'AI đang xử lý...' : 'Chuẩn hóa & Import'}
          </Button>
        </div>
      </div>

      {result.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-green-50 p-3 border-b">
            <strong className="text-green-700">✓ Đã tạo {result.length} sản phẩm</strong>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr><th className="text-left p-2">Tên</th><th className="text-left p-2">Status</th></tr>
            </thead>
            <tbody>
              {result.map((p: any) => (
                <tr key={p.id} className="border-t">
                  <td className="p-2">{p.name}</td>
                  <td className="p-2">
                    <span className={`px-2 py-1 rounded text-xs ${p.status === 'needs_review' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
