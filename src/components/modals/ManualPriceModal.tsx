'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Check, RefreshCw, ExternalLink } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { TrackedCard } from '@/types';
import { cn } from '@/lib/utils';

interface ManualPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  card: TrackedCard | null;
}

// Extract SNKRDUNK card ID from URL like:
// https://snkrdunk.com/en/trading-cards/91118 or
// https://snkrdunk.com/en/v1/trading-cards/91118/used-listings
function extractSnkrdunkId(url: string): string | null {
  const match = url.match(/trading-cards\/(\d+)/);
  return match ? match[1] : null;
}

// USD/JPY rough rate (will be overridden by live rate if available)
const USD_JPY_RATE = 150;

export default function ManualPriceModal({ isOpen, onClose, onSuccess, card }: ManualPriceModalProps) {
  const [form, setForm] = useState({ ebay_price: '', japan_price: '', thai_price: '', note: '' });
  const [saving, setSaving] = useState(false);

  // SNKRDUNK fetch state
  const [snkrdunkId, setSnkrdunkId] = useState('');
  const [fetchingSnkrdunk, setFetchingSnkrdunk] = useState(false);
  const [snkrdunkResult, setSnkrdunkResult] = useState<{
    priceJPY: number;
    priceUSD: number;
    count: number;
  } | null>(null);
  const [snkrdunkError, setSnkrdunkError] = useState('');

  // Auto-fill SNKRDUNK ID from japan_url
  useEffect(() => {
    if (!card) return;
    const url = (card as any).japan_url || '';
    if (url.includes('snkrdunk.com')) {
      const id = extractSnkrdunkId(url);
      if (id) setSnkrdunkId(id);
    }
  }, [card]);

  const handleClose = () => {
    setForm({ ebay_price: '', japan_price: '', thai_price: '', note: '' });
    setSnkrdunkResult(null);
    setSnkrdunkError('');
    onClose();
  };

  const handleFetchSnkrdunk = async () => {
    if (!snkrdunkId.trim()) return;
    setFetchingSnkrdunk(true);
    setSnkrdunkError('');
    setSnkrdunkResult(null);

    try {
      const res = await fetch(`/api/snkrdunk?cardId=${snkrdunkId.trim()}`);
      const data = await res.json();

      if (!res.ok) {
        setSnkrdunkError(data.error || 'ดึงราคาไม่สำเร็จ');
        return;
      }

      const priceJPY = data.lowestPriceJPY;
      const priceUSD = Math.round((priceJPY / USD_JPY_RATE) * 100) / 100;

      setSnkrdunkResult({ priceJPY, priceUSD, count: data.listingCount });
      // Auto-fill japan price field
      setForm((prev) => ({ ...prev, japan_price: priceUSD.toString() }));
    } catch {
      setSnkrdunkError('เชื่อมต่อ SNKRDUNK ไม่ได้');
    } finally {
      setFetchingSnkrdunk(false);
    }
  };

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);
    try {
      const ebay = form.ebay_price ? parseFloat(form.ebay_price) : null;
      const japan = form.japan_price ? parseFloat(form.japan_price) : null;
      const thai = form.thai_price ? parseFloat(form.thai_price) : null;

      const buyCost = ebay ? ebay * 0.87 + 5 : null;
      const profit = japan && buyCost ? japan - buyCost : null;
      const profitPercent = profit && buyCost ? (profit / buyCost) * 100 : null;

      const sourceNote = snkrdunkResult
        ? `SNKRDUNK ID:${snkrdunkId} ราคาต่ำสุด ¥${snkrdunkResult.priceJPY} (~$${snkrdunkResult.priceUSD})`
        : form.note || 'กรอกราคาด้วยตนเอง';

      const res = await fetch('/api/price-logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracked_card_id: card.id,
          ebay_price: ebay,
          japan_price: japan,
          thai_price: thai,
          profit,
          profit_percent: profitPercent,
          scrape_status: snkrdunkResult ? 'snkrdunk' : 'manual',
          source_note: sourceNote,
        }),
      });

      if (res.ok) {
        onSuccess();
        handleClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-xs font-medium text-text-muted mb-1';

  if (!card) return null;

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="sm">
      {/* Header */}
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text">อัปเดตราคา</h2>
          <p className="text-xs text-text-muted">{card.master_card.card_name}</p>
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* SNKRDUNK section */}
        <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4 space-y-3">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-5 h-5 rounded bg-orange-500/20 flex items-center justify-center">
              <span className="text-orange-400 text-[10px] font-bold">SD</span>
            </div>
            <span className="text-sm font-semibold text-orange-400">SNKRDUNK Japan</span>
            <span className="text-xs text-text-muted ml-auto">Lowest In-Stock</span>
          </div>

          <div className="flex gap-2">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Card ID เช่น 91118"
                value={snkrdunkId}
                onChange={(e) => {
                  setSnkrdunkId(e.target.value);
                  setSnkrdunkResult(null);
                  setSnkrdunkError('');
                }}
                className="w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:border-orange-400 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && handleFetchSnkrdunk()}
              />
            </div>
            <button
              onClick={handleFetchSnkrdunk}
              disabled={!snkrdunkId.trim() || fetchingSnkrdunk}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 shrink-0',
                'bg-orange-500/20 text-orange-400 hover:bg-orange-500/30 disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <RefreshCw size={13} className={fetchingSnkrdunk ? 'animate-spin' : ''} />
              {fetchingSnkrdunk ? 'กำลังดึง...' : 'ดึงราคา'}
            </button>
          </div>

          {/* Result */}
          {snkrdunkResult && (
            <div className="bg-surface rounded-lg border border-orange-500/30 px-3 py-2 flex items-center justify-between">
              <div>
                <p className="text-xs text-text-muted">ราคาต่ำสุด ({snkrdunkResult.count} รายการ)</p>
                <p className="text-base font-bold text-orange-400">
                  ¥{snkrdunkResult.priceJPY.toLocaleString()}
                  <span className="text-sm font-normal text-text-muted ml-2">
                    ≈ ${snkrdunkResult.priceUSD}
                  </span>
                </p>
              </div>
              <a
                href={`https://snkrdunk.com/en/trading-cards/${snkrdunkId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-orange-400 transition-colors"
              >
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Error */}
          {snkrdunkError && (
            <p className="text-xs text-danger bg-danger/10 px-3 py-2 rounded-lg">{snkrdunkError}</p>
          )}

          <p className="text-xs text-text-muted">
            วิธีหา Card ID: เปิด SNKRDUNK → ดูที่ URL เช่น{' '}
            <code className="bg-surface2 px-1 rounded text-orange-400">snkrdunk.com/en/trading-cards/<strong>91118</strong></code>
          </p>
        </div>

        {/* Manual price inputs */}
        <div className="space-y-3">
          <p className="text-xs font-medium text-text-muted">หรือกรอกราคาเอง</p>
          <div>
            <label className={labelClass}>ราคา eBay ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="เช่น 45.00"
              value={form.ebay_price}
              onChange={(e) => setForm({ ...form, ebay_price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>
              ราคา Japan ($)
              {snkrdunkResult && (
                <span className="ml-2 text-orange-400 text-xs">← ดึงจาก SNKRDUNK อัตโนมัติ</span>
              )}
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="เช่น 38.50"
              value={form.japan_price}
              onChange={(e) => setForm({ ...form, japan_price: e.target.value })}
              className={cn(inputClass, snkrdunkResult && 'border-orange-500/40')}
            />
          </div>
          <div>
            <label className={labelClass}>ราคาตลาดไทย (฿)</label>
            <input
              type="number"
              placeholder="เช่น 1500"
              value={form.thai_price}
              onChange={(e) => setForm({ ...form, thai_price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>หมายเหตุ (ไม่บังคับ)</label>
            <input
              type="text"
              placeholder="เช่น PSA10, graded"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        {/* Live profit preview */}
        {form.ebay_price && form.japan_price && (
          <div className="bg-surface2 rounded-lg border border-border px-3 py-2">
            <p className="text-xs text-text-muted mb-1">ประมาณกำไร (Japan − eBay×0.87 − $5 ค่าส่ง)</p>
            {(() => {
              const ebay = parseFloat(form.ebay_price);
              const japan = parseFloat(form.japan_price);
              const cost = ebay * 0.87 + 5;
              const profit = japan - cost;
              const pct = (profit / cost) * 100;
              return (
                <p className={`text-sm font-bold ${profit >= 0 ? 'text-success' : 'text-danger'}`}>
                  {profit >= 0 ? '+' : ''}{profit.toFixed(2)}$ ({pct.toFixed(1)}%)
                </p>
              );
            })()}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <Button variant="ghost" onClick={handleClose}>ยกเลิก</Button>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          disabled={!form.ebay_price && !form.japan_price && !form.thai_price}
        >
          <Check size={14} />
          บันทึกราคา
        </Button>
      </div>
    </Modal>
  );
}
