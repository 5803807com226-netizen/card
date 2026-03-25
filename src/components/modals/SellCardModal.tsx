'use client';

import { useState } from 'react';
import Image from 'next/image';
import { DollarSign } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { TrackedCard } from '@/types';
import { cn } from '@/lib/utils';

interface SellCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  card: TrackedCard | null;
}

export default function SellCardModal({ isOpen, onClose, onSuccess, card }: SellCardModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    buy_price: '',
    buy_date: '',
    sell_price: '',
    sell_date: new Date().toISOString().split('T')[0],
    sell_platform: '',
    note: '',
  });

  const realizedProfit =
    form.sell_price && form.buy_price
      ? parseFloat(form.sell_price) - parseFloat(form.buy_price)
      : null;

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);

    try {
      const res = await fetch('/api/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracked_card_id: card.id,
          buy_price: form.buy_price || null,
          buy_date: form.buy_date || null,
          sell_price: form.sell_price || null,
          sell_date: form.sell_date || null,
          sell_platform: form.sell_platform || null,
          realized_profit: realizedProfit,
          note: form.note || null,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
        setForm({
          buy_price: '',
          buy_date: '',
          sell_price: '',
          sell_date: new Date().toISOString().split('T')[0],
          sell_platform: '',
          note: '',
        });
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-xs font-medium text-text-muted mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="บันทึกการซื้อ/ขาย" size="md">
      <div className="p-6 space-y-4">
        {card && (
          <div className="flex items-center gap-3 p-3 bg-surface2 rounded-xl border border-border">
            <div className="w-10 h-14 relative rounded overflow-hidden bg-surface3 shrink-0">
              {card.master_card.image_url ? (
                <Image src={card.master_card.image_url} alt={card.master_card.card_name} fill className="object-cover" unoptimized />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">?</div>
              )}
            </div>
            <div>
              <div className="font-semibold text-text">{card.master_card.card_name}</div>
              <div className="text-xs text-text-muted">{card.master_card.set_name}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>ราคาซื้อ (฿)</label>
            <input
              type="number"
              placeholder="0"
              value={form.buy_price}
              onChange={(e) => setForm({ ...form, buy_price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>วันที่ซื้อ</label>
            <input
              type="date"
              value={form.buy_date}
              onChange={(e) => setForm({ ...form, buy_date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>ราคาขาย (฿)</label>
            <input
              type="number"
              placeholder="0"
              value={form.sell_price}
              onChange={(e) => setForm({ ...form, sell_price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>วันที่ขาย</label>
            <input
              type="date"
              value={form.sell_date}
              onChange={(e) => setForm({ ...form, sell_date: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>แพลตฟอร์ม</label>
          <select
            value={form.sell_platform}
            onChange={(e) => setForm({ ...form, sell_platform: e.target.value })}
            className={inputClass}
          >
            <option value="">เลือกแพลตฟอร์ม</option>
            <option value="Facebook Group">Facebook Group</option>
            <option value="LINE">LINE</option>
            <option value="Shopee">Shopee</option>
            <option value="Lazada">Lazada</option>
            <option value="eBay">eBay</option>
            <option value="Other">อื่นๆ</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>หมายเหตุ</label>
          <textarea
            rows={2}
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            className={cn(inputClass, 'resize-none')}
          />
        </div>

        {realizedProfit !== null && (
          <div
            className={cn(
              'p-3 rounded-lg border text-sm font-medium flex items-center gap-2',
              realizedProfit >= 0
                ? 'bg-success/10 border-success/20 text-success'
                : 'bg-danger/10 border-danger/20 text-danger'
            )}
          >
            <DollarSign size={16} />
            กำไร/ขาดทุน: {realizedProfit >= 0 ? '+' : ''}฿{realizedProfit.toLocaleString()}
          </div>
        )}
      </div>

      <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>ยกเลิก</Button>
        <Button variant="success" onClick={handleSave} loading={saving}>
          <DollarSign size={14} />
          บันทึก
        </Button>
      </div>
    </Modal>
  );
}
