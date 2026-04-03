import { Phone } from 'lucide-react';

export default function FloatingButtons() {
  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col gap-2">
      <a href="tel:0123456789" className="bg-green-500 text-primary-foreground p-3 rounded-full shadow-lg hover:scale-110 transition-transform" aria-label="Gọi điện">
        <Phone className="h-5 w-5" />
      </a>
      <a href="https://zalo.me/0123456789" target="_blank" rel="noopener noreferrer" className="bg-blue-500 text-primary-foreground p-3 rounded-full shadow-lg hover:scale-110 transition-transform text-xs font-bold flex items-center justify-center w-11 h-11" aria-label="Zalo">
        Zalo
      </a>
      <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-blue-600 text-primary-foreground p-3 rounded-full shadow-lg hover:scale-110 transition-transform text-xs font-bold flex items-center justify-center w-11 h-11" aria-label="Facebook">
        FB
      </a>
    </div>
  );
}
