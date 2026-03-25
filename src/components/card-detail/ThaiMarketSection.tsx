'use client';

import { useState } from 'react';
import { Plus, ExternalLink } from 'lucide-react';
import Button from '@/components/ui/Button';
import ThaiMarketModal from '@/components/modals/ThaiMarketModal';
import { TrackedCard, ThaiMarketPost } from '@/types';
import { formatPriceTHB, formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface ThaiMarketSectionProps {
  card: TrackedCard;
  onUpdate: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  available: 'วางขายอยู่',
  sold: 'ขายแล้ว',
  unknown: 'ไม่ทราบ',
};

const STATUS_COLORS: Record<string, string> = {
  available: 'bg-success/10 text-success border-success/20',
  sold: 'bg-danger/10 text-danger border-danger/20',
  unknown: 'bg-surface3 text-text-muted border-border',
};

export default function ThaiMarketSection({ card, onUpdate }: ThaiMarketSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const posts = card.thai_market_posts || [];
  const avgPosted = posts.length
    ? posts.reduce((sum, p) => sum + (p.posted_price || 0), 0) / posts.length
    : null;
  const soldPosts = posts.filter((p) => p.status === 'sold');
  const avgSold = soldPosts.length
    ? soldPosts.reduce((sum, p) => sum + (p.actual_sold_price || 0), 0) / soldPosts.length
    : null;

  return (
    <div>
      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-surface2 rounded-lg p-3 border border-border">
          <div className="text-xs text-text-muted">โพสต์ทั้งหมด</div>
          <div className="text-xl font-bold text-text mt-1">{posts.length}</div>
        </div>
        <div className="bg-surface2 rounded-lg p-3 border border-border">
          <div className="text-xs text-text-muted">ขายแล้ว</div>
          <div className="text-xl font-bold text-success mt-1">{soldPosts.length}</div>
        </div>
        <div className="bg-surface2 rounded-lg p-3 border border-border">
          <div className="text-xs text-text-muted">ราคาลงขายเฉลี่ย</div>
          <div className="text-xl font-bold text-text mt-1">{formatPriceTHB(avgPosted)}</div>
        </div>
        <div className="bg-surface2 rounded-lg p-3 border border-border">
          <div className="text-xs text-text-muted">ราคาขายจริงเฉลี่ย</div>
          <div className="text-xl font-bold text-warning mt-1">{formatPriceTHB(avgSold)}</div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h3 className="font-medium text-text">รายการโพสต์ตลาดไทย</h3>
          <Button size="sm" variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={13} />
            เพิ่มโพสต์
          </Button>
        </div>

        {posts.length === 0 ? (
          <div className="p-8 text-center text-text-muted text-sm">
            ยังไม่มีข้อมูลตลาดไทย
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="px-4 py-2 text-left text-xs text-text-muted font-medium">แหล่งที่มา</th>
                <th className="px-4 py-2 text-right text-xs text-text-muted font-medium">ราคาลงขาย</th>
                <th className="px-4 py-2 text-right text-xs text-text-muted font-medium">ราคาที่ขายได้</th>
                <th className="px-4 py-2 text-center text-xs text-text-muted font-medium">สถานะ</th>
                <th className="px-4 py-2 text-center text-xs text-text-muted font-medium">วันที่</th>
                <th className="px-4 py-2 text-center text-xs text-text-muted font-medium">ลิงก์</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id} className="border-b border-border/50 hover:bg-surface2/50">
                  <td className="px-4 py-2 text-text-secondary">
                    {post.source_name || '-'}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-text">
                    {formatPriceTHB(post.posted_price)}
                  </td>
                  <td className="px-4 py-2 text-right font-medium text-warning">
                    {formatPriceTHB(post.actual_sold_price)}
                  </td>
                  <td className="px-4 py-2 text-center">
                    <span
                      className={cn(
                        'inline-flex px-2 py-0.5 rounded text-xs font-medium border',
                        STATUS_COLORS[post.status] || STATUS_COLORS.unknown
                      )}
                    >
                      {STATUS_LABELS[post.status] || post.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-center text-xs text-text-muted">
                    {post.post_date ? formatDate(post.post_date) : '-'}
                  </td>
                  <td className="px-4 py-2 text-center">
                    {post.post_url ? (
                      <a
                        href={post.post_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors text-xs"
                      >
                        <ExternalLink size={12} />
                        ดูโพสต์
                      </a>
                    ) : (
                      <span className="text-text-muted">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ThaiMarketModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={onUpdate}
        card={card}
      />
    </div>
  );
}
