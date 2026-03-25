'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { Search, ChevronRight, ChevronLeft, Check, Loader2, PenLine } from 'lucide-react';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { SearchCardResult, GameType } from '@/types';
import { cn } from '@/lib/utils';

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type Step = 1 | 2 | 3 | 4;

const GAMES: { value: GameType; label: string; description: string; color: string }[] = [
  { value: 'pokemon', label: 'Pokémon', description: 'Pokemon Trading Card Game', color: 'border-yellow-500/40 bg-yellow-500/5 hover:bg-yellow-500/10' },
  { value: 'onepiece', label: 'One Piece', description: 'One Piece Card Game', color: 'border-red-500/40 bg-red-500/5 hover:bg-red-500/10' },
  { value: 'dragonball', label: 'Dragon Ball', description: 'Dragon Ball Super Card Game', color: 'border-orange-500/40 bg-orange-500/5 hover:bg-orange-500/10' },
];

export default function AddCardModal({ isOpen, onClose, onSuccess }: AddCardModalProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedGame, setSelectedGame] = useState<GameType>('pokemon');
  const [mode, setMode] = useState<'search' | 'manual'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchCardResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCard, setSelectedCard] = useState<SearchCardResult | null>(null);
  const [saving, setSaving] = useState(false);
  const [manualCard, setManualCard] = useState({
    card_name: '',
    set_name: '',
    card_number: '',
    rarity: '',
    image_url: '',
  });
  const [form, setForm] = useState({
    psa_grade: '',
    ebay_url: '',
    japan_url: '',
    thai_price: '',
    thai_buy_price: '',
    note: '',
    label: '',
    priority_tier: 'C',
  });

  const searchTimeout = useRef<NodeJS.Timeout>();

  const resetAll = () => {
    setStep(1);
    setSelectedGame('pokemon');
    setMode('search');
    setSearchQuery('');
    setSearchResults([]);
    setSelectedCard(null);
    setSaving(false);
    setManualCard({ card_name: '', set_name: '', card_number: '', rarity: '', image_url: '' });
    setForm({
      psa_grade: '',
      ebay_url: '',
      japan_url: '',
      thai_price: '',
      thai_buy_price: '',
      note: '',
      label: '',
      priority_tier: 'C',
    });
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  // Debounced search
  useEffect(() => {
    if (step !== 2 || !searchQuery || searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    clearTimeout(searchTimeout.current);
    setSearching(true);

    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/master-cards/search?q=${encodeURIComponent(searchQuery)}&game=${selectedGame}`
        );
        const data = await res.json();
        setSearchResults(data.results || []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 400);

    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery, selectedGame, step]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const cardData = mode === 'manual'
        ? {
            game_type: selectedGame,
            source_provider: 'manual',
            source_card_id: `manual_${Date.now()}`,
            card_name: manualCard.card_name,
            set_name: manualCard.set_name || undefined,
            card_number: manualCard.card_number || undefined,
            image_url: manualCard.image_url || undefined,
            rarity: manualCard.rarity || undefined,
          }
        : {
            game_type: selectedCard!.game_type,
            source_provider: selectedCard!.source_provider,
            source_card_id: selectedCard!.source_card_id,
            card_name: selectedCard!.name,
            set_name: selectedCard!.set_name,
            set_code: selectedCard!.set_code,
            card_number: selectedCard!.card_number,
            image_url: selectedCard!.image_url,
            rarity: selectedCard!.rarity,
          };

      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...cardData,
          psa_grade: form.psa_grade ? parseInt(form.psa_grade) : undefined,
          ebay_url: form.ebay_url || undefined,
          japan_url: form.japan_url || undefined,
          thai_price: form.thai_price || undefined,
          thai_buy_price: form.thai_buy_price || undefined,
          note: form.note || undefined,
          label: form.label || undefined,
          priority_tier: form.priority_tier,
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

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      {/* Header with steps */}
      <div className="px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-text">เพิ่มการ์ดใหม่</h2>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text transition-colors text-sm"
          >
            ✕
          </button>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2">
          {([1, 2, 3, 4] as Step[]).map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  'w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all',
                  step === s
                    ? 'bg-primary text-white'
                    : step > s
                    ? 'bg-success text-white'
                    : 'bg-surface3 text-text-muted'
                )}
              >
                {step > s ? <Check size={12} /> : s}
              </div>
              <span
                className={cn(
                  'text-xs hidden sm:block',
                  step === s ? 'text-text font-medium' : 'text-text-muted'
                )}
              >
                {s === 1 ? 'เลือกเกม' : s === 2 ? 'ค้นหา' : s === 3 ? 'เลือกการ์ด' : 'รายละเอียด'}
              </span>
              {s < 4 && <ChevronRight size={12} className="text-text-muted" />}
            </div>
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="p-6">
        {/* Step 1: Select game */}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-text-muted mb-4">เลือกประเภทเกมการ์ดที่ต้องการเพิ่ม</p>
            {GAMES.map((game) => (
              <button
                key={game.value}
                onClick={() => setSelectedGame(game.value)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border transition-all text-left',
                  selectedGame === game.value
                    ? 'border-primary bg-primary/10'
                    : game.color + ' border'
                )}
              >
                <div className="flex-1">
                  <div className="font-semibold text-text">{game.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{game.description}</div>
                </div>
                {selectedGame === game.value && (
                  <Check size={16} className="text-primary shrink-0" />
                )}
              </button>
            ))}
          </div>
        )}

        {/* Step 2: Search or Manual */}
        {step === 2 && (
          <div className="space-y-4">
            {/* Mode toggle */}
            <div className="flex gap-2 p-1 bg-surface2 rounded-lg">
              <button
                onClick={() => setMode('search')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
                  mode === 'search' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-text'
                )}
              >
                <Search size={14} />
                ค้นหาจาก API
              </button>
              <button
                onClick={() => setMode('manual')}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all',
                  mode === 'manual' ? 'bg-primary text-white shadow' : 'text-text-muted hover:text-text'
                )}
              >
                <PenLine size={14} />
                กรอกเอง (Manual)
              </button>
            </div>

            {/* Search mode */}
            {mode === 'search' && (
              <>
                <p className="text-sm text-text-muted">ค้นหาการ์ดจาก {GAMES.find(g => g.value === selectedGame)?.label}</p>
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
                  <input
                    autoFocus
                    type="text"
                    placeholder="พิมพ์ชื่อการ์ด..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-surface2 border border-border rounded-lg pl-10 pr-4 py-3 text-sm text-text placeholder-text-muted focus:outline-none focus:border-primary transition-colors"
                  />
                  {searching && (
                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {searchResults.length === 0 && searchQuery.length >= 2 && !searching && (
                    <div className="text-center py-8 text-text-muted text-sm">ไม่พบการ์ดที่ค้นหา</div>
                  )}
                  {searchResults.map((card) => (
                    <button
                      key={card.id}
                      onClick={() => { setSelectedCard(card); setStep(3); }}
                      className="w-full flex items-center gap-3 p-3 rounded-lg border border-border hover:border-primary/50 hover:bg-surface2 transition-all text-left"
                    >
                      <div className="w-10 h-14 relative rounded overflow-hidden bg-surface3 shrink-0">
                        {card.image_url ? (
                          <Image src={card.image_url} alt={card.name} fill className="object-cover" unoptimized />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-text-muted">?</div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-text truncate">{card.name}</div>
                        <div className="text-xs text-text-muted mt-0.5">{card.set_name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          {card.card_number && <span className="text-xs bg-surface3 px-1.5 py-0.5 rounded">{card.card_number}</span>}
                          {card.rarity && <span className="text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded">{card.rarity}</span>}
                        </div>
                      </div>
                      <ChevronRight size={14} className="text-text-muted shrink-0" />
                    </button>
                  ))}
                </div>
              </>
            )}

            {/* Manual mode */}
            {mode === 'manual' && (
              <div className="space-y-3">
                <p className="text-sm text-text-muted">กรอกข้อมูลการ์ดด้วยตนเอง</p>
                <div>
                  <label className={labelClass}>ชื่อการ์ด *</label>
                  <input
                    autoFocus
                    type="text"
                    placeholder="เช่น Charizard VMAX, Kaido SR"
                    value={manualCard.card_name}
                    onChange={(e) => setManualCard({ ...manualCard, card_name: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>ชื่อเซ็ต</label>
                    <input
                      type="text"
                      placeholder="เช่น Hidden Fates"
                      value={manualCard.set_name}
                      onChange={(e) => setManualCard({ ...manualCard, set_name: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>เลขการ์ด</label>
                    <input
                      type="text"
                      placeholder="เช่น SV49/SV94"
                      value={manualCard.card_number}
                      onChange={(e) => setManualCard({ ...manualCard, card_number: e.target.value })}
                      className={inputClass}
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>ความหายาก</label>
                  <input
                    type="text"
                    placeholder="เช่น Secret Rare, SAR, UR"
                    value={manualCard.rarity}
                    onChange={(e) => setManualCard({ ...manualCard, rarity: e.target.value })}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className={labelClass}>URL รูปภาพการ์ด</label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={manualCard.image_url}
                    onChange={(e) => setManualCard({ ...manualCard, image_url: e.target.value })}
                    className={inputClass}
                  />
                </div>
                {manualCard.image_url && (
                  <div className="flex justify-center">
                    <div className="w-20 h-28 relative rounded-lg overflow-hidden bg-surface3 border border-border">
                      <Image src={manualCard.image_url} alt="preview" fill className="object-cover" unoptimized />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Confirm card */}
        {step === 3 && (mode === 'search' ? selectedCard : manualCard.card_name) && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">ยืนยันการ์ดที่เลือก</p>
            <div className="flex items-start gap-4 p-4 bg-surface2 rounded-xl border border-border">
              <div className="w-20 h-28 relative rounded-lg overflow-hidden bg-surface3 shrink-0">
                {(mode === 'search' ? selectedCard?.image_url : manualCard.image_url) ? (
                  <Image
                    src={(mode === 'search' ? selectedCard!.image_url : manualCard.image_url)!}
                    alt={mode === 'search' ? selectedCard!.name : manualCard.card_name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-text-muted text-2xl">?</div>
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-lg text-text">
                  {mode === 'search' ? selectedCard!.name : manualCard.card_name}
                </div>
                <div className="text-text-muted mt-1">
                  {mode === 'search' ? selectedCard!.set_name : manualCard.set_name}
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {(mode === 'search' ? selectedCard!.card_number : manualCard.card_number) && (
                    <span className="text-xs bg-surface3 px-2 py-1 rounded border border-border">
                      #{mode === 'search' ? selectedCard!.card_number : manualCard.card_number}
                    </span>
                  )}
                  {(mode === 'search' ? selectedCard!.rarity : manualCard.rarity) && (
                    <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">
                      {mode === 'search' ? selectedCard!.rarity : manualCard.rarity}
                    </span>
                  )}
                  <span className="text-xs bg-surface3 px-2 py-1 rounded border border-border capitalize">
                    {mode === 'search' ? selectedCard!.game_type : selectedGame}
                  </span>
                  {mode === 'manual' && (
                    <span className="text-xs bg-yellow-500/10 text-yellow-400 px-2 py-1 rounded border border-yellow-500/20">
                      Manual
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Details form */}
        {step === 4 && selectedCard && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">กรอกรายละเอียดเพิ่มเติม</p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelClass}>เกรด PSA</label>
                <input
                  type="number"
                  min="1"
                  max="10"
                  placeholder="เช่น 10"
                  value={form.psa_grade}
                  onChange={(e) => setForm({ ...form, psa_grade: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ป้าย/ฉลาก</label>
                <input
                  type="text"
                  placeholder="เช่น Grail, Target"
                  value={form.label}
                  onChange={(e) => setForm({ ...form, label: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ราคาซื้อ (฿)</label>
                <input
                  type="number"
                  placeholder="ราคาที่ซื้อมา"
                  value={form.thai_buy_price}
                  onChange={(e) => setForm({ ...form, thai_buy_price: e.target.value })}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>ราคาตลาดไทย (฿)</label>
                <input
                  type="number"
                  placeholder="ราคาตลาดปัจจุบัน"
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
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className={labelClass}>eBay URL</label>
              <input
                type="url"
                placeholder="https://www.ebay.com/..."
                value={form.ebay_url}
                onChange={(e) => setForm({ ...form, ebay_url: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Japan Market URL</label>
              <input
                type="url"
                placeholder="https://..."
                value={form.japan_url}
                onChange={(e) => setForm({ ...form, japan_url: e.target.value })}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>หมายเหตุ</label>
              <textarea
                rows={2}
                placeholder="บันทึกเพิ่มเติม..."
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className={cn(inputClass, 'resize-none')}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-border flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => {
            if (step === 1) handleClose();
            else setStep((prev) => (prev - 1) as Step);
          }}
        >
          <ChevronLeft size={14} />
          {step === 1 ? 'ยกเลิก' : 'ย้อนกลับ'}
        </Button>

        {step < 4 ? (
          <Button
            variant="primary"
            onClick={() => {
              if (step === 1) setStep(2);
              else if (step === 2) {
                if (mode === 'manual' && manualCard.card_name) setStep(3);
                else if (mode === 'search' && selectedCard) setStep(3);
              } else if (step === 3) setStep(4);
            }}
            disabled={
              (step === 2 && mode === 'search' && !selectedCard) ||
              (step === 2 && mode === 'manual' && !manualCard.card_name) ||
              (step === 3 && mode === 'search' && !selectedCard) ||
              (step === 3 && mode === 'manual' && !manualCard.card_name)
            }
          >
            {step === 3 ? 'กรอกรายละเอียด' : 'ถัดไป'}
            <ChevronRight size={14} />
          </Button>
        ) : (
          <Button variant="primary" onClick={handleSave} loading={saving}>
            <Check size={14} />
            บันทึกการ์ด
          </Button>
        )}
      </div>
    </Modal>
  );
}
