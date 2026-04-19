import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, Mail, RefreshCw, Trash2 } from 'lucide-react';

export default function AbandonedCartsManager() {
  const [carts, setCarts] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: c1 }, { data: c2 }] = await Promise.all([
      supabase.from('abandoned_carts').select('*').order('created_at', { ascending: false }).limit(50),
      supabase.from('repeat_order_campaigns').select('*').order('sent_at', { ascending: false }).limit(50),
    ]);
    setCarts(c1 || []);
    setCampaigns(c2 || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const runRecovery = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('abandoned-cart-recover');
      if (error) throw error;
      toast.success(`Đã gửi ${data.processed} email nhắc giỏ hàng`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setRunning(false); }
  };

  const runRepeat = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('repeat-order-cron');
      if (error) throw error;
      toast.success(`Đã gửi ${data.sent} email mời mua lại`);
      load();
    } catch (e: any) {
      toast.error(e.message);
    } finally { setRunning(false); }
  };

  const remove = async (id: string) => {
    if (!confirm('Xóa giỏ hàng này?')) return;
    await supabase.from('abandoned_carts').delete().eq('id', id);
    load();
  };

  const stats = {
    total: carts.length,
    pending: carts.filter(c => !c.recovered && !c.reminder_sent_at).length,
    reminded: carts.filter(c => c.reminder_sent_at && !c.recovered).length,
    recovered: carts.filter(c => c.recovered).length,
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border rounded-lg p-4"><div className="text-xs text-muted-foreground">Tổng giỏ hàng dở</div><div className="text-2xl font-bold">{stats.total}</div></div>
        <div className="bg-card border rounded-lg p-4"><div className="text-xs text-muted-foreground">Chưa nhắc</div><div className="text-2xl font-bold text-amber-600">{stats.pending}</div></div>
        <div className="bg-card border rounded-lg p-4"><div className="text-xs text-muted-foreground">Đã gửi nhắc</div><div className="text-2xl font-bold text-blue-600">{stats.reminded}</div></div>
        <div className="bg-card border rounded-lg p-4"><div className="text-xs text-muted-foreground">Đã hồi phục</div><div className="text-2xl font-bold text-green-600">{stats.recovered}</div></div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button onClick={runRecovery} disabled={running} variant="default">
          {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Mail className="h-4 w-4 mr-2" />}
          Chạy nhắc giỏ hàng dở (manual)
        </Button>
        <Button onClick={runRepeat} disabled={running} variant="secondary">
          {running ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
          Chạy mời mua lại 14/30 ngày
        </Button>
        <Button onClick={load} variant="ghost"><RefreshCw className="h-4 w-4 mr-2" />Refresh</Button>
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Giỏ hàng dở (50 mới nhất)</h3>
        {loading ? <Loader2 className="animate-spin" /> : (
          <div className="border rounded-lg overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted"><tr>
                <th className="text-left p-2">Email/SĐT</th>
                <th className="text-right p-2">Giá trị</th>
                <th className="text-left p-2">Items</th>
                <th className="text-left p-2">Trạng thái</th>
                <th className="text-left p-2">Thời gian</th>
                <th></th>
              </tr></thead>
              <tbody>
                {carts.map(c => (
                  <tr key={c.id} className="border-t">
                    <td className="p-2">
                      <div>{c.customer_email || '—'}</div>
                      <div className="text-xs text-muted-foreground">{c.customer_phone || ''}</div>
                    </td>
                    <td className="p-2 text-right font-semibold">{c.total_value.toLocaleString('vi-VN')}₫</td>
                    <td className="p-2">{(c.cart_data as any[])?.length || 0} sp</td>
                    <td className="p-2">
                      {c.recovered ? <span className="text-green-600">✓ Hồi phục</span> :
                       c.reminder_sent_at ? <span className="text-blue-600">📧 Đã nhắc {c.voucher_code}</span> :
                       <span className="text-amber-600">⏳ Chờ</span>}
                    </td>
                    <td className="p-2 text-xs">{new Date(c.created_at).toLocaleString('vi-VN')}</td>
                    <td className="p-2"><Button size="sm" variant="ghost" onClick={() => remove(c.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button></td>
                  </tr>
                ))}
                {carts.length === 0 && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Chưa có giỏ hàng dở</td></tr>}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-semibold mb-3">Chiến dịch mời mua lại</h3>
        <div className="border rounded-lg overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted"><tr>
              <th className="text-left p-2">Khách</th>
              <th className="text-left p-2">Sau X ngày</th>
              <th className="text-left p-2">Voucher</th>
              <th className="text-left p-2">Gửi lúc</th>
            </tr></thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id} className="border-t">
                  <td className="p-2">{c.customer_name} <span className="text-xs text-muted-foreground">({c.customer_email})</span></td>
                  <td className="p-2">{c.days_after} ngày</td>
                  <td className="p-2 font-mono">{c.voucher_code}</td>
                  <td className="p-2 text-xs">{new Date(c.sent_at).toLocaleString('vi-VN')}</td>
                </tr>
              ))}
              {campaigns.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Chưa có chiến dịch</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
