'use client';

import { TrendingUp, TrendingDown, RefreshCw, Layers, Activity } from 'lucide-react';
import { formatProfit, formatPercent } from '@/lib/utils';
import { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const items = [
    {
      label: 'การ์ดทั้งหมด',
      value: loading ? '-' : stats.totalCards.toString(),
      icon: Layers,
      color: 'text-primary',
      bg: 'bg-primary/10',
      sub: 'รายการที่กำลังติดตาม',
    },
    {
      label: 'กำไรรวม',
      value: loading ? '-' : formatProfit(stats.totalProfit),
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
      sub: 'จากการ์ดที่มีกำไร',
    },
    {
      label: 'ขาดทุนรวม',
      value: loading ? '-' : formatProfit(stats.totalLoss),
      icon: TrendingDown,
      color: 'text-danger',
      bg: 'bg-danger/10',
      sub: 'จากการ์ดที่ขาดทุน',
    },
    {
      label: 'อัปเดตวันนี้',
      value: loading ? '-' : stats.updatedToday.toString(),
      icon: RefreshCw,
      color: 'text-warning',
      bg: 'bg-warning/10',
      sub: 'รายการที่ตรวจราคาแล้ว',
    },
    {
      label: 'เทรนด์ 7 วัน',
      value: loading ? '-' : formatPercent(stats.trend7d),
      icon: Activity,
      color: stats.trend7d >= 0 ? 'text-success' : 'text-danger',
      bg: stats.trend7d >= 0 ? 'bg-success/10' : 'bg-danger/10',
      sub: 'เปลี่ยนแปลงเฉลี่ย',
    },
    {
      label: 'เทรนด์ 30 วัน',
      value: loading ? '-' : formatPercent(stats.trend30d),
      icon: Activity,
      color: stats.trend30d >= 0 ? 'text-success' : 'text-danger',
      bg: stats.trend30d >= 0 ? 'bg-success/10' : 'bg-danger/10',
      sub: 'เปลี่ยนแปลงเฉลี่ย',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {items.map((item) => (
        <div
          key={item.label}
          className="bg-surface border border-border rounded-xl p-4 flex flex-col gap-2"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">{item.label}</span>
            <div className={`p-1.5 rounded-lg ${item.bg}`}>
              <item.icon size={12} className={item.color} />
            </div>
          </div>
          <div className={`text-xl font-bold ${item.color}`}>{item.value}</div>
          <div className="text-xs text-text-muted">{item.sub}</div>
        </div>
      ))}
    </div>
  );
}
