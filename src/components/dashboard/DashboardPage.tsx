'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import StatsCards from './StatsCards';
import FilterBar from './FilterBar';
import CardTable from './CardTable';
import AddCardModal from '@/components/modals/AddCardModal';
import EditCardModal from '@/components/modals/EditCardModal';
import SellCardModal from '@/components/modals/SellCardModal';
import { TrackedCard, CardFilters, DashboardStats } from '@/types';
import { isToday, calculateProfit } from '@/lib/utils';

const DEFAULT_FILTERS: CardFilters = {
  search: '',
  game: '',
  set: '',
  psa: '',
  status: '',
  sortBy: 'created_at',
  sortOrder: 'desc',
};

export default function DashboardPage() {
  const [cards, setCards] = useState<TrackedCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<CardFilters>(DEFAULT_FILTERS);
  const [stats, setStats] = useState<DashboardStats>({
    totalCards: 0,
    totalProfit: 0,
    totalLoss: 0,
    updatedToday: 0,
    trend7d: 0,
    trend30d: 0,
  });
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; card: TrackedCard | null }>({
    open: false,
    card: null,
  });
  const [sellModal, setSellModal] = useState<{ open: boolean; card: TrackedCard | null }>({
    open: false,
    card: null,
  });
  const [fetchingIds, setFetchingIds] = useState<Set<string>>(new Set());
  const [fetchingAll, setFetchingAll] = useState(false);
  const [sets, setSets] = useState<string[]>([]);

  const fetchCards = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.search) params.set('search', filters.search);
      if (filters.game) params.set('game', filters.game);
      if (filters.set) params.set('set', filters.set);
      if (filters.psa) params.set('psa', filters.psa);
      if (filters.status) params.set('status', filters.status);
      params.set('sortBy', filters.sortBy);
      params.set('sortOrder', filters.sortOrder);

      const res = await fetch(`/api/cards?${params}`);
      const data = await res.json();
      const cardsData: TrackedCard[] = data.cards || [];
      setCards(cardsData);

      // Extract unique sets
      const setMap: Record<string, boolean> = {};
      cardsData.forEach((c) => { if (c.master_card.set_name) setMap[c.master_card.set_name] = true; });
      const uniqueSets = Object.keys(setMap).sort();
      setSets(uniqueSets);

      // Compute stats
      const totalProfit = cardsData.reduce((sum, c) => {
        const p = c.latest_profit || 0;
        return p > 0 ? sum + p : sum;
      }, 0);
      const totalLoss = cardsData.reduce((sum, c) => {
        const p = c.latest_profit || 0;
        return p < 0 ? sum + p : sum;
      }, 0);
      const updatedToday = cardsData.filter((c) => isToday(c.latest_checked_at)).length;

      setStats({
        totalCards: cardsData.length,
        totalProfit,
        totalLoss,
        updatedToday,
        trend7d: 0,
        trend30d: 0,
      });
    } catch (err) {
      console.error('Failed to fetch cards:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCards();
  }, [fetchCards]);

  const handleFilterChange = (newFilters: Partial<CardFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  const handleFetchPrice = async (card: TrackedCard) => {
    setFetchingIds((prev) => { const s = new Set(Array.from(prev)); s.add(card.id); return s; });
    try {
      await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tracked_card_id: card.id, priority: 1 }),
      });
      setTimeout(() => {
        fetchCards();
        setFetchingIds((prev) => {
          const next = new Set(prev);
          next.delete(card.id);
          return next;
        });
      }, 3000);
    } catch {
      setFetchingIds((prev) => {
        const next = new Set(prev);
        next.delete(card.id);
        return next;
      });
    }
  };

  const handleFetchAll = async () => {
    setFetchingAll(true);
    try {
      await Promise.all(
        cards.map((c) =>
          fetch('/api/scrape', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tracked_card_id: c.id, priority: 3 }),
          })
        )
      );
      setTimeout(() => {
        fetchCards();
        setFetchingAll(false);
      }, 5000);
    } catch {
      setFetchingAll(false);
    }
  };

  const handleDelete = async (card: TrackedCard) => {
    if (!confirm(`ต้องการลบ ${card.master_card.card_name}?`)) return;
    try {
      await fetch(`/api/cards/${card.id}`, { method: 'DELETE' });
      fetchCards();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Card Name', 'Set', 'Card#', 'Game', 'PSA', 'eBay Price', 'Japan Price',
      'Thai Price', 'Profit', 'Profit%', 'Status', 'Last Updated',
    ];
    const rows = cards.map((c) => [
      c.master_card.card_name,
      c.master_card.set_name || '',
      c.master_card.card_number || '',
      c.master_card.game_type,
      c.psa_grade || '',
      c.latest_ebay_price || '',
      c.latest_japan_price || '',
      c.latest_thai_price || c.thai_price || '',
      c.latest_profit || '',
      c.latest_profit_percent ? `${c.latest_profit_percent.toFixed(1)}%` : '',
      c.current_status,
      c.latest_checked_at || '',
    ]);

    const csv = [headers, ...rows].map((r) => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cardquant_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-[1600px] mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text">แดชบอร์ด</h1>
            <p className="text-sm text-text-muted mt-0.5">
              ติดตามราคาการ์ดสะสมของคุณ
            </p>
          </div>
        </div>

        <StatsCards stats={stats} loading={loading} />

        <FilterBar
          filters={filters}
          onChange={handleFilterChange}
          onAddCard={() => setAddModalOpen(true)}
          onFetchAll={handleFetchAll}
          onExportCSV={handleExportCSV}
          fetchingAll={fetchingAll}
          sets={sets}
        />

        <CardTable
          cards={cards}
          loading={loading}
          onEdit={(card) => setEditModal({ open: true, card })}
          onDelete={handleDelete}
          onFetchPrice={handleFetchPrice}
          onSell={(card) => setSellModal({ open: true, card })}
          fetchingIds={fetchingIds}
        />
      </main>

      <AddCardModal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        onSuccess={fetchCards}
      />

      <EditCardModal
        isOpen={editModal.open}
        onClose={() => setEditModal({ open: false, card: null })}
        onSuccess={fetchCards}
        card={editModal.card}
      />

      <SellCardModal
        isOpen={sellModal.open}
        onClose={() => setSellModal({ open: false, card: null })}
        onSuccess={fetchCards}
        card={sellModal.card}
      />
    </div>
  );
}
