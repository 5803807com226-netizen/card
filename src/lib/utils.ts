import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number | null | undefined, currency = 'USD'): string {
  if (value === null || value === undefined) return '-';
  if (currency === 'THB') {
    return `฿${value.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPriceUSD(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatPriceTHB(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return `฿${value.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export function formatPercent(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
}

export function formatProfit(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  const sign = value >= 0 ? '+' : '';
  return `${sign}$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = new Date(date);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'เมื่อกี้';
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days < 7) return `${days} วันที่แล้ว`;
  return formatDate(date);
}

export function gameTypeLabel(game: string): string {
  const labels: Record<string, string> = {
    pokemon: 'Pokémon',
    onepiece: 'One Piece',
    dragonball: 'Dragon Ball',
  };
  return labels[game] || game;
}

export function gameTypeColor(game: string): string {
  const colors: Record<string, string> = {
    pokemon: 'text-yellow-400',
    onepiece: 'text-red-400',
    dragonball: 'text-orange-400',
  };
  return colors[game] || 'text-gray-400';
}

export function priorityColor(tier: string): string {
  const colors: Record<string, string> = {
    S: 'text-yellow-400 bg-yellow-400/10',
    A: 'text-orange-400 bg-orange-400/10',
    B: 'text-blue-400 bg-blue-400/10',
    C: 'text-gray-400 bg-gray-400/10',
  };
  return colors[tier] || 'text-gray-400 bg-gray-400/10';
}

export function statusLabel(status: string): string {
  const labels: Record<string, string> = {
    tracking: 'กำลังติดตาม',
    holding: 'ถือครอง',
    sold: 'ขายแล้ว',
  };
  return labels[status] || status;
}

export function statusColor(status: string): string {
  const colors: Record<string, string> = {
    tracking: 'text-blue-400 bg-blue-400/10',
    holding: 'text-green-400 bg-green-400/10',
    sold: 'text-gray-400 bg-gray-400/10',
  };
  return colors[status] || 'text-gray-400 bg-gray-400/10';
}

export function isToday(date: string | Date | null | undefined): boolean {
  if (!date) return false;
  const d = new Date(date);
  const today = new Date();
  return (
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear()
  );
}

export function calculateProfit(
  japanPrice: number | null | undefined,
  thaiPrice: number | null | undefined
): { profit: number | null; profitPercent: number | null } {
  if (!japanPrice || !thaiPrice) return { profit: null, profitPercent: null };
  const profit = japanPrice - thaiPrice;
  const profitPercent = ((japanPrice - thaiPrice) / thaiPrice) * 100;
  return { profit, profitPercent };
}
