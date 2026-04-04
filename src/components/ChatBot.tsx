import { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

interface Message {
  role: 'bot' | 'user';
  text: string;
}

const INITIAL: Message[] = [
  { role: 'bot', text: 'Xin chào 👋 Giang Nguyen Seafood chuyên hải sản khô sạch Sầm Sơn.\nBạn muốn xem giá mực khô, tôm khô hay cá khô hôm nay ạ?' },
];

const QUICK_REPLIES = ['Xem giá mực khô', 'Combo quà biếu', 'Tư vấn mua hàng'];

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(INITIAL);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setTimeout(() => {
      let reply = 'Cảm ơn bạn! Để em tư vấn thêm, bạn cho em xin tên và số điện thoại nhé ạ? 😊';
      const lower = userMsg.toLowerCase();
      if (lower.includes('mực khô') || lower.includes('giá mực')) {
        reply = '🦑 Mực khô Sầm Sơn:\n• Loại 1: 1.450.000₫/kg\n• Loại 2: 1.250.000₫/kg\n• Mực 1 nắng: 450.000₫/kg\n• Mực trứng: 500.000₫/kg\n\nAnh/chị muốn đặt loại nào ạ?';
      } else if (lower.includes('combo') || lower.includes('quà')) {
        reply = '🎁 Combo quà biếu HOT:\n• Combo VIP: Mực khô L1 + Mực trứng\n• Combo gia đình: Cá thu + Nem chua\n• Combo du lịch: 3 loại hải sản mini\n\nBạn muốn xem chi tiết combo nào ạ?';
      } else if (lower.includes('ship') || lower.includes('giao')) {
        reply = '🚚 Ship toàn quốc!\n• HN & HCM: 1-2 ngày\n• Tỉnh khác: 2-3 ngày\n• FREE ship đơn từ 500k\n\nAnh/chị ở đâu để em báo phí ship chính xác ạ?';
      }
      setMessages(prev => [...prev, { role: 'bot', text: reply }]);
    }, 800);
  };

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-4 z-40 ocean-gradient text-primary-foreground rounded-full p-4 shadow-lg hover:opacity-90 transition-all active:scale-95"
          aria-label="Mở chat tư vấn"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
      )}

      {open && (
        <div className="fixed bottom-24 right-4 z-40 w-80 md:w-96 bg-card rounded-2xl shadow-2xl border border-border flex flex-col max-h-[500px] animate-fade-in">
          <div className="ocean-gradient rounded-t-2xl p-3 flex items-center justify-between">
            <div>
              <p className="font-bold text-primary-foreground text-sm">Giang Nguyen Seafood</p>
              <p className="text-primary-foreground/80 text-xs">🟢 Online - Trả lời ngay</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-primary-foreground/80 hover:text-primary-foreground">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[200px]">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-line ${
                  m.role === 'user' ? 'ocean-gradient text-primary-foreground' : 'bg-muted text-foreground'
                }`}>
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          <div className="px-3 pb-2 flex flex-wrap gap-1">
            {QUICK_REPLIES.map(qr => (
              <button key={qr} onClick={() => { setInput(qr); }} className="text-xs bg-ocean-light text-primary font-medium px-2.5 py-1 rounded-full hover:bg-primary hover:text-primary-foreground transition-colors">
                {qr}
              </button>
            ))}
          </div>

          <div className="p-3 pt-0 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Nhắn tin..."
              className="flex-1 border border-border rounded-full px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button onClick={sendMessage} className="ocean-gradient text-primary-foreground p-2 rounded-full hover:opacity-90">
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
