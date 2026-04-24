import { useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Download, Upload, FileSpreadsheet, Loader2, FileDown } from 'lucide-react';

/**
 * Export/Import CSV cho products — tập trung vào các trường mô tả nhanh:
 * id, slug, name, taste, color, ingredients, cooking
 *
 * - Export: tải toàn bộ products thành .csv (UTF-8 BOM cho Excel VN).
 * - Import: parse CSV, match theo `id` (ưu tiên) hoặc `slug`, chỉ update 4 trường
 *   taste/color/ingredients/cooking (an toàn — không ghi đè giá, ảnh, tồn kho...).
 */

interface Props {
  onImported?: () => void;
}

const FIELDS = ['id', 'slug', 'name', 'taste', 'color', 'ingredients', 'cooking'] as const;
const EDITABLE = ['taste', 'color', 'ingredients', 'cooking'] as const;

function escapeCsv(v: unknown): string {
  const s = v == null ? '' : String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

// CSV parser nhỏ gọn — hỗ trợ field có dấu phẩy / xuống dòng / quote escape ""
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = '';
  let inQuotes = false;
  // bỏ BOM
  if (text.charCodeAt(0) === 0xfeff) text = text.slice(1);
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { cur += '"'; i++; }
        else inQuotes = false;
      } else cur += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === ',') { row.push(cur); cur = ''; }
      else if (ch === '\n') { row.push(cur); rows.push(row); row = []; cur = ''; }
      else if (ch === '\r') { /* skip */ }
      else cur += ch;
    }
  }
  if (cur.length > 0 || row.length > 0) { row.push(cur); rows.push(row); }
  return rows.filter(r => r.some(c => c.trim().length > 0));
}

