'use client';

import { useState } from 'react';
import { DollarSign, Check } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { TrackedCard } from '@/types';

interface ManualPriceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  card: TrackedCard | null;
}

export default function ManualPriceModal({ isOpen, onClose, onSuccess, card }: ManualPriceModalProps) {
  const [form, setForm] = useState({ ebay_price: '', japan_price: '', thai_price: '', note: '' });
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    setForm({ ebay_price: '', japan_price: '', thai_price: '', note: '' });
    onClose();
  };

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);
    try {
      const ebay = form.ebay_price ? parseFloat(form.ebay_price) : null;
      const japan = form.japan_price ? parseFloat(form.japan_price) : null;
      const thai = form.thai_price ? parseFloat(form.thai_price) : null;

      // profit = japan - (ebay * 0.87 + shipping ~$5) converted roughly
      const buyCost = ebay ? ebay * 0.87 + 5 : null;
      const profit = japan && buyCost ? japan - buyCost : null;
      const profitPercent = profit && buyCost ? (profit / buyCost) * 100 : null;

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
          scrape_status: 'manual',
          source_note: form.note || 'กรอกราคาด้วยตนเอง',
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
      <div className="px-6 py-4 border-b border-border flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <DollarSign size={16} className="text-primary" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-text">อัปเดตราคา</h2>
          <p className="text-xs text-text-muted">{card.master_card.card_name}</p>
        </div>
      </div>

      <div className="p-6 space-y-4">
        <p className="text-xs text-text-muted bg-surface2 px-3 py-2 rounded-lg border border-border">
          กรอกราคาที่ดูจาก eBay, Yahoo Japan หรือตลาดไทย แล้วระบบจะคำนวณกำไรให้อัตโนมัติ
        </p>

        <div className="grid grid-cols-1 gap-3">
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
            <label className={labelClass}>ราคา Japan ($)</label>
            <input
              type="number"
              step="0.01"
              placeholder="เช่น 38.50"
              value={form.japan_price}
              onChange={(e) => setForm({ ...form, japan_price: e.target.value })}
              className={inputClass}
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
            <p className="text-xs text-text-muted mb-1">ประมาณกำไร (Japan - eBay×0.87 - $5 ค่าส่ง)</p>
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
