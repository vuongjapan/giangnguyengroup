import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Search, Trash2, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';

interface SearchLog {
  id: string;
  search_type: string;
  search_value: string;
  result_found: boolean;
  created_at: string;
}

const TYPE_LABEL: Record<string, string> = {
  code: 'Mã đơn',
  phone: 'SĐT',
  email: 'Email',
};

export default function SearchLogsManager() {
  const [logs, setLogs] = useState<SearchLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'found' | 'notfound'>('all');
  const [q, setQ] = useState('');

  const fetchLogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('search_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(500);
    if (!error && data) setLogs(data as SearchLog[]);
    setLoading(false);
  };

  useEffect(() => { fetchLogs(); }, []);

  const clearAll = async () => {
    if (!confirm('Xóa toàn bộ lịch sử tra cứu?')) return;
    const { error } = await supabase.from('search_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) toast.error('Lỗi: ' + error.message);
    else { toast.success('Đã xóa lịch sử'); fetchLogs(); }
  };

  const deleteOne = async (id: string) => {
    const { error } = await supabase.from('search_logs').delete().eq('id', id);
    if (!error) { setLogs(prev => prev.filter(l => l.id !== id)); toast.success('Đã xóa'); }
  };

  const filtered = logs.filter(l => {
    if (filter === 'found' && !l.result_found) return false;
    if (filter === 'notfound' && l.result_found) return false;
    if (q && !l.search_value.toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  const totalFound = logs.filter(l => l.result_found).length;
  const totalNotFound = logs.length - totalFound;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Tổng tra cứu</p>
          <p className="text-2xl font-bold text-primary">{logs.length}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Tìm thấy</p>
          <p className="text-2xl font-bold text-green-600">{totalFound}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground">Không thấy</p>
          <p className="text-2xl font-bold text-red-600">{totalNotFound}</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex flex-wrap gap-2 items-center mb-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={q} onChange={e => setQ(e.target.value)} placeholder="Tìm theo giá trị (SĐT/email/mã)"
              className="w-full pl-8 pr-2 py-2 text-sm rounded-lg border border-border bg-background" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value as any)}
            className="px-3 py-2 text-sm rounded-lg border border-border bg-background">
            <option value="all">Tất cả</option>
            <option value="found">Tìm thấy</option>
            <option value="notfound">Không thấy</option>
          </select>
          <button onClick={fetchLogs} className="p-2 rounded-lg border border-border hover:bg-muted">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={clearAll} className="px-3 py-2 text-sm rounded-lg bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 inline-flex items-center gap-1">
            <Trash2 className="h-4 w-4" /> Xóa hết
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr className="text-left">
                <th className="px-3 py-2">Thời gian</th>
                <th className="px-3 py-2">Loại</th>
                <th className="px-3 py-2">Giá trị tra cứu</th>
                <th className="px-3 py-2 text-center">Kết quả</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={5} className="text-center py-6 text-muted-foreground">Không có dữ liệu</td></tr>
              )}
              {filtered.map(l => (
                <tr key={l.id} className="border-t border-border hover:bg-muted/30">
                  <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(l.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td className="px-3 py-2">
                    <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">
                      {TYPE_LABEL[l.search_type] || l.search_type}
                    </span>
                  </td>
                  <td className="px-3 py-2 font-mono text-xs">{l.search_value}</td>
                  <td className="px-3 py-2 text-center">
                    {l.result_found
                      ? <CheckCircle2 className="h-4 w-4 text-green-600 inline" />
                      : <XCircle className="h-4 w-4 text-red-600 inline" />}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <button onClick={() => deleteOne(l.id)} className="p-1 text-muted-foreground hover:text-red-600">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
