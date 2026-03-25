'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowLeft,
  ExternalLink,
  RefreshCw,
  Edit2,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Tag,
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import PriceChart from './PriceChart';
import ThaiMarketSection from './ThaiMarketSection';
import EditCardModal from '@/components/modals/EditCardModal';
import SellCardModal from '@/components/modals/SellCardModal';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import {
  formatPriceUSD,
  formatPriceTHB,
  formatPercent,
  formatDate,
  formatDateTime,
  formatRelativeTime,
  gameTypeLabel,
  statusLabel,
  statusColor,
  priorityColor,
} from '@/lib/utils';
import { TrackedCard, PriceLog } from '@/types';
import { cn } from '@/lib/utils';

interface CardDetailPageProps {
  id: string;
}

export default function CardDetailPage({ id }: CardDetailPageProps) {
  const [card, setCard] = useState<TrackedCard | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [sellOpen, setSellOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'chart' | 'logs' | 'thai'>('chart');

  const fetchCard = async () => {
    try {
      const res = await fetch(`/api/cards/${id}`);
      const data = await res.json();
      setCard(data.card);
    } catch (err) {
      console.error('Failed to fetch card:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCard();
  }, [id]);

  const handleFetchPrice = async () => {
    if (!card) return;
    setFetching(true);
    try {
      await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracked_card_id: card.id, priority: 1 }),
      });
      setTimeout(() => {
        fetchCard();
        setFetching(false);
      }, 3500);
    } catch {
      setFetching(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-[60vh]">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  if (!card) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
          <p className="text-text-muted">ไม่พบการ์ดที่ต้องการ</p>
          <Link href="/dashboard">
            <Button variant="secondary">
              <ArrowLeft size={14} />
              กลับแดชบอร์ด
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const mc = card.master_card;
  const priceLogs = card.price_logs || [];
  const isProfit = (card.latest_profit || 0) >= 0;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-sm">
          <Link href="/dashboard" className="text-text-muted hover:text-text transition-colors flex items-center gap-1">
            <ArrowLeft size={14} />
            แดชบอร์ด
          </Link>
          <span className="text-border">/</span>
          <span className="text-text truncate">{mc.card_name}</span>
        </div>

        {/* Hero Section */}
        <div className="bg-surface border border-border rounded-2xl p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Card Image */}
            <div className="shrink-0 flex justify-center md:justify-start">
              <div className="w-48 h-64 relative rounded-xl overflow-hidden bg-surface2 border border-border shadow-2xl">
                {mc.image_url ? (
                  <Image
                    src={mc.image_url}
                    alt={mc.card_name}
                    fill
                    className="object-cover"
                    unoptimized
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted">
                    ไม่มีรูป
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <h1 className="text-2xl font-bold text-text">{mc.card_name}</h1>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    {mc.set_name && <span className="text-text-muted text-sm">{mc.set_name}</span>}
                    {mc.card_number && (
                      <Badge variant="default">#{mc.card_number}</Badge>
                    )}
                    {mc.rarity && <Badge variant="info">{mc.rarity}</Badge>}
                    <Badge variant="default">{gameTypeLabel(mc.game_type)}</Badge>
                    <span className={cn('inline-flex px-2 py-0.5 rounded text-xs font-medium', statusColor(card.current_status))}>
                      {statusLabel(card.current_status)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
                    <Edit2 size={13} />
                    แก้ไข
                  </Button>
                  <Button size="sm" variant="secondary" onClick={handleFetchPrice} loading={fetching}>
                    <RefreshCw size={13} />
                    ดึงราคา
                  </Button>
                  <Button size="sm" variant="success" onClick={() => setSellOpen(true)}>
                    <DollarSign size={13} />
                    บันทึกการขาย
                  </Button>
                </div>
              </div>

              {/* Price Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-surface2 rounded-xl p-4 border border-border">
                  <div className="text-xs text-text-muted mb-1">ราคา eBay</div>
                  <div className="text-xl font-bold text-primary">
                    {formatPriceUSD(card.latest_ebay_price)}
                  </div>
                  {card.ebay_url && (
                    <a href={card.ebay_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-text-muted hover:text-primary flex items-center gap-1 mt-1 transition-colors">
                      <ExternalLink size={10} /> ดูบน eBay
                    </a>
                  )}
                </div>

                <div className="bg-surface2 rounded-xl p-4 border border-border">
                  <div className="text-xs text-text-muted mb-1">ราคา Japan</div>
                  <div className="text-xl font-bold text-warning">
                    {formatPriceUSD(card.latest_japan_price)}
                  </div>
                  {card.japan_url && (
                    <a href={card.japan_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-text-muted hover:text-warning flex items-center gap-1 mt-1 transition-colors">
                      <ExternalLink size={10} /> ดู Japan
                    </a>
                  )}
                </div>

                <div className="bg-surface2 rounded-xl p-4 border border-border">
                  <div className="text-xs text-text-muted mb-1">ราคาไทย</div>
                  <div className="text-xl font-bold text-text">
                    {formatPriceTHB(card.latest_thai_price || card.thai_price)}
                  </div>
                  {card.thai_buy_price && (
                    <div className="text-xs text-text-muted mt-1">
                      ซื้อมา: {formatPriceTHB(card.thai_buy_price)}
                    </div>
                  )}
                </div>

                <div className={cn('rounded-xl p-4 border', isProfit ? 'bg-success/5 border-success/20' : 'bg-danger/5 border-danger/20')}>
                  <div className="text-xs text-text-muted mb-1">กำไร/ขาดทุน</div>
                  <div className={cn('text-xl font-bold flex items-center gap-1', isProfit ? 'text-success' : 'text-danger')}>
                    {isProfit ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                    {formatPriceUSD(card.latest_profit)}
                  </div>
                  <div className={cn('text-xs mt-1', isProfit ? 'text-success/70' : 'text-danger/70')}>
                    {formatPercent(card.latest_profit_percent)}
                  </div>
                </div>
              </div>

              {/* Meta info */}
              <div className="flex flex-wrap gap-4 text-xs text-text-muted">
                {card.psa_grade && (
                  <div className="flex items-center gap-1">
                    <Tag size={12} />
                    PSA {card.psa_grade}
                  </div>
                )}
                <div className={cn('flex items-center gap-1 font-medium px-2 py-0.5 rounded', priorityColor(card.priority_tier))}>
                  Priority {card.priority_tier}
                </div>
                {card.label && (
                  <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded">
                    {card.label}
                  </div>
                )}
                {card.latest_checked_at && (
                  <div className="flex items-center gap-1">
                    <RefreshCw size={12} />
                    อัปเดต: {formatRelativeTime(card.latest_checked_at)}
                  </div>
                )}
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  เพิ่มเมื่อ: {formatDate(card.created_at)}
                </div>
              </div>

              {card.note && (
                <div className="mt-3 p-3 bg-surface2 rounded-lg border border-border text-sm text-text-secondary">
                  {card.note}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-surface border border-border rounded-xl p-1 w-fit">
          {(['chart', 'logs', 'thai'] as const).map((tab) => {
            const labels = { chart: 'กราฟราคา', logs: 'ประวัติราคา', thai: 'ตลาดไทย' };
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={cn(
                  'px-4 py-2 rounded-lg text-sm transition-all',
                  activeTab === tab
                    ? 'bg-primary text-white font-medium'
                    : 'text-text-muted hover:text-text'
                )}
              >
                {labels[tab]}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="bg-surface border border-border rounded-2xl p-6">
          {activeTab === 'chart' && (
            <div>
              <h2 className="text-base font-semibold text-text mb-4">กราฟราคาย้อนหลัง</h2>
              <PriceChart logs={priceLogs} />
            </div>
          )}

          {activeTab === 'logs' && (
            <div>
              <h2 className="text-base font-semibold text-text mb-4">
                ประวัติราคา ({priceLogs.length} รายการ)
              </h2>
              {priceLogs.length === 0 ? (
                <p className="text-text-muted text-sm text-center py-8">ยังไม่มีประวัติราคา</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="px-3 py-2 text-left text-xs text-text-muted font-medium">วันที่</th>
                        <th className="px-3 py-2 text-right text-xs text-text-muted font-medium">eBay ($)</th>
                        <th className="px-3 py-2 text-right text-xs text-text-muted font-medium">Japan ($)</th>
                        <th className="px-3 py-2 text-right text-xs text-text-muted font-medium">กำไร ($)</th>
                        <th className="px-3 py-2 text-right text-xs text-text-muted font-medium">กำไร%</th>
                        <th className="px-3 py-2 text-center text-xs text-text-muted font-medium">หมายเหตุ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {priceLogs.map((log) => {
                        const p = log.profit || 0;
                        return (
                          <tr key={log.id} className="border-b border-border/50 hover:bg-surface2/50">
                            <td className="px-3 py-2 text-text-muted text-xs">
                              {formatDateTime(log.checked_at)}
                            </td>
                            <td className="px-3 py-2 text-right text-text">
                              {formatPriceUSD(log.ebay_price)}
                            </td>
                            <td className="px-3 py-2 text-right text-text">
                              {formatPriceUSD(log.japan_price)}
                            </td>
                            <td className={cn('px-3 py-2 text-right font-medium', p >= 0 ? 'text-success' : 'text-danger')}>
                              {formatPriceUSD(log.profit)}
                            </td>
                            <td className={cn('px-3 py-2 text-right', p >= 0 ? 'text-success' : 'text-danger')}>
                              {formatPercent(log.profit_percent)}
                            </td>
                            <td className="px-3 py-2 text-center text-xs text-text-muted">
                              {log.source_note || '-'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'thai' && (
            <div>
              <h2 className="text-base font-semibold text-text mb-4">ข้อมูลตลาดไทย</h2>
              <ThaiMarketSection card={card} onUpdate={fetchCard} />
            </div>
          )}
        </div>
      </main>

      <EditCardModal
        isOpen={editOpen}
        onClose={() => setEditOpen(false)}
        onSuccess={fetchCard}
        card={card}
      />
      <SellCardModal
        isOpen={sellOpen}
        onClose={() => setSellOpen(false)}
        onSuccess={fetchCard}
        card={card}
      />
    </div>
  );
}
