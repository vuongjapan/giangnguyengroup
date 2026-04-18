import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Phone, Mail, MapPin, Trash2, Flame, ThumbsUp, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';

interface WholesaleLead {
  id: string;
  shop_name: string;
  contact_name: string;
  phone: string;
  email: string;
  region: string;
  products_interest: string;
  expected_volume: string;
  note: string;
  lead_score: number;
  status: string;
  source: string;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'Mới', color: 'bg-blue-100 text-blue-800' },
  { value: 'warm', label: 'Tiềm năng', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'hot', label: 'Hot', color: 'bg-red-100 text-red-800' },
  { value: 'contacted', label: 'Đã gọi', color: 'bg-purple-100 text-purple-800' },
  { value: 'won', label: 'Chốt deal', color: 'bg-green-100 text-green-800' },
  { value: 'lost', label: 'Không quan tâm', color: 'bg-gray-100 text-gray-800' },
];

export default function WholesaleLeadsManager() {
  const [leads, setLeads] = useState<WholesaleLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('wholesale_leads')
      .select('*')
      .order('lead_score', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(200);
    if (error) toast.error('Lỗi tải leads: ' + error.message);
    else setLeads((data || []) as WholesaleLead[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('wholesale_leads').update({ status }).eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Cập nhật'); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm('Xoá lead này?')) return;
    const { error } = await supabase.from('wholesale_leads').delete().eq('id', id);
    if (error) toast.error(error.message);
    else { toast.success('Đã xoá'); load(); }
  };

  const filtered = filter === 'all' ? leads : leads.filter((l) => l.status === filter);
  const stats = {
    total: leads.length,
    hot: leads.filter((l) => l.lead_score >= 60).length,
    warm: leads.filter((l) => l.lead_score >= 30 && l.lead_score < 60).length,
    won: leads.filter((l) => l.status === 'won').length,
  };

  return (
    <div className="space-y-4">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Tổng leads</div>
          <div className="text-2xl font-bold">{stats.total}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><Flame className="h-3 w-3 text-coral" /> Hot</div>
          <div className="text-2xl font-bold text-coral">{stats.hot}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground flex items-center gap-1"><ThumbsUp className="h-3 w-3 text-accent" /> Tiềm năng</div>
          <div className="text-2xl font-bold text-accent">{stats.warm}</div>
        </div>
        <div className="bg-card border border-border rounded-lg p-3">
          <div className="text-xs text-muted-foreground">Chốt deal</div>
          <div className="text-2xl font-bold text-success">{stats.won}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setFilter('all')} className={`px-3 py-1 text-xs rounded-full ${filter === 'all' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>Tất cả</button>
        {STATUS_OPTIONS.map((s) => (
          <button key={s.value} onClick={() => setFilter(s.value)} className={`px-3 py-1 text-xs rounded-full ${filter === s.value ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>{s.label}</button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Đang tải...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">Chưa có lead nào</p>
      ) : (
        <div className="space-y-2">
          {filtered.map((lead) => {
            const statusOpt = STATUS_OPTIONS.find((s) => s.value === lead.status) || STATUS_OPTIONS[0];
            return (
              <div key={lead.id} className="bg-card border border-border rounded-lg p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold truncate">{lead.shop_name}</h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        lead.lead_score >= 60 ? 'bg-coral text-primary-foreground' :
                        lead.lead_score >= 30 ? 'bg-accent text-accent-foreground' : 'bg-muted text-foreground'
                      }`}>
                        {lead.lead_score}đ
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full ${statusOpt.color}`}>{statusOpt.label}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{lead.contact_name}</p>
                  </div>
                  <button onClick={() => remove(lead.id)} className="p-1.5 text-destructive hover:bg-destructive/10 rounded">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground mb-2">
                  <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 hover:text-primary">
                    <Phone className="h-3 w-3" /> {lead.phone}
                  </a>
                  {lead.email && (
                    <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 hover:text-primary truncate">
                      <Mail className="h-3 w-3" /> {lead.email}
                    </a>
                  )}
                  {lead.region && (
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-3 w-3" /> {lead.region}
                    </span>
                  )}
                </div>

                {(lead.products_interest || lead.expected_volume || lead.note) && (
                  <div className="bg-muted/50 rounded p-2 text-xs space-y-1 mb-2">
                    {lead.products_interest && <p><b>Quan tâm:</b> {lead.products_interest}</p>}
                    {lead.expected_volume && <p><b>SL/tháng:</b> {lead.expected_volume}</p>}
                    {lead.note && <p><b>Ghi chú:</b> {lead.note}</p>}
                  </div>
                )}

                <div className="flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" /> {new Date(lead.created_at).toLocaleString('vi-VN')}
                  </span>
                  <select
                    value={lead.status}
                    onChange={(e) => updateStatus(lead.id, e.target.value)}
                    className="text-xs border border-border rounded px-2 py-1 bg-background"
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </select>
                  <a
                    href={`https://zalo.me/${lead.phone.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    Zalo <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
