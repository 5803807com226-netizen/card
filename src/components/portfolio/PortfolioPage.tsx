'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  formatPriceTHB,
  formatDate,
} from '@/lib/utils';
import { PortfolioRecord } from '@/types';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Wallet, PackageOpen } from 'lucide-react';

interface PortfolioStats {
  holding: number;
  sold: number;
  totalCapital: number;
  profits: number;
  losses: number;
  net: number;
}

export default function PortfolioPage() {
  const [records, setRecords] = useState<PortfolioRecord[]>([]);
  const [stats, setStats] = useState<PortfolioStats>({
    holding: 0,
    sold: 0,
    totalCapital: 0,
    profits: 0,
    losses: 0,
    net: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/portfolio');
      const data = await res.json();
      setRecords(data.records || []);
      setStats(data.stats || {});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const statItems = [
    {
      label: 'กำลังถือครอง',
      value: stats.holding.toString(),
      sub: 'รายการ',
      icon: PackageOpen,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'ขายแล้ว',
      value: stats.sold.toString(),
      sub: 'รายการ',
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'ทุนทั้งหมด',
      value: formatPriceTHB(stats.totalCapital),
      sub: 'ราคาซื้อ',
      icon: Wallet,
      color: 'text-warning',
      bg: 'bg-warning/10',
    },
    {
      label: 'กำไรรวม',
      value: formatPriceTHB(stats.profits),
      sub: 'จากการขาย',
      icon: TrendingUp,
      color: 'text-success',
      bg: 'bg-success/10',
    },
    {
      label: 'ขาดทุนรวม',
      value: formatPriceTHB(Math.abs(stats.losses)),
      sub: 'จากการขาย',
      icon: TrendingDown,
      color: 'text-danger',
      bg: 'bg-danger/10',
    },
    {
      label: 'สุทธิ',
      value: formatPriceTHB(stats.net),
      sub: 'กำไร - ขาดทุน',
      icon: stats.net >= 0 ? TrendingUp : TrendingDown,
      color: stats.net >= 0 ? 'text-success' : 'text-danger',
      bg: stats.net >= 0 ? 'bg-success/10' : 'bg-danger/10',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text">ประวัติการซื้อขาย</h1>
          <p className="text-sm text-text-muted mt-0.5">สรุปผลการซื้อขายการ์ดของคุณ</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
          {statItems.map((item) => (
            <div key={item.label} className="bg-surface border border-border rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-text-muted">{item.label}</span>
                <div className={cn('p-1.5 rounded-lg', item.bg)}>
                  <item.icon size={12} className={item.color} />
                </div>
              </div>
              <div className={cn('text-xl font-bold', item.color)}>{item.value}</div>
              <div className="text-xs text-text-muted mt-1">{item.sub}</div>
            </div>
          ))}
        </div>

        {/* Table */}
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-border">
            <h2 className="font-medium text-text">รายการทั้งหมด</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner />
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12 text-text-muted text-sm">
              ยังไม่มีประวัติการซื้อขาย
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="px-3 py-2 text-left text-xs text-text-muted font-medium w-10"></th>
                    <th className="px-3 py-2 text-left text-xs text-text-muted font-medium">การ์ด</th>
                    <th className="px-3 py-2 text-right text-xs text-text-muted font-medium">ราคาซื้อ</th>
                    <th className="px-3 py-2 text-center text-xs text-text-muted font-medium">วันที่ซื้อ</th>
                    <th className="px-3 py-2 text-right text-xs text-text-muted font-medium">ราคาขาย</th>
                    <th className="px-3 py-2 text-center text-xs text-text-muted font-medium">วันที่ขาย</th>
                    <th className="px-3 py-2 text-center text-xs text-text-muted font-medium">แพลตฟอร์ม</th>
                    <th className="px-3 py-2 text-right text-xs text-text-muted font-medium">กำไร/ขาดทุน</th>
                    <th className="px-3 py-2 text-left text-xs text-text-muted font-medium">หมายเหตุ</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((record) => {
                    const card = record.tracked_card;
                    const mc = card?.master_card;
                    const profit = record.realized_profit || 0;

                    return (
                      <tr key={record.id} className="border-b border-border/50 hover:bg-surface2/50">
                        <td className="px-3 py-2">
                          <div className="w-8 h-10 relative rounded overflow-hidden bg-surface2">
                            {mc?.image_url ? (
                              <Image
                                src={mc.image_url}
                                alt={mc.card_name}
                                fill
                                className="object-cover"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">-</div>
                            )}
                          </div>
                        </td>
                        <td className="px-3 py-2">
                          {mc && card ? (
                            <Link href={`/card/${card.id}`} className="hover:text-primary transition-colors">
                              <div className="font-medium text-text">{mc.card_name}</div>
                              <div className="text-xs text-text-muted">{mc.set_name || '-'}</div>
                            </Link>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right text-text">
                          {formatPriceTHB(record.buy_price)}
                        </td>
                        <td className="px-3 py-2 text-center text-xs text-text-muted">
                          {record.buy_date ? formatDate(record.buy_date) : '-'}
                        </td>
                        <td className="px-3 py-2 text-right text-text">
                          {formatPriceTHB(record.sell_price)}
                        </td>
                        <td className="px-3 py-2 text-center text-xs text-text-muted">
                          {record.sell_date ? formatDate(record.sell_date) : '-'}
                        </td>
                        <td className="px-3 py-2 text-center text-xs text-text-secondary">
                          {record.sell_platform || '-'}
                        </td>
                        <td className="px-3 py-2 text-right">
                          {record.realized_profit !== null && record.realized_profit !== undefined ? (
                            <span className={cn('font-medium', profit >= 0 ? 'text-success' : 'text-danger')}>
                              {profit >= 0 ? '+' : ''}{formatPriceTHB(profit)}
                            </span>
                          ) : (
                            <span className="text-text-muted">-</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs text-text-muted max-w-[150px] truncate">
                          {record.note || '-'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
