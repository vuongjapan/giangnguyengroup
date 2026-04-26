import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, Sparkles } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`;

const QUICK_REPLIES = [
  'Giá mực khô hôm nay',
  'Thời tiết Sầm Sơn',
  'Combo quà biếu',
  'Free ship không?',
];

// Persistent chat session id for this browser
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

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const { products } = useProducts();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: 'Xin chào 👋 Em là trợ lý AI của Giang Nguyên Group – chuyên hải sản khô Sầm Sơn.\nEm có thể tư vấn sản phẩm, kiểm tra thời tiết – giá vàng – tin tức hôm nay, gợi ý món ăn, du lịch Sầm Sơn… Anh/chị cần em giúp gì ạ? 🌊' },
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

  // Build product context for AI
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

    try {
      const systemContext = productContext ? `\n\nSẢN PHẨM HIỆN CÓ TRÊN WEBSITE:\n${productContext}` : '';
      
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
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => {
                const last = prev[prev.length - 1];
                if (last?.role === 'assistant' && prev.length > newMessages.length) {
                  return prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m));
                }
                return [...prev, { role: 'assistant', content: assistantSoFar }];
              });
            }
          } catch { textBuffer = line + '\n' + textBuffer; break; }
        }
      }

      // Final flush
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (raw.startsWith(':') || raw.trim() === '') continue;
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content as string | undefined;
            if (content) {
              assistantSoFar += content;
              setMessages(prev => prev.map((m, i) => (i === prev.length - 1 ? { ...m, content: assistantSoFar } : m)));
            }
          } catch { /* ignore */ }
        }
      }
    } catch {
      const lower = userText.toLowerCase();
      let reply = 'Cảm ơn bạn! Để em tư vấn thêm, bạn cho em xin tên và số điện thoại nhé ạ? 😊';
      if (lower.includes('mực khô') || lower.includes('giá mực')) {
        const mucProducts = products.filter(p => p.name.toLowerCase().includes('mực'));
        if (mucProducts.length > 0) {
          reply = '🦑 Mực khô Sầm Sơn:\n' + mucProducts.map(p => `• ${p.name}: ${p.price.toLocaleString('vi-VN')}₫/${p.unit}`).join('\n') + '\n\nAnh/chị muốn em giữ hàng cho mình không ạ?';
        }
      } else if (lower.includes('combo') || lower.includes('quà')) {
        reply = '🎁 Combo quà biếu HOT:\nVui lòng xem trang Combo để chọn gói phù hợp ạ!\n\nAnh/chị muốn em tư vấn thêm không ạ?';
      } else if (lower.includes('ship') || lower.includes('giao')) {
        reply = '🚚 Ship toàn quốc!\n• FREE ship đơn từ 500K\n• HN, HCM: 1-2 ngày\n\nAnh/chị ở đâu để em báo phí ship ạ?';
      }
      setMessages(prev => [...prev, { role: 'assistant', content: reply }]);
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
        <div className="fixed bottom-20 md:bottom-6 right-4 z-40 w-[calc(100vw-2rem)] max-w-96 bg-card rounded-2xl shadow-2xl border border-border flex flex-col max-h-[60vh] md:max-h-[500px] animate-fade-in">
          <div className="ocean-gradient rounded-t-2xl p-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-primary-foreground text-sm">Giang Nguyên Group</p>
              <p className="text-primary-foreground/80 text-xs">🟢 Online – Trả lời ngay</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${m.role === 'user' ? 'ocean-gradient text-primary-foreground' : 'bg-muted text-foreground'}`}>
                  {m.content}
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
