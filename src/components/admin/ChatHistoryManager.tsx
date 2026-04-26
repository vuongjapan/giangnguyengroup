import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, User, Bot, Trash2, RefreshCw, Search, ExternalLink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface Conversation {
  id: string;
  session_id: string;
  user_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  last_message_preview: string | null;
  message_count: number;
  user_agent: string | null;
  created_at: string;
  updated_at: string;
}

interface ChatMessage {
  id: string;
  role: string;
  content: string;
  sources: Array<{ title: string; url: string }> | null;
  created_at: string;
}

export default function ChatHistoryManager() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selected, setSelected] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('updated_at', { ascending: false })
      .limit(200);
    if (error) {
      toast({ title: 'Lỗi tải hội thoại', description: error.message, variant: 'destructive' });
    } else {
      setConversations((data as Conversation[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const loadMessages = async (conv: Conversation) => {
    setSelected(conv);
    setMessages([]);
    const { data, error } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conv.id)
      .order('created_at', { ascending: true });
    if (error) {
      toast({ title: 'Lỗi tải tin nhắn', description: error.message, variant: 'destructive' });
    } else {
      setMessages((data as ChatMessage[]) || []);
    }
  };

  const deleteConversation = async (id: string) => {
    if (!confirm('Xóa hội thoại này? Toàn bộ tin nhắn cũng sẽ bị xóa.')) return;
    const { error } = await supabase.from('chat_conversations').delete().eq('id', id);
    if (error) {
      toast({ title: 'Lỗi xóa', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Đã xóa hội thoại' });
      if (selected?.id === id) { setSelected(null); setMessages([]); }
      load();
    }
  };

  const filtered = conversations.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.last_message_preview?.toLowerCase().includes(q) ||
      c.customer_name?.toLowerCase().includes(q) ||
      c.customer_phone?.includes(q) ||
      c.session_id.toLowerCase().includes(q)
    );
  });

  const fmt = (d: string) => new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' });

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-4 border-b border-border flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-5 w-5 text-primary" />
          <h2 className="font-bold text-lg">Lịch sử trò chuyện AI</h2>
          <span className="text-xs text-muted-foreground">({conversations.length})</span>
        </div>
        <button onClick={load} disabled={loading}
          className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-muted hover:bg-muted/70 rounded-lg transition-colors">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} /> Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] flex-1 min-h-0">
        {/* Conversations list */}
        <div className="border-r border-border flex flex-col min-h-0">
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Tìm theo tên, SĐT, nội dung..."
                className="w-full pl-9 pr-3 py-2 text-sm bg-muted rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {filtered.length === 0 && (
              <p className="text-center text-sm text-muted-foreground p-6">Chưa có hội thoại nào.</p>
            )}
            {filtered.map(c => (
              <button
                key={c.id}
                onClick={() => loadMessages(c)}
                className={`w-full text-left p-3 border-b border-border/60 hover:bg-muted transition-colors ${
                  selected?.id === c.id ? 'bg-muted' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-bold text-primary truncate">
                    {c.customer_name || c.customer_phone || `Khách #${c.session_id.slice(-6)}`}
                  </span>
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">{fmt(c.updated_at)}</span>
                </div>
                <p className="text-xs text-foreground/80 line-clamp-2">{c.last_message_preview || '(chưa có tin nhắn)'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-muted-foreground">💬 {c.message_count} tin</span>
                  {c.user_id && <span className="text-[10px] text-success font-bold">✓ Đã ĐK</span>}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Messages panel */}
        <div className="flex flex-col min-h-0">
          {!selected ? (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
              Chọn một hội thoại để xem chi tiết
            </div>
          ) : (
            <>
              <div className="p-3 border-b border-border flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-bold text-sm truncate">
                    {selected.customer_name || `Khách #${selected.session_id.slice(-8)}`}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {selected.customer_phone || selected.user_agent?.slice(0, 60) || 'Không rõ thiết bị'}
                  </p>
                </div>
                <button onClick={() => deleteConversation(selected.id)}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-destructive hover:bg-destructive/10 rounded-lg transition-colors">
                  <Trash2 className="h-3.5 w-3.5" /> Xóa
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/30">
                {messages.map(m => (
                  <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    {m.role !== 'user' && (
                      <div className="bg-primary/10 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                    )}
                    <div className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                      m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-card border border-border'
                    }`}>
                      <div>{m.content}</div>
                      {m.sources && m.sources.length > 0 && (
                        <div className="mt-2 pt-2 border-t border-border/40 space-y-1">
                          {m.sources.slice(0, 3).map((s, i) => (
                            <a key={i} href={s.url} target="_blank" rel="noopener noreferrer"
                              className="text-[10px] text-accent-foreground/70 hover:underline flex items-center gap-1">
                              <ExternalLink className="h-2.5 w-2.5" />{s.title?.slice(0, 60)}
                            </a>
                          ))}
                        </div>
                      )}
                      <p className={`text-[10px] mt-1 ${m.role === 'user' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                        {fmt(m.created_at)}
                      </p>
                    </div>
                    {m.role === 'user' && (
                      <div className="bg-accent/30 rounded-full h-7 w-7 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-accent-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground">Chưa có tin nhắn</p>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
