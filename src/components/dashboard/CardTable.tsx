'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import {
  Eye,
  Edit2,
  RefreshCw,
  DollarSign,
  Trash2,
  TrendingUp,
  TrendingDown,
  Minus,
  ChevronUp,
  ChevronDown,
  X,
} from 'lucide-react';
import {
  formatPriceUSD,
  formatPriceTHB,
  formatPercent,
  formatRelativeTime,
  gameTypeLabel,
  statusColor,
  statusLabel,
  priorityColor,
} from '@/lib/utils';
import { TrackedCard } from '@/types';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface CardTableProps {
  cards: TrackedCard[];
  loading?: boolean;
  onEdit: (card: TrackedCard) => void;
  onDelete: (card: TrackedCard) => void;
  onFetchPrice: (card: TrackedCard) => void;
  onSell: (card: TrackedCard) => void;
  fetchingIds?: Set<string>;
}

function ProfitCell({ profit, profitPercent }: { profit?: number | null; profitPercent?: number | null }) {
  if (profit === null || profit === undefined) {
    return <span className="text-text-muted">-</span>;
  }

  const isPositive = profit >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <div className={cn('flex items-center gap-1', isPositive ? 'text-success' : 'text-danger')}>
      <Icon size={12} />
      <span className="font-medium">{formatPriceUSD(Math.abs(profit))}</span>
      {profitPercent !== null && profitPercent !== undefined && (
        <span className="text-xs opacity-75">({formatPercent(profitPercent)})</span>
      )}
    </div>
  );
}

function GameBadge({ game }: { game: string }) {
  const colors: Record<string, string> = {
    pokemon: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
    onepiece: 'bg-red-500/10 text-red-400 border-red-500/20',
    dragonball: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  };

  return (
    <span
      className={cn(
        'inline-flex px-1.5 py-0.5 rounded text-xs font-medium border',
        colors[game] || 'bg-surface3 text-text-secondary border-border'
      )}
    >
      {gameTypeLabel(game)}
    </span>
  );
}

const COLUMNS = [
  { key: 'image', label: '', width: 'w-10' },
  { key: 'card_name', label: 'การ์ด', sortable: true },
  { key: 'game', label: 'เกม', width: 'w-24' },
  { key: 'card_number', label: 'เลข', width: 'w-16' },
  { key: 'psa', label: 'PSA', width: 'w-14' },
  { key: 'ebay', label: 'eBay ($)', width: 'w-24', sortable: true },
  { key: 'japan', label: 'Japan ($)', width: 'w-24', sortable: true },
  { key: 'thai', label: 'ราคาไทย (฿)', width: 'w-28', sortable: true },
  { key: 'profit', label: 'กำไร', width: 'w-36', sortable: true },
  { key: 'status', label: 'สถานะ', width: 'w-24' },
  { key: 'updated', label: 'อัปเดต', width: 'w-28' },
  { key: 'actions', label: '', width: 'w-32' },
];

