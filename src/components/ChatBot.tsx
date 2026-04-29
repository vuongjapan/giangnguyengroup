import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { findSmartReply, buildSystemPrompt } from '@/data/chatbot-config';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;
const STORAGE_KEY = 'gn_chat_history_v2';

const QUICK_REPLIES = [
  { label: '🦑 Xem sản phẩm', text: 'Cho em xem các sản phẩm hiện có' },
  { label: '💰 Giá hôm nay', text: 'Giá mực khô và combo hôm nay bao nhiêu?' },
  { label: '🚚 Phí vận chuyển', text: 'Phí ship như nào ạ?' },
];

const WELCOME: Message = {
  role: 'assistant',
  content: 'Chào anh/chị 👋 Em là trợ lý **Giang Nguyên Seafood** - hải sản khô Sầm Sơn. Em có thể giúp gì cho anh/chị ạ? 😊',
};

function loadHistory(): Message[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* ignore */ }
  return [WELCOME];
}

function saveHistory(msgs: Message[]) {
  try { sessionStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch { /* ignore */ }
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(() => loadHistory());
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    saveHistory(messages);
  }, [messages]);

  const sendMessage = async (text?: string) => {
    const userText = (text ?? input).trim();
    if (!userText || isLoading) return;

    const userMsg: Message = { role: 'user', content: userText };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');

    // 🎯 SMART REPLY - không gọi API nếu khớp từ khóa
    const smart = findSmartReply(userText);
    if (smart) {
      setTimeout(() => {
        setMessages(prev => [...prev, { role: 'assistant', content: smart }]);
      }, 250);
      return;
    }

    setIsLoading(true);

    // 💸 TIẾT KIỆM: chỉ gửi 3 tin nhắn gần nhất + system prompt
    const recent = newMessages.slice(-3).map(m => ({ role: m.role, content: m.content }));

    try {
      const resp = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: recent,
          systemPrompt: buildSystemPrompt(),
        }),
      });

      if (resp.status === 429) throw new Error('Quá nhiều yêu cầu, anh/chị thử lại sau ít phút nhé!');
      if (resp.status === 402) throw new Error('Hệ thống AI tạm hết lượt, anh/chị gọi hotline 0833.552.286 ạ!');
      if (!resp.ok) throw new Error('Lỗi kết nối');

      const data = await resp.json();
      const reply: string = data.reply || 'Em chưa rõ ý mình. Anh/chị nói rõ thêm giúp em ạ.';
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : 'Em đang gặp sự cố';
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `${errMsg} 😔 Anh/chị gọi hotline **0833.552.286** giúp em nhé!`,
      }]);
    } finally {
      setIsLoading(false);
    }
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
                <MessageCircle className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="font-bold text-primary-foreground text-sm leading-tight">Trợ lý Giang Nguyên</p>
                <p className="text-primary-foreground/80 text-[10px]">🟢 Trực tuyến · Phản hồi nhanh</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground" aria-label="Đóng">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[88%] rounded-2xl px-3 py-2 text-sm ${m.role === 'user' ? 'ocean-gradient text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  {m.role === 'assistant' ? (
                    <div className="prose prose-sm max-w-none prose-p:my-1 prose-ul:my-1 prose-ol:my-1 prose-li:my-0 prose-strong:text-foreground prose-a:text-primary">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{m.content}</ReactMarkdown>
                    </div>
                  ) : (
                    <span className="whitespace-pre-line">{m.content}</span>
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-2xl px-3 py-2 flex items-center gap-1">
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK_REPLIES.map(qr => (
                <button
                  key={qr.label}
                  onClick={() => sendMessage(qr.text)}
                  className="text-xs bg-ocean-light text-primary font-medium px-2.5 py-1.5 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors"
                >
                  {qr.label}
                </button>
              ))}
            </div>
          )}

          <div className="p-3 pt-2 flex gap-2 border-t border-border/50">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Nhắn tin..."
              className="flex-1 border border-border rounded-full px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
              disabled={isLoading}
            />
            <button
              onClick={() => sendMessage()}
              disabled={isLoading || !input.trim()}
              className="ocean-gradient text-primary-foreground p-2 rounded-full hover:opacity-90 disabled:opacity-50"
              aria-label="Gửi"
            >
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
