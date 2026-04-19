import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, Plus, Edit, Trash2, ExternalLink, Save, Sparkles, ListChecks } from 'lucide-react';

interface Landing {
  id: string;
  slug: string;
  keyword: string;
  title: string;
  meta_description: string;
  h1: string;
  intro: string;
  content_html: string;
  faq: any[];
  status: string;
  views: number;
  created_at: string;
}

const PRESET_KEYWORDS = `mực khô ngon mua ở đâu
tôm khô cao cấp Sầm Sơn
cá thu một nắng Thanh Hóa
combo quà biếu Tết 1 triệu
đặc sản biển miền Trung gửi đi xa
mực khô loại 1 giá bao nhiêu
hải sản khô ăn liền
quà biếu sếp dịp Tết
mua hải sản khô online uy tín
đồ nhậu cuối tuần ngon`;

export default function SeoLandingManager() {
  const [pages, setPages] = useState<Landing[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [batchMode, setBatchMode] = useState(false);
  const [batchKeywords, setBatchKeywords] = useState(PRESET_KEYWORDS);
  const [batchProgress, setBatchProgress] = useState<string>('');
  const [editing, setEditing] = useState<Landing | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from('seo_landing_pages').select('*').order('created_at', { ascending: false });
    setPages((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const generate = async () => {
    if (!keyword.trim()) { toast.error('Nhập từ khóa'); return; }
    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('seo-landing-batch', {
        body: { keywords: [keyword.trim()] },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const r = data.results?.[0];
      if (r?.status === 'created') toast.success(`Đã tạo: /lp/${r.slug}`);
      else if (r?.status === 'exists') toast.info(`Đã tồn tại: /lp/${r.slug}`);
      else toast.error(r?.error || 'Không tạo được');
      setKeyword('');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi tạo landing');
    } finally {
      setGenerating(false);
    }
  };

  const generateBatch = async () => {
    const kws = batchKeywords.split('\n').map(s => s.trim()).filter(Boolean);
    if (kws.length === 0) { toast.error('Nhập danh sách keyword'); return; }
    if (kws.length > 15) { toast.error('Tối đa 15 keyword/lượt'); return; }
    if (!confirm(`Tạo ${kws.length} landing page? AI sẽ chạy tuần tự, mất ~${kws.length * 5}s.`)) return;

    setGenerating(true);
    setBatchProgress(`Đang tạo ${kws.length} trang...`);
    try {
      const { data, error } = await supabase.functions.invoke('seo-landing-batch', {
        body: { keywords: kws },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const created = (data.results || []).filter((r: any) => r.status === 'created').length;
      const exists = (data.results || []).filter((r: any) => r.status === 'exists').length;
      const errors = (data.results || []).filter((r: any) => r.status === 'error').length;
      toast.success(`Hoàn tất: ${created} mới, ${exists} đã có, ${errors} lỗi`);
      setBatchProgress('');
      load();
    } catch (e: any) {
      toast.error(e.message || 'Lỗi batch');
      setBatchProgress('');
    } finally {
      setGenerating(false);
    }
  };

  const save = async () => {
    if (!editing) return;
    const { error } = await supabase.from('seo_landing_pages').update({
      title: editing.title,
      meta_description: editing.meta_description,
      h1: editing.h1,
      intro: editing.intro,
      content_html: editing.content_html,
      status: editing.status,
    }).eq('id', editing.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Đã lưu');
    setEditing(null);
    load();
  };

  const togglePublish = async (p: Landing) => {
    const newStatus = p.status === 'published' ? 'draft' : 'published';
    await supabase.from('seo_landing_pages').update({ status: newStatus }).eq('id', p.id);
    toast.success(newStatus === 'published' ? 'Đã publish' : 'Đã unpublish');
    load();
  };

  const remove = async (p: Landing) => {
    if (!confirm(`Xóa "${p.title}"?`)) return;
    await supabase.from('seo_landing_pages').delete().eq('id', p.id);
    load();
  };

  if (editing) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Chỉnh sửa: {editing.slug}</h3>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setEditing(null)}>Hủy</Button>
            <Button onClick={save}><Save className="h-4 w-4 mr-2" />Lưu</Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium">Title</label>
          <Input value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium">Meta description</label>
          <Textarea value={editing.meta_description} onChange={e => setEditing({ ...editing, meta_description: e.target.value })} rows={2} />
        </div>
        <div>
          <label className="text-sm font-medium">H1</label>
          <Input value={editing.h1} onChange={e => setEditing({ ...editing, h1: e.target.value })} />
        </div>
        <div>
          <label className="text-sm font-medium">Intro</label>
          <Textarea value={editing.intro} onChange={e => setEditing({ ...editing, intro: e.target.value })} rows={3} />
        </div>
        <div>
          <label className="text-sm font-medium">Content HTML</label>
          <Textarea value={editing.content_html} onChange={e => setEditing({ ...editing, content_html: e.target.value })} rows={20} className="font-mono text-xs" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-primary/5 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /> Tạo landing page (AI)</h3>
          <div className="flex gap-1 bg-muted rounded-full p-0.5">
            <button onClick={() => setBatchMode(false)} className={`px-3 py-1 rounded-full text-xs font-semibold ${!batchMode ? 'bg-card shadow' : 'text-muted-foreground'}`}>1 trang</button>
            <button onClick={() => setBatchMode(true)} className={`px-3 py-1 rounded-full text-xs font-semibold ${batchMode ? 'bg-card shadow' : 'text-muted-foreground'}`}>Batch (10-15)</button>
          </div>
        </div>

        {!batchMode ? (
          <div className="flex gap-2">
            <Input
              placeholder='VD: "mực khô ngon mua ở đâu"'
              value={keyword}
              onChange={e => setKeyword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && generate()}
              disabled={generating}
            />
            <Button onClick={generate} disabled={generating}>
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
              <span className="ml-2">{generating ? 'Đang tạo...' : 'Tạo'}</span>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">Mỗi từ khóa 1 dòng (tối đa 15). Bấm "Tạo batch" để AI viết hàng loạt và lưu vĩnh viễn.</p>
            <Textarea
              rows={10}
              value={batchKeywords}
              onChange={e => setBatchKeywords(e.target.value)}
              disabled={generating}
              className="font-mono text-xs"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">{batchKeywords.split('\n').filter(s => s.trim()).length} keywords</span>
              <Button onClick={generateBatch} disabled={generating}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ListChecks className="h-4 w-4 mr-2" />}
                {generating ? batchProgress || 'Đang tạo...' : 'Tạo batch'}
              </Button>
            </div>
          </div>
        )}
      </div>

      {loading ? <Loader2 className="animate-spin" /> : (
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3">Từ khóa / Slug</th>
                <th className="text-left p-3">Title</th>
                <th className="text-left p-3">Status</th>
                <th className="text-right p-3">Views</th>
                <th className="text-right p-3">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {pages.map(p => (
                <tr key={p.id} className="border-t">
                  <td className="p-3">
                    <div className="font-medium">{p.keyword}</div>
                    <div className="text-xs text-muted-foreground">/lp/{p.slug}</div>
                  </td>
                  <td className="p-3 max-w-xs truncate">{p.title}</td>
                  <td className="p-3">
                    <span className={`px-2 py-1 rounded text-xs ${p.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="p-3 text-right">{p.views}</td>
                  <td className="p-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="ghost" onClick={() => window.open(`/lp/${p.slug}`, '_blank')}><ExternalLink className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditing(p)}><Edit className="h-4 w-4" /></Button>
                      <Button size="sm" variant={p.status === 'published' ? 'secondary' : 'default'} onClick={() => togglePublish(p)}>
                        {p.status === 'published' ? 'Unpublish' : 'Publish'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(p)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Chưa có landing page</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