export default function CardTable({
  cards,
  loading,
  onEdit,
  onDelete,
  onFetchPrice,
  onSell,
  fetchingIds = new Set(),
}: CardTableProps) {
  const [zoomedImage, setZoomedImage] = useState<{ url: string; name: string } | null>(null);

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-8 text-center text-text-muted">
          <RefreshCw size={24} className="animate-spin mx-auto mb-2" />
          <p>กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  if (cards.length === 0) {
    return (
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="p-12 text-center text-text-muted">
          <Minus size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-lg font-medium text-text-secondary">ไม่พบการ์ด</p>
          <p className="text-sm mt-1">เพิ่มการ์ดใหม่เพื่อเริ่มติดตามราคา</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface border border-border rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border">
              <th className="px-3 py-3 text-left text-xs font-medium text-text-muted w-10"></th>
              <th className="px-3 py-3 text-left text-xs font-medium text-text-muted">การ์ด</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-text-muted w-24">เกม</th>
              <th className="px-3 py-3 text-left text-xs font-medium text-text-muted w-16">เลข</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-text-muted w-14">PSA</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-text-muted w-24">eBay ($)</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-text-muted w-24">Japan ($)</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-text-muted w-28">ราคาไทย (฿)</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-text-muted w-36">กำไร</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-text-muted w-24">สถานะ</th>
              <th className="px-3 py-3 text-center text-xs font-medium text-text-muted w-28">อัปเดต</th>
              <th className="px-3 py-3 text-right text-xs font-medium text-text-muted w-32">การดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            {cards.map((card, idx) => {
              const mc = card.master_card;
              const isFetching = fetchingIds.has(card.id);

              return (
                <tr
                  key={card.id}
                  className={cn(
                    'border-b border-border/50 hover:bg-surface2/50 transition-colors',
                    idx % 2 === 0 ? '' : 'bg-surface2/20'
                  )}
                >
                  {/* Image */}
                  <td className="px-3 py-2">
                    <div
                      className="w-8 h-10 relative rounded overflow-hidden bg-surface2 flex items-center justify-center shrink-0 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
                      onClick={() => mc.image_url && setZoomedImage({ url: mc.image_url, name: mc.card_name })}
                      title="คลิกเพื่อดูรูปใหญ่"
                    >
                      {mc.image_url ? (
                        <Image
                          src={mc.image_url}
                          alt={mc.card_name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <span className="text-xs text-text-muted">-</span>
                      )}
                    </div>
                  </td>

                  {/* Card name */}
                  <td className="px-3 py-2 max-w-[220px]">
                    <div className="flex flex-col gap-0.5">
                      <Link
                        href={`/card/${card.id}`}
                        className="font-medium text-text hover:text-primary transition-colors truncate block"
                      >
                        {mc.card_name}
                      </Link>
                      <div className="flex items-center gap-1.5">
                        {mc.set_name && (
                          <span className="text-xs text-text-muted truncate max-w-[130px]">{mc.set_name}</span>
                        )}
                        {card.label && (
                          <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded border border-primary/20">
                            {card.label}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Game */}
                  <td className="px-3 py-2">
                    <GameBadge game={mc.game_type} />
                  </td>

                  {/* Card number */}
                  <td className="px-3 py-2 text-xs text-text-muted">
                    {mc.card_number || '-'}
                  </td>

                  {/* PSA */}
                  <td className="px-3 py-2 text-center">
                    {card.psa_grade ? (
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm border border-primary/20">
                        {card.psa_grade}
                      </span>
                    ) : (
                      <span className="text-text-muted text-xs">-</span>
                    )}
                  </td>

                  {/* eBay price */}
                  <td className="px-3 py-2 text-right">
                    <span className="text-text font-medium">
                      {formatPriceUSD(card.latest_ebay_price)}
                    </span>
                  </td>

                  {/* Japan price */}
                  <td className="px-3 py-2 text-right">
                    <span className="text-text font-medium">
                      {formatPriceUSD(card.latest_japan_price)}
                    </span>
                  </td>

                  {/* Thai price */}
                  <td className="px-3 py-2 text-right">
                    <span className="text-text font-medium">
                      {formatPriceTHB(card.latest_thai_price || card.thai_price)}
                    </span>
                  </td>

                  {/* Profit */}
                  <td className="px-3 py-2 text-right">
                    <ProfitCell
                      profit={card.latest_profit}
                      profitPercent={card.latest_profit_percent}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-3 py-2 text-center">
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded text-xs font-medium',
                        statusColor(card.current_status)
                      )}
                    >
                      {statusLabel(card.current_status)}
                    </span>
                  </td>

                  {/* Updated */}
                  <td className="px-3 py-2 text-center text-xs text-text-muted">
                    {formatRelativeTime(card.latest_checked_at)}
                  </td>

                  {/* Actions */}
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Link
                        href={`/card/${card.id}`}
                        className="p-1.5 rounded-lg hover:bg-surface3 text-text-muted hover:text-text transition-colors"
                        title="ดูรายละเอียด"
                      >
                        <Eye size={13} />
                      </Link>
                      <button
                        onClick={() => onEdit(card)}
                        className="p-1.5 rounded-lg hover:bg-surface3 text-text-muted hover:text-text transition-colors"
                        title="แก้ไข"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        onClick={() => onFetchPrice(card)}
                        disabled={isFetching}
                        className="p-1.5 rounded-lg hover:bg-surface3 text-text-muted hover:text-warning transition-colors disabled:opacity-50"
                        title="ดึงราคา"
                      >
                        <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
                      </button>
                      <button
                        onClick={() => onSell(card)}
                        className="p-1.5 rounded-lg hover:bg-surface3 text-text-muted hover:text-success transition-colors"
                        title="บันทึกการขาย"
                      >
                        <DollarSign size={13} />
                      </button>
                      <button
                        onClick={() => onDelete(card)}
                        className="p-1.5 rounded-lg hover:bg-danger/10 text-text-muted hover:text-danger transition-colors"
                        title="ลบ"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border flex items-center justify-between">
        <span className="text-xs text-text-muted">
          แสดง {cards.length} รายการ
        </span>
        <span className="text-xs text-text-muted">CardQuant TH</span>
      </div>

      {/* Image Zoom Modal */}
      {zoomedImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
          onClick={() => setZoomedImage(null)}
        >
          <div
            className="relative max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setZoomedImage(null)}
              className="absolute -top-10 right-0 text-white/70 hover:text-white p-1"
            >
              <X size={24} />
            </button>
            <div className="relative w-full aspect-[2/3] rounded-xl overflow-hidden shadow-2xl">
              <Image
                src={zoomedImage.url}
                alt={zoomedImage.name}
                fill
                className="object-contain"
                unoptimized
              />
            </div>
            <p className="text-center text-white/80 text-sm mt-3">{zoomedImage.name}</p>
          </div>
        </div>
      )}
    </div>
  );
}
