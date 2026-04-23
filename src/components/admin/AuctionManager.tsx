import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Plus, Edit, Trash2, Save, X, Power, Users, Eye } from 'lucide-react';
import { formatPrice } from '@/data/products';
import { Switch } from '@/components/ui/switch';

interface Auction {
  id: string;
  name: string;
  slug: string;
  image: string;
  description: string;
  list_price: number;
  start_price: number;
  min_increment: number;
  current_price: number;
  start_at: string;
  end_at: string;
  is_active: boolean;
  fake_viewers: number;
  sort_order: number;
}

interface Bid {
  id: string;
  auction_id: string;
  customer_name: string;
  customer_phone: string;
  bid_amount: number;
  created_at: string;
}

const slugify = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-').slice(0, 80);

const toLocalDT = (iso: string) => {
  if (!iso) return '';
  const d = new Date(iso);
  const tz = d.getTimezoneOffset() * 60000;
  return new Date(d.getTime() - tz).toISOString().slice(0, 16);
};

export default function AuctionManager() {
  const [systemEnabled, setSystemEnabled] = useState(true);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [bids, setBids] = useState<Bid[]>([]);
  const [editing, setEditing] = useState<Partial<Auction> | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showBidsFor, setShowBidsFor] = useState<string | null>(null);

  useEffect(() => {
    fetchSetting();
    fetchAuctions();
    fetchBids();
  }, []);

  const fetchSetting = async () => {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'auction_enabled').maybeSingle();
    setSystemEnabled(data?.value === false || data?.value === 'false' ? false : true);
  };

  const fetchAuctions = async () => {
    const { data } = await supabase.from('auction_products').select('*').order('sort_order');
    if (data) setAuctions(data as Auction[]);
  };

  const fetchBids = async () => {
    const { data } = await supabase.from('auction_bids').select('*').order('created_at', { ascending: false }).limit(500);
    if (data) setBids(data as Bid[]);
  };

  const toggleSystem = async (val: boolean) => {
    setSystemEnabled(val);
    const { data } = await supabase.from('site_settings').select('id').eq('key', 'auction_enabled').maybeSingle();
    if (data?.id) {
      await supabase.from('site_settings').update({ value: val as any }).eq('id', data.id);
    } else {
      await supabase.from('site_settings').insert({ key: 'auction_enabled', value: val as any });
    }
    toast.success(val ? 'Đã bật hệ thống đấu giá' : 'Đã tắt hệ thống đấu giá');
  };

  const startNew = () => {
    const inOneWeek = new Date(Date.now() + 7 * 86400000);
    setEditing({
      name: '', slug: '', image: '', description: '',
      list_price: 0, start_price: 0, min_increment: 10000, current_price: 0,
      start_at: new Date().toISOString(), end_at: inOneWeek.toISOString(),
      is_active: true, fake_viewers: 12, sort_order: 0,
    });
    setShowForm(true);
  };

  const startEdit = (a: Auction) => { setEditing({ ...a }); setShowForm(true); };

  const save = async () => {
    if (!editing) return;
    const slug = editing.slug || slugify(editing.name || '');
    if (!editing.name || !slug) { toast.error('Thiếu tên / slug'); return; }

    const payload: any = {
      name: editing.name,
      slug,
      image: editing.image || '',
      description: editing.description || '',
      list_price: Number(editing.list_price) || 0,
      start_price: Number(editing.start_price) || 0,
      min_increment: Number(editing.min_increment) || 10000,
      current_price: Number(editing.current_price) || Number(editing.start_price) || 0,
      start_at: editing.start_at,
      end_at: editing.end_at,
      is_active: !!editing.is_active,
      fake_viewers: Number(editing.fake_viewers) || 0,
      sort_order: Number(editing.sort_order) || 0,
    };

    if (editing.id) {
      const { error } = await supabase.from('auction_products').update(payload).eq('id', editing.id);
      if (error) return toast.error(error.message);
    } else {
      const { error } = await supabase.from('auction_products').insert(payload);
      if (error) return toast.error(error.message);
    }
    toast.success('Đã lưu');
    setShowForm(false); setEditing(null);
    fetchAuctions();
  };

  const remove = async (id: string) => {
    if (!confirm('Xóa phiên đấu giá này?')) return;
    await supabase.from('auction_products').delete().eq('id', id);
    toast.success('Đã xóa'); fetchAuctions();
  };

  const toggleActive = async (a: Auction) => {
    await supabase.from('auction_products').update({ is_active: !a.is_active }).eq('id', a.id);
    fetchAuctions();
  };

  const removeBid = async (bidId: string) => {
    if (!confirm('Xóa khách này khỏi danh sách trả giá?')) return;
    const { error } = await supabase.from('auction_bids').delete().eq('id', bidId);
    if (error) return toast.error(error.message);
    toast.success('Đã xóa');
    fetchBids();
  };

  return (
    <div className="space-y-6">
      <div className="bg-card border border-border rounded-xl p-4 flex items-center justify-between">
        <div>
          <h2 className="font-black text-lg text-foreground">Hệ thống đấu giá</h2>
          <p className="text-xs text-muted-foreground mt-1">Bật/tắt toàn bộ tính năng đấu giá trên website.</p>
        </div>
        <div className="flex items-center gap-2">
          <Power className={`h-4 w-4 ${systemEnabled ? 'text-primary' : 'text-muted-foreground'}`} />
          <Switch checked={systemEnabled} onCheckedChange={toggleSystem} />
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-foreground">Sản phẩm đấu giá ({auctions.length})</h3>
          <button onClick={startNew} className="flex items-center gap-1 bg-primary text-primary-foreground text-sm px-3 py-2 rounded-lg hover:bg-primary/90">
            <Plus className="h-4 w-4" /> Thêm phiên đấu giá
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          {auctions.map((a) => {
            const auctionBids = bids.filter((b) => b.auction_id === a.id);
            return (
              <div key={a.id} className="border border-border rounded-lg p-3 bg-background">
                <div className="flex gap-3">
                  {a.image && <img src={a.image} alt="" className="w-20 h-20 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{a.name}</p>
                    <p className="text-xs text-muted-foreground">Khởi điểm: {formatPrice(a.start_price)} • Cao nhất: <span className="text-coral font-bold">{formatPrice(a.current_price)}</span></p>
                    <p className="text-[11px] text-muted-foreground">Kết thúc: {new Date(a.end_at).toLocaleString('vi-VN')}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <button onClick={() => toggleActive(a)} className={`text-[10px] px-2 py-0.5 rounded-full ${a.is_active ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {a.is_active ? 'Đang chạy' : 'Tạm dừng'}
                      </button>
                      <button onClick={() => setShowBidsFor(showBidsFor === a.id ? null : a.id)} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-foreground flex items-center gap-1">
                        <Users className="h-3 w-3" /> {auctionBids.length} lượt
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <button onClick={() => startEdit(a)} className="p-1.5 hover:bg-muted rounded"><Edit className="h-4 w-4 text-primary" /></button>
                    <button onClick={() => remove(a.id)} className="p-1.5 hover:bg-muted rounded"><Trash2 className="h-4 w-4 text-destructive" /></button>
                  </div>
                </div>

                {showBidsFor === a.id && (
                  <div className="mt-3 border-t border-border pt-3 max-h-60 overflow-y-auto">
                    {auctionBids.length === 0 ? (
                      <p className="text-xs text-muted-foreground italic">Chưa có lượt trả giá nào.</p>
                    ) : (
                      <table className="w-full text-xs">
                        <thead className="text-muted-foreground">
                          <tr className="text-left">
                            <th className="py-1">Tên</th><th>SĐT</th><th>Giá</th><th>Lúc</th>
                          </tr>
                        </thead>
                        <tbody>
                          {auctionBids.map((b) => (
                            <tr key={b.id} className="border-t border-border">
                              <td className="py-1 font-medium">{b.customer_name}</td>
                              <td><a href={`tel:${b.customer_phone}`} className="text-primary">{b.customer_phone}</a></td>
                              <td className="font-bold text-coral">{formatPrice(b.bid_amount)}</td>
                              <td className="text-muted-foreground">{new Date(b.created_at).toLocaleString('vi-VN')}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}
              </div>
            );
          })}
          {auctions.length === 0 && (
            <p className="text-sm text-muted-foreground italic col-span-2 text-center py-6">Chưa có phiên đấu giá nào.</p>
          )}
        </div>
      </div>

      {/* Form */}
      {showForm && editing && (
        <div className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-3" onClick={() => setShowForm(false)}>
          <div className="bg-card rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-lg">{editing.id ? 'Sửa phiên đấu giá' : 'Thêm phiên đấu giá'}</h3>
              <button onClick={() => setShowForm(false)} className="p-1 hover:bg-muted rounded"><X className="h-5 w-5" /></button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold">Tên sản phẩm *</label>
                <input className="w-full mt-1 px-3 py-2 border border-border rounded-lg" value={editing.name || ''}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value, slug: editing.slug || slugify(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold">Slug</label>
                <input className="w-full mt-1 px-3 py-2 border border-border rounded-lg" value={editing.slug || ''}
                  onChange={(e) => setEditing({ ...editing, slug: slugify(e.target.value) })} />
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold">URL ảnh</label>
                <input className="w-full mt-1 px-3 py-2 border border-border rounded-lg" placeholder="https://..." value={editing.image || ''}
                  onChange={(e) => setEditing({ ...editing, image: e.target.value })} />
                {editing.image && <img src={editing.image} alt="" className="mt-2 h-24 rounded object-cover" />}
              </div>
              <div className="sm:col-span-2">
                <label className="text-xs font-bold">Mô tả ngắn</label>
                <textarea className="w-full mt-1 px-3 py-2 border border-border rounded-lg" rows={2} value={editing.description || ''}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>

              <div>
                <label className="text-xs font-bold">Giá niêm yết (đ)</label>
                <input type="number" className="w-full mt-1 px-3 py-2 border border-border rounded-lg" value={editing.list_price || 0}
                  onChange={(e) => setEditing({ ...editing, list_price: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-bold">Giá khởi điểm (đ)</label>
                <input type="number" className="w-full mt-1 px-3 py-2 border border-border rounded-lg" value={editing.start_price || 0}
                  onChange={(e) => setEditing({ ...editing, start_price: Number(e.target.value), current_price: editing.current_price || Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-bold">Bước giá tối thiểu (đ)</label>
                <input type="number" className="w-full mt-1 px-3 py-2 border border-border rounded-lg" value={editing.min_increment || 10000}
                  onChange={(e) => setEditing({ ...editing, min_increment: Number(e.target.value) })} />
              </div>
              <div>
                <label className="text-xs font-bold">Số người xem ảo</label>
                <input type="number" className="w-full mt-1 px-3 py-2 border border-border rounded-lg" value={editing.fake_viewers || 0}
                  onChange={(e) => setEditing({ ...editing, fake_viewers: Number(e.target.value) })} />
              </div>

              <div>
                <label className="text-xs font-bold">Bắt đầu</label>
                <input type="datetime-local" className="w-full mt-1 px-3 py-2 border border-border rounded-lg" value={toLocalDT(editing.start_at || '')}
                  onChange={(e) => setEditing({ ...editing, start_at: new Date(e.target.value).toISOString() })} />
              </div>
              <div>
                <label className="text-xs font-bold">Kết thúc</label>
                <input type="datetime-local" className="w-full mt-1 px-3 py-2 border border-border rounded-lg" value={toLocalDT(editing.end_at || '')}
                  onChange={(e) => setEditing({ ...editing, end_at: new Date(e.target.value).toISOString() })} />
              </div>

              <div className="sm:col-span-2 flex items-center gap-2">
                <Switch checked={!!editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} />
                <span className="text-sm">Bật phiên này</span>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button onClick={save} className="flex-1 bg-primary text-primary-foreground font-bold py-2.5 rounded-lg hover:bg-primary/90 flex items-center justify-center gap-1">
                <Save className="h-4 w-4" /> Lưu
              </button>
              <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-border rounded-lg">Hủy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
