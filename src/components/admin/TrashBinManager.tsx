import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Trash2, RefreshCw, RotateCcw, Trash } from 'lucide-react';
import { TRASH_LABELS, restoreFromTrash, purgeTrash, emptyTrash } from '@/lib/trashBin';

interface TrashItem {
  id: string;
  entity_type: string;
  entity_id: string;
  display_name: string;
  snapshot: any;
  deleted_at: string;
  expires_at: string;
}

export default function TrashBinManager() {
  const [items, setItems] = useState<TrashItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(false);

  const fetchTrash = async () => {
    setLoading(true);
    const { data } = await supabase.from('trash_bin' as any).select('*').order('deleted_at', { ascending: false });
    setItems((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { fetchTrash(); }, []);

  const handleRestore = async (item: TrashItem) => {
    if (!confirm(`Khôi phục "${item.display_name}"?`)) return;
    const ok = await restoreFromTrash(item.id);
    if (ok) { toast.success('Đã khôi phục!'); fetchTrash(); }
    else toast.error('Không thể khôi phục');
  };

  const handlePurge = async (item: TrashItem) => {
    if (!confirm(`XÓA VĨNH VIỄN "${item.display_name}"? Không thể hoàn tác!`)) return;
    const ok = await purgeTrash(item.id);
    if (ok) { toast.success('Đã xóa vĩnh viễn'); fetchTrash(); }
  };

  const handleEmpty = async () => {
    if (!confirm(`XÓA VĨNH VIỄN tất cả ${items.length} mục trong thùng rác?`)) return;
    const ok = await emptyTrash();
    if (ok) { toast.success('Đã đổ thùng rác'); fetchTrash(); }
  };

  const filtered = filter === 'all' ? items : items.filter(i => i.entity_type === filter);
  const counts: Record<string, number> = {};
  items.forEach(i => { counts[i.entity_type] = (counts[i.entity_type] || 0) + 1; });

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Trash className="h-5 w-5 text-destructive" /> Thùng rác chung ({items.length})
          </h2>
          <p className="text-xs text-muted-foreground mt-1">Mục bị xóa giữ 30 ngày, có thể khôi phục.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchTrash} className="px-3 py-2 rounded-lg border border-border text-sm flex items-center gap-1 hover:bg-muted">
            <RefreshCw className="h-3.5 w-3.5" /> Tải lại
          </button>
          {items.length > 0 && (
            <button onClick={handleEmpty} className="px-3 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-bold flex items-center gap-1 hover:opacity-90">
              <Trash2 className="h-3.5 w-3.5" /> Đổ thùng rác
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
          Tất cả ({items.length})
        </button>
        {Object.entries(TRASH_LABELS).map(([type, label]) => (
          counts[type] ? (
            <button key={type} onClick={() => setFilter(type)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold ${filter === type ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/70'}`}>
              {label} ({counts[type]})
            </button>
          ) : null
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <Trash className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>Thùng rác trống</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted text-muted-foreground">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Loại</th>
                  <th className="text-left px-4 py-3 font-medium">Tên / Mã</th>
                  <th className="text-center px-4 py-3 font-medium">Xóa lúc</th>
                  <th className="text-center px-4 py-3 font-medium">Hết hạn</th>
                  <th className="text-center px-4 py-3 font-medium">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(item => {
                  const daysLeft = Math.max(0, Math.ceil((new Date(item.expires_at).getTime() - Date.now()) / (86400000)));
                  return (
                    <tr key={item.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold bg-muted px-2 py-1 rounded">{TRASH_LABELS[item.entity_type] || item.entity_type}</span>
                      </td>
                      <td className="px-4 py-3 font-medium text-foreground">{item.display_name || '(không tên)'}</td>
                      <td className="px-4 py-3 text-center text-xs text-muted-foreground">
                        {new Date(item.deleted_at).toLocaleString('vi-VN')}
                      </td>
                      <td className="px-4 py-3 text-center text-xs">
                        <span className={daysLeft <= 7 ? 'text-destructive font-bold' : 'text-muted-foreground'}>
                          còn {daysLeft} ngày
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleRestore(item)} title="Khôi phục"
                            className="p-1.5 hover:bg-primary/10 rounded-lg text-primary">
                            <RotateCcw className="h-4 w-4" />
                          </button>
                          <button onClick={() => handlePurge(item)} title="Xóa vĩnh viễn"
                            className="p-1.5 hover:bg-destructive/10 rounded-lg text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
