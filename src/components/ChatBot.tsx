import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles, ExternalLink, Clock } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';

interface Source {
  title: string;
  url: string;
  fetched_at: string;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sources?: Source[];
  generated_at?: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const QUICK_REPLIES = [
  'Tư vấn mực khô loại 1',
  'Combo quà biếu Tết',
  'Thời tiết Sầm Sơn hôm nay',
  'Chốt đơn 1kg mực + 1kg cá chỉ vàng',
];

function getSessionId(): string {
  try {
    let id = localStorage.getItem('gn_chat_session');
    if (!id) {
      id = (crypto.randomUUID?.() || `s_${Date.now()}_${Math.random().toString(36).slice(2)}`);
      localStorage.setItem('gn_chat_session', id);
    }
    return id;
  } catch {
    return `s_${Date.now()}`;
  }
}

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('vi-VN', {
      hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric',
      timeZone: 'Asia/Ho_Chi_Minh',
    });
  } catch { return iso; }
}

function getDomain(url: string): string {
  try { return new URL(url).hostname.replace(/^www\./, ''); } catch { return url; }
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const { products } = useProducts();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Chào anh/chị 👋 Em là **trợ lý sale** của Giang Nguyên Group – hải sản khô Sầm Sơn.\n\nEm có thể tư vấn sản phẩm, **chốt đơn và lên hoá đơn ngay tại đây**. Anh/chị cần gì em hỗ trợ ạ?',
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const sessionIdRef = useRef<string>(getSessionId());

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const productContext = products.map(p =>
    `- ${p.name}: ${p.price.toLocaleString('vi-VN')}₫/${p.unit} (${p.category}, ${p.grade})`
  ).join('\n');

  const sendMessage = async (text?: string) => {
    const userText = (text || input).trim();
    if (!userText || isLoading) return;

    const userMsg: Message = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    let assistantSoFar = '';
    let pendingMeta: { sources?: Source[]; generated_at?: string } = {};

    try {
      const systemContext = productContext ? `\n\nDANH MỤC SẢN PHẨM HIỆN CÓ (dùng để chốt đơn — lấy đúng tên & giá):\n${productContext}` : '';

      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          productContext: systemContext,
          sessionId: sessionIdRef.current,
          userId: user?.id || null,
        }),
      });

      if (!resp.ok || !resp.body) throw new Error('Failed to connect');

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let textBuffer = '';
      let streamDone = false;

      const upsert = () => {
        setMessages(prev => {
          const last = prev[prev.length - 1];
          const isAssistantStreaming = last?.role === 'assistant' && prev.length > newMessages.length;
          const updated: Message = {
            role: 'assistant',
            content: assistantSoFar,
            sources: pendingMeta.sources,
            generated_at: pendingMeta.generated_at,
          };
          if (isAssistantStreaming) {
            return prev.map((m, i) => (i === prev.length - 1 ? updated : m));
          }
          return [...prev, updated];
        });
      };

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') { streamDone = true; break; }
          try {
            const parsed = JSON.parse(jsonStr);
            if (parsed.meta) {
              pendingMeta = parsed.meta;
              upsert();
              continue;
            }
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              upsert();
            }
          } catch { textBuffer = line + '\n' + textBuffer; break; }
        }
      }
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Em đang gặp chút sự cố kết nối 😔. Anh/chị gọi hotline **0933.562.286** giúp em nhé!',
      }]);
    }

    setIsLoading(false);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 md:bottom-6 right-4 z-40 ocean-gradient text-primary-foreground rounded-full p-4 shadow-lg hover:opacity-90 transition-all active:scale-95 animate-bounce-soft"
          aria-label="Mở chat tư vấn"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-20 md:bottom-6 right-4 z-40 w-[calc(100vw-2rem)] max-w-96 bg-card rounded-2xl shadow-2xl border border-border flex flex-col max-h-[70vh] md:max-h-[560px] animate-fade-in">
          <div className="ocean-gradient rounded-t-2xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-accent/90 rounded-full p-1.5">
                <Sparkles className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="font-bold text-primary-foreground text-sm leading-tight">Trợ lý Sale Giang Nguyên</p>
                <p className="text-primary-foreground/80 text-[10px]">🟢 GPT-5.2 · Chốt đơn · Trích nguồn</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'ocean-gradient text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-headings:my-1 prose-strong:text-foreground prose-a:text-primary">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content || '…'}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-line">{m.content}</span>
                  )}

                  {m.role === 'assistant' && m.sources && m.sources.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-border/50 space-y-1">
                      <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">📎 Nguồn tham khảo</p>
                      {m.sources.map((s, idx) => (
                        <a key={idx} href={s.url} target="_blank" rel="noopener noreferrer"
                          className="flex items-start gap-1.5 text-[11px] hover:bg-background/50 rounded p-1 -mx-1 transition-colors group">
                          <span className="text-primary font-semibold">[{idx + 1}]</span>
                          <img
                            src={`https://www.google.com/s2/favicons?domain=${getDomain(s.url)}&sz=32`}
                            alt="" width={14} height={14}
                            className="mt-0.5 rounded flex-shrink-0"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                          <span className="flex-1 min-w-0">
                            <span className="block font-medium text-foreground line-clamp-1 group-hover:text-primary">{s.title || getDomain(s.url)}</span>
                            <span className="text-muted-foreground text-[10px]">{getDomain(s.url)}</span>
                          </span>
                          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0 mt-0.5" />
                        </a>
                      ))}
                    </div>
                  )}

                  {m.role === 'assistant' && m.generated_at && (
                    <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      <span>Truy vấn lúc {formatTime(m.generated_at)}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
            {isLoading && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-3 py-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="px-3 pb-2 flex flex-wrap gap-1">
            {messages.length <= 2 && QUICK_REPLIES.map(qr => (
              <button key={qr} onClick={() => sendMessage(qr)}
                className="text-xs bg-ocean-light text-primary font-medium px-2.5 py-1 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                {qr}
              </button>
            ))}
          </div>

          <div className="p-3 pt-0 flex gap-2">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Nhắn tin..." className="flex-1 border border-border rounded-full px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40" disabled={isLoading} />
            <button onClick={() => sendMessage()} disabled={isLoading}
              className="ocean-gradient text-primary-foreground p-2 rounded-full hover:opacity-90 disabled:opacity-50">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
