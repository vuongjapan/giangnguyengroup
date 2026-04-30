import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Send, User as UserIcon, Search } from 'lucide-react';
import { toast } from 'sonner';

interface Member {
  id: string;
  name: string;
  email: string;
  phone: string;
}

interface ChatMsg {
  id: string;
  user_id: string;
  sender: 'customer' | 'admin';
  content: string;
  is_read: boolean;
  created_at: string;
}

export default function CustomerChatManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [unreadByUser, setUnreadByUser] = useState<Record<string, number>>({});
  const [selected, setSelected] = useState<Member | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [search, setSearch] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { fetchMembers(); fetchUnread(); }, []);

  useEffect(() => {
    const ch = supabase
      .channel('admin-customer-chat')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'customer_chat_messages' }, () => {
        fetchUnread();
        if (selected) fetchMessages(selected.id);
      })
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [selected]);

  useEffect(() => { if (selected) { fetchMessages(selected.id); markRead(selected.id); } }, [selected]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const fetchMembers = async () => {
    const { data } = await supabase.from('profiles').select('id,name,email,phone').order('updated_at', { ascending: false });
    if (data) setMembers(data as Member[]);
  };

  const fetchUnread = async () => {
    const { data } = await supabase
      .from('customer_chat_messages')
      .select('user_id')
      .eq('sender', 'customer')
      .eq('is_read', false);
    const counts: Record<string, number> = {};
    (data || []).forEach((m: any) => { counts[m.user_id] = (counts[m.user_id] || 0) + 1; });
    setUnreadByUser(counts);
  };

  const fetchMessages = async (userId: string) => {
    const { data } = await supabase
      .from('customer_chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at');
    if (data) setMessages(data as ChatMsg[]);
  };

  const markRead = async (userId: string) => {
    await supabase
      .from('customer_chat_messages')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('sender', 'customer')
      .eq('is_read', false);
    fetchUnread();
  };

  const send = async () => {
    if (!input.trim() || !selected || sending) return;
    setSending(true);
    const { error } = await supabase.from('customer_chat_messages').insert({
      user_id: selected.id,
      sender: 'admin',
      content: input.trim(),
      is_read: true,
    } as any);
    if (error) toast.error('Lỗi gửi: ' + error.message);
    else { setInput(''); fetchMessages(selected.id); }
    setSending(false);
  };

  const filtered = members.filter(m => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (m.name || '').toLowerCase().includes(s) || (m.email || '').toLowerCase().includes(s) || (m.phone || '').includes(s);
  });

  // Sort: unread first
  const sorted = [...filtered].sort((a, b) => (unreadByUser[b.id] || 0) - (unreadByUser[a.id] || 0));

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-[600px]">
      {/* Members list */}
      <div className="bg-card rounded-xl border border-border overflow-hidden flex flex-col">
        <div className="p-3 border-b border-border">
          <h3 className="font-bold text-sm flex items-center gap-2 mb-2"><MessageSquare className="h-4 w-4" /> Thành viên</h3>
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm tên / SĐT / email"
              className="w-full pl-7 pr-2 py-1.5 text-xs rounded-md border border-border bg-background" />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 && <p className="p-4 text-xs text-muted-foreground text-center">Chưa có thành viên</p>}
          {sorted.map(m => {
            const unread = unreadByUser[m.id] || 0;
            return (
              <button key={m.id} onClick={() => setSelected(m)}
                className={`w-full text-left px-3 py-2.5 border-b border-border hover:bg-muted/50 flex items-center gap-2 ${selected?.id === m.id ? 'bg-primary/10' : ''}`}>
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <UserIcon className="h-4 w-4 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold truncate">{m.name || m.email || 'Không tên'}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{m.email || m.phone}</p>
                </div>
                {unread > 0 && (
                  <span className="bg-coral text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                    {unread}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Chat window */}
      <div className="md:col-span-2 bg-card rounded-xl border border-border flex flex-col overflow-hidden">
        {!selected ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Chọn thành viên để xem tin nhắn
          </div>
        ) : (
          <>
            <div className="p-3 border-b border-border bg-muted/30">
              <p className="font-bold text-sm">{selected.name || selected.email}</p>
              <p className="text-[11px] text-muted-foreground">{selected.email} · {selected.phone}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-2">
              {messages.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Chưa có tin nhắn</p>}
              {messages.map(msg => (
                <div key={msg.id} className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${msg.sender === 'admin' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                    <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                    <p className={`text-[10px] mt-1 ${msg.sender === 'admin' ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                      {new Date(msg.created_at).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="p-3 border-t border-border flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
              <button onClick={send} disabled={!input.trim() || sending}
                className="px-4 py-2 ocean-gradient text-primary-foreground rounded-lg text-sm font-bold disabled:opacity-50 flex items-center gap-1">
                <Send className="h-4 w-4" /> Gửi
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
