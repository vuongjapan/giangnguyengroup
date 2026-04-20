export function formatCountdown(ms: number): string {
  if (ms <= 0) return '00:00:00';
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  if (days > 0) return `${days}n ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

export function maskName(name: string): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'Khách ẩn danh';
  const parts = trimmed.split(/\s+/);
  const first = parts[0];
  const last = parts[parts.length - 1];
  const masked = first.length > 1 ? first[0] + '*'.repeat(Math.max(1, first.length - 1)) : first;
  if (parts.length === 1) return masked;
  return `${masked} ${last[0]}.`;
}

export function maskPhone(phone: string): string {
  const digits = (phone || '').replace(/\D/g, '');
  if (digits.length < 4) return '***';
  return digits.slice(0, 3) + '****' + digits.slice(-3);
}
