'use client';

import { Search, Download, Plus, RefreshCw, Filter, SortAsc } from 'lucide-react';
import Button from '@/components/ui/Button';
import { CardFilters } from '@/types';
import { cn } from '@/lib/utils';

interface FilterBarProps {
  filters: CardFilters;
  onChange: (filters: Partial<CardFilters>) => void;
  onAddCard: () => void;
  onFetchAll: () => void;
  onExportCSV: () => void;
  fetchingAll?: boolean;
  sets: string[];
}

const STATUS_OPTIONS = [
  { value: '', label: 'ทุกสถานะ' },
  { value: 'tracking', label: 'กำลังติดตาม' },
  { value: 'holding', label: 'ถือครอง' },
  { value: 'sold', label: 'ขายแล้ว' },
];

const GAME_OPTIONS = [
  { value: '', label: 'ทุกเกม' },
  { value: 'pokemon', label: 'Pokémon' },
  { value: 'onepiece', label: 'One Piece' },
  { value: 'dragonball', label: 'Dragon Ball' },
];

const PSA_OPTIONS = [
  { value: '', label: 'ทุกเกรด' },
  { value: '10', label: 'PSA 10' },
  { value: '9', label: 'PSA 9' },
  { value: '8', label: 'PSA 8' },
  { value: '7', label: 'PSA 7' },
  { value: 'none', label: 'ไม่มีเกรด' },
];

const SORT_OPTIONS = [
  { value: 'created_at', label: 'วันที่เพิ่มใหม่' },
  { value: 'updated_at', label: 'อัปเดตล่าสุด' },
  { value: 'latest_profit_percent', label: 'กำไร%' },
  { value: 'latest_profit', label: 'กำไร $' },
  { value: 'latest_ebay_price', label: 'ราคา eBay' },
  { value: 'latest_japan_price', label: 'ราคา Japan' },
  { value: 'latest_thai_price', label: 'ราคาไทย' },
];

const selectClass =
  'bg-surface2 border border-border rounded-lg px-3 py-1.5 text-sm text-text focus:outline-none focus:border-primary transition-colors cursor-pointer';

export default function FilterBar({
  filters,
  onChange,
  onAddCard,
  onFetchAll,
  onExportCSV,
  fetchingAll,
  sets,
}: FilterBarProps) {
  const setOptions = [
    { value: '', label: 'ทุกเซ็ต' },
    ...sets.map((s) => ({ value: s, label: s })),
  ];

  return (
    <div className="space-y-3 mb-4">
      {/* Top row - status quick filters */}
      <div className="flex items-center gap-2 flex-wrap">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange({ status: opt.value })}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm transition-all duration-150',
              filters.status === opt.value
                ? 'bg-primary text-white font-medium'
                : 'bg-surface2 border border-border text-text-muted hover:text-text hover:border-primary/50'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Bottom row - search + filters + actions */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="ค้นหาการ์ด..."
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            className="w-full bg-surface2 border border-border rounded-lg pl-9 pr-3 py-1.5 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        {/* Game filter */}
        <select
          value={filters.game}
          onChange={(e) => onChange({ game: e.target.value })}
          className={selectClass}
        >
          {GAME_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Set filter */}
        <select
          value={filters.set}
          onChange={(e) => onChange({ set: e.target.value })}
          className={selectClass}
        >
          {setOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* PSA filter */}
        <select
          value={filters.psa}
          onChange={(e) => onChange({ psa: e.target.value })}
          className={selectClass}
        >
          {PSA_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={filters.sortBy}
          onChange={(e) => onChange({ sortBy: e.target.value })}
          className={selectClass}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <button
          onClick={() =>
            onChange({ sortOrder: filters.sortOrder === 'asc' ? 'desc' : 'asc' })
          }
          className="p-1.5 rounded-lg bg-surface2 border border-border text-text-muted hover:text-text transition-colors"
          title={filters.sortOrder === 'asc' ? 'เรียงจากน้อยไปมาก' : 'เรียงจากมากไปน้อย'}
        >
          <SortAsc
            size={16}
            className={cn(
              'transition-transform',
              filters.sortOrder === 'desc' && 'scale-y-[-1]'
            )}
          />
        </button>

        <div className="flex-1" />

        {/* Actions */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onFetchAll}
          loading={fetchingAll}
          className="gap-1.5"
        >
          <RefreshCw size={13} />
          ดึงราคาทั้งหมด
        </Button>

        <Button variant="secondary" size="sm" onClick={onExportCSV} className="gap-1.5">
          <Download size={13} />
          ส่งออก CSV
        </Button>

        <Button variant="primary" size="sm" onClick={onAddCard} className="gap-1.5">
          <Plus size={13} />
          เพิ่มการ์ด
        </Button>
      </div>
    </div>
  );
}
