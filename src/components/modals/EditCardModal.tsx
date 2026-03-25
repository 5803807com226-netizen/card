'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Save } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { TrackedCard } from '@/types';
import { cn } from '@/lib/utils';

interface EditCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  card: TrackedCard | null;
}

export default function EditCardModal({ isOpen, onClose, onSuccess, card }: EditCardModalProps) {
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    psa_grade: '',
    ebay_url: '',
    japan_url: '',
    thai_price: '',
    thai_buy_price: '',
    note: '',
    label: '',
    priority_tier: 'C',
    current_status: 'tracking',
  });

  useEffect(() => {
    if (card) {
      setForm({
        psa_grade: card.psa_grade?.toString() || '',
        ebay_url: card.ebay_url || '',
        japan_url: card.japan_url || '',
        thai_price: card.thai_price?.toString() || '',
        thai_buy_price: card.thai_buy_price?.toString() || '',
        note: card.note || '',
        label: card.label || '',
        priority_tier: card.priority_tier || 'C',
        current_status: card.current_status || 'tracking',
      });
    }
  }, [card]);

  const handleSave = async () => {
    if (!card) return;
    setSaving(true);

    try {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          psa_grade: form.psa_grade ? parseInt(form.psa_grade) : null,
          ebay_url: form.ebay_url || null,
          japan_url: form.japan_url || null,
          thai_price: form.thai_price || null,
          thai_buy_price: form.thai_buy_price || null,
          note: form.note || null,
          label: form.label || null,
          priority_tier: form.priority_tier,
          current_status: form.current_status,
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
    <Modal isOpen={isOpen} onClose={onClose} title="แก้ไขการ์ด" size="lg">
      <div className="p-6 space-y-4">
        {/* Card preview */}
        {card && (
          <div className="flex items-center gap-3 p-3 bg-surface2 rounded-xl border border-border">
            <div className="w-12 h-16 relative rounded overflow-hidden bg-surface3 shrink-0">
              {card.master_card.image_url ? (
                <Image
                  src={card.master_card.image_url}
                  alt={card.master_card.card_name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted text-xs">?</div>
              )}
            </div>
            <div>
              <div className="font-semibold text-text">{card.master_card.card_name}</div>
              <div className="text-sm text-text-muted">{card.master_card.set_name}</div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>เกรด PSA</label>
            <input
              type="number"
              min="1"
              max="10"
              value={form.psa_grade}
              onChange={(e) => setForm({ ...form, psa_grade: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>ป้าย/ฉลาก</label>
            <input
              type="text"
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>ราคาซื้อ (฿)</label>
            <input
              type="number"
              value={form.thai_buy_price}
              onChange={(e) => setForm({ ...form, thai_buy_price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>ราคาตลาดไทย (฿)</label>
            <input
              type="number"
              value={form.thai_price}
              onChange={(e) => setForm({ ...form, thai_price: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Priority</label>
            <select
              value={form.priority_tier}
              onChange={(e) => setForm({ ...form, priority_tier: e.target.value })}
              className={inputClass}
            >
              {['S', 'A', 'B', 'C'].map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>สถานะ</label>
            <select
              value={form.current_status}
              onChange={(e) => setForm({ ...form, current_status: e.target.value })}
              className={inputClass}
            >
              <option value="tracking">กำลังติดตาม</option>
              <option value="holding">ถือครอง</option>
              <option value="sold">ขายแล้ว</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>eBay URL</label>
          <input
            type="url"
            value={form.ebay_url}
            onChange={(e) => setForm({ ...form, ebay_url: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className={labelClass}>Japan Market URL</label>
          <input
            type="url"
            value={form.japan_url}
            onChange={(e) => setForm({ ...form, japan_url: e.target.value })}
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

      <div className="px-6 py-4 border-t border-border flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onClose}>ยกเลิก</Button>
        <Button variant="primary" onClick={handleSave} loading={saving}>
          <Save size={14} />
          บันทึก
        </Button>
      </div>
    </Modal>
  );
}
