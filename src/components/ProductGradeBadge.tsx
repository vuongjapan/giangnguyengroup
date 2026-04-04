import { cn } from '@/lib/utils';

interface Props {
  grade: string;
  size?: 'sm' | 'md';
  className?: string;
}

const GRADE_CONFIG: Record<string, { emoji: string; label: string; className: string }> = {
  'Cao cấp': {
    emoji: '💎',
    label: 'Diamond',
    className: 'bg-gradient-to-r from-blue-500 to-purple-500 text-primary-foreground shadow-md',
  },
  'Loại 1': {
    emoji: '🥇',
    label: 'Gold',
    className: 'bg-gradient-to-r from-amber-400 to-yellow-500 text-accent-foreground shadow-md',
  },
  'Loại 2': {
    emoji: '⭐',
    label: 'Standard',
    className: 'bg-gradient-to-r from-slate-300 to-slate-400 text-foreground shadow-sm',
  },
  'Đặc sản': {
    emoji: '🏆',
    label: 'Premium',
    className: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-primary-foreground shadow-md',
  },
};

export default function ProductGradeBadge({ grade, size = 'sm', className }: Props) {
  const config = GRADE_CONFIG[grade] || GRADE_CONFIG['Loại 1'];

  return (
    <span className={cn(
      'inline-flex items-center gap-1 font-bold rounded-full',
      size === 'sm' ? 'text-[9px] px-2 py-0.5' : 'text-xs px-3 py-1',
      config.className,
      className,
    )}>
      {config.emoji} {config.label}
    </span>
  );
}