export default function ProductCsvTools({ onImported }: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState<'export' | 'import' | null>(null);
  const [report, setReport] = useState<{ updated: number; skipped: number; errors: string[] } | null>(null);

  const downloadTemplate = () => {
    const header = FIELDS.join(',');
    const samples = [
      ['', 'muc-kho-loai-1', 'Mực khô loại 1', 'Ngọt đậm, hậu vị bùi', 'Hồng cam tự nhiên', 'Mực ống tươi, muối biển', 'Nướng than 2-3 phút mỗi mặt, xé nhỏ chấm tương ớt'],
      ['', 'tom-kho-dac-biet', 'Tôm khô đặc biệt', 'Ngọt thanh, dai vừa', 'Đỏ cam óng', 'Tôm biển tươi, muối', 'Rang khô 1 phút hoặc nấu canh bí, củ cải'],
      ['', 'ca-chi-vang-300g', 'Cá chỉ vàng 300g', 'Mặn dịu, thơm nắng biển', 'Vàng nhạt', 'Cá chỉ vàng, muối biển', 'Chiên giòn hoặc nướng giấy bạc 5 phút'],
    ];
    const body = samples.map(r => r.map(escapeCsv).join(',')).join('\n');
    const csv = '\uFEFF' + header + '\n' + body;
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'products-template.csv';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Đã tải file mẫu — mở bằng Excel để chỉnh sửa');
  };

  const exportCsv = async () => {
    setBusy('export');
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, slug, name, taste, color, ingredients, cooking')
        .order('sort_order');
      if (error) throw error;
      const header = FIELDS.join(',');
      const body = (data || []).map(r => FIELDS.map(f => escapeCsv((r as any)[f])).join(',')).join('\n');
      const csv = '\uFEFF' + header + '\n' + body;
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `products-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Đã export ${data?.length || 0} sản phẩm`);
    } catch (e: any) {
      toast.error(e.message || 'Lỗi export');
    } finally {
      setBusy(null);
    }
  };

  const onPickFile = () => fileRef.current?.click();

  const importCsv = async (file: File) => {
    setBusy('import');
    setReport(null);
    try {
      const text = await file.text();
      const rows = parseCsv(text);
      if (rows.length < 2) throw new Error('CSV rỗng hoặc không có dòng dữ liệu');
      const header = rows[0].map(h => h.trim().toLowerCase());
      const idIdx = header.indexOf('id');
      const slugIdx = header.indexOf('slug');
      if (idIdx === -1 && slugIdx === -1) throw new Error('CSV phải có cột "id" hoặc "slug" để khớp sản phẩm');

      // Lấy danh sách products để map slug → id (nếu cần)
      const { data: existing, error: fetchErr } = await supabase.from('products').select('id, slug');
      if (fetchErr) throw fetchErr;
      const slugToId = new Map((existing || []).map(p => [p.slug, p.id]));
      const validIds = new Set((existing || []).map(p => p.id));

      const fieldIdx: Record<string, number> = {};
      EDITABLE.forEach(f => { fieldIdx[f] = header.indexOf(f); });
      const hasAnyEditable = EDITABLE.some(f => fieldIdx[f] !== -1);
      if (!hasAnyEditable) throw new Error('CSV không có cột nào trong: taste, color, ingredients, cooking');

      let updated = 0, skipped = 0;
      const errors: string[] = [];

      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        let pid = idIdx !== -1 ? r[idIdx]?.trim() : '';
        if (!pid && slugIdx !== -1) {
          const slug = r[slugIdx]?.trim();
          pid = slug ? (slugToId.get(slug) || '') : '';
        }
        if (!pid || !validIds.has(pid)) {
          skipped++;
          if (errors.length < 5) errors.push(`Dòng ${i + 1}: không tìm thấy sản phẩm`);
          continue;
        }
        const patch: Record<string, string> = {};
        EDITABLE.forEach(f => {
          const idx = fieldIdx[f];
          if (idx !== -1 && r[idx] !== undefined) patch[f] = r[idx];
        });
        if (Object.keys(patch).length === 0) { skipped++; continue; }
        const { error: upErr } = await supabase.from('products').update(patch as any).eq('id', pid);
        if (upErr) {
          skipped++;
          if (errors.length < 5) errors.push(`Dòng ${i + 1}: ${upErr.message}`);
        } else updated++;
      }

      setReport({ updated, skipped, errors });
      if (updated > 0) toast.success(`Đã cập nhật ${updated} sản phẩm`);
      if (skipped > 0 && updated === 0) toast.error(`Bỏ qua ${skipped} dòng — kiểm tra báo cáo bên dưới`);
      onImported?.();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi import');
    } finally {
      setBusy(null);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  return (
    <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-4">
      <div className="flex flex-wrap items-center gap-2">
        <FileSpreadsheet className="h-5 w-5 text-primary" />
        <span className="text-sm font-bold text-foreground">CSV — Mùi vị / Màu sắc / Thành phần / Cách chế biến</span>
        <div className="flex-1" />
        <button
          onClick={downloadTemplate}
          disabled={busy !== null}
          className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm font-medium hover:bg-muted flex items-center gap-1.5 disabled:opacity-50"
          title="Tải file CSV mẫu với 3 dòng ví dụ"
        >
          <FileDown className="h-4 w-4" /> File mẫu
        </button>
        <button
          onClick={exportCsv}
          disabled={busy !== null}
          className="px-3 py-1.5 rounded-lg bg-card border border-border text-sm font-medium hover:bg-muted flex items-center gap-1.5 disabled:opacity-50"
        >
          {busy === 'export' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Export CSV
        </button>
        <button
          onClick={onPickFile}
          disabled={busy !== null}
          className="px-3 py-1.5 rounded-lg ocean-gradient text-primary-foreground text-sm font-bold hover:opacity-90 flex items-center gap-1.5 disabled:opacity-50"
        >
          {busy === 'import' ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
          Import CSV
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={e => e.target.files?.[0] && importCsv(e.target.files[0])}
        />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Mở bằng Excel/Google Sheets, điền 4 cột <b>taste / color / ingredients / cooking</b>, lưu lại .csv rồi Import.
        Khớp theo <b>id</b> (ưu tiên) hoặc <b>slug</b>. Các cột khác được bỏ qua để an toàn.
      </p>
      {report && (
        <div className="mt-2 text-xs bg-card border border-border rounded p-2">
          <p>✓ Cập nhật: <b className="text-primary">{report.updated}</b> &nbsp;·&nbsp; ⏭ Bỏ qua: <b>{report.skipped}</b></p>
          {report.errors.length > 0 && (
            <ul className="mt-1 list-disc list-inside text-destructive">
              {report.errors.map((e, i) => <li key={i}>{e}</li>)}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
