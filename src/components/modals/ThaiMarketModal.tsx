'use client';

import { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { TrackedCard } from '@/types';
import { cn } from '@/lib/utils';

interface ThaiMarketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  card: TrackedCard | null;
}

export default function ThaiMarketModal({ isOpen, onClose, onSuccess, card }: ThaiMarketModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    posted_price: '',
    actual_sold_price: '',
    post_date: new Date().toISOString().split('T')[0],
    sold_date: '',
    post_url: '',
    source_name: '',
    status: 'available',
    note: '',
  });

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);

    try {
      const res = await fetch('/api/thai-market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tracked_card_id: card.id,
          ...form,
          posted_price: form.posted_price || null,
          actual_sold_price: form.actual_sold_price || null,
          post_date: form.post_date || null,
          sold_date: form.sold_date || null,
          post_url: form.post_url || null,
          source_name: form.source_name || null,
          note: form.note || null,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-surface2 border border-border rounded-lg px-3 py-2 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary transition-colors';
  const labelClass = 'block text-xs font-medium text-text-muted mb-1';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="เพิ่มข้อมูลตลาดไทย" size="md">
      <div className="p-6 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>ราคาลงขาย (฿)</label>
            <input
              type="number"
              placeholder="0"
              value={form.posted_price}
              onChange={(e) => setForm({ ...form, posted_price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>ราคาที่ขายได้จริง (฿)</label>
            <input
              type="number"
              placeholder="0"
              value={form.actual_sold_price}
              onChange={(e) => setForm({ ...form, actual_sold_price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>วันที่ลงขาย</label>
            <input
              type="date"
              value={form.post_date}
              onChange={(e) => setForm({ ...form, post_date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>วันที่ขายได้</label>
            <input
              type="date"
              value={form.sold_date}
              onChange={(e) => setForm({ ...form, sold_date: e.target.value })}
              className={inputClass}
            />
          </div>
        </div>

        <div>
          <label className={labelClass}>แหล่งที่มา</label>
          <select
            value={form.source_name}
            onChange={(e) => setForm({ ...form, source_name: e.target.value })}
            className={inputClass}
          >
            <option value="">เลือกแหล่งที่มา</option>
            <option value="Facebook Group Pokemon">Facebook Group Pokemon</option>
            <option value="Facebook Group One Piece">Facebook Group One Piece</option>
            <option value="LINE OA">LINE OA</option>
            <option value="Shopee">Shopee</option>
            <option value="ร้านค้า">ร้านค้า</option>
            <option value="อื่นๆ">อื่นๆ</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>สถานะ</label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className={inputClass}
          >
            <option value="available">วางขายอยู่</option>
            <option value="sold">ขายแล้ว</option>
            <option value="unknown">ไม่ทราบ</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>URL โพสต์</label>
          <input
            type="url"
            placeholder="https://..."
            value={form.post_url}
            onChange={(e) => setForm({ ...form, post_url: e.target.value })}
            className={inputClass}
          />
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
      </div>

      <div className="px-6 py-4 border-t border-border flex justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>ยกเลิก</Button>
        <Button variant="primary" onClick={handleSave} loading={saving}>
          <ShoppingBag size={14} />
          บันทึก
        </Button>
      </div>
    </Modal>
  );
}
