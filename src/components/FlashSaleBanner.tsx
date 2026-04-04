import { useState, useEffect } from 'react';
import { Flame, Clock } from 'lucide-react';

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

function getEndOfDay(): Date {
  const now = new Date();
  const end = new Date(now);
  end.setHours(23, 59, 59, 999);
  return end;
}

function getTimeLeft(endTime: Date): TimeLeft {
  const diff = Math.max(0, endTime.getTime() - Date.now());
  return {
    hours: Math.floor(diff / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function FlashSaleBanner() {
  const [endTime] = useState(getEndOfDay);
  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft(endTime));
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTimeLeft(getTimeLeft(endTime)), 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (dismissed) return null;

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className="bg-destructive text-destructive-foreground relative overflow-hidden">
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-3 text-xs md:text-sm">
        <Flame className="h-4 w-4 animate-pulse-soft flex-shrink-0" />
        <span className="font-bold">FLASH SALE HÔM NAY</span>
        <span className="hidden sm:inline">–</span>
        <span className="hidden sm:inline">Giảm đến 20%</span>
        <div className="flex items-center gap-1 font-mono font-bold">
          <Clock className="h-3.5 w-3.5 mr-0.5" />
          <span className="bg-black/20 px-1.5 py-0.5 rounded">{pad(timeLeft.hours)}</span>:
          <span className="bg-black/20 px-1.5 py-0.5 rounded">{pad(timeLeft.minutes)}</span>:
          <span className="bg-black/20 px-1.5 py-0.5 rounded">{pad(timeLeft.seconds)}</span>
        </div>
        <button onClick={() => setDismissed(true)} className="absolute right-2 top-1/2 -translate-y-1/2 text-destructive-foreground/70 hover:text-destructive-foreground text-lg leading-none">
          ×
        </button>
      </div>
    </div>
  );
}
