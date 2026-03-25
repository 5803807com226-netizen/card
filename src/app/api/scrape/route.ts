import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tracked_card_id, priority } = body;

    // Create a scrape job
    const job = await prisma.scrapeJob.create({
      data: {
        tracked_card_id,
        status: 'pending',
        priority: priority || 3,
        scheduled_at: new Date(),
      },
    });

    // In a real implementation, this would trigger a background worker
    // For now, we simulate a price fetch with mock data
    setTimeout(async () => {
      try {
        await prisma.scrapeJob.update({
          where: { id: job.id },
          data: { status: 'running', started_at: new Date() },
        });

        // Simulate price fetch (mock data)
        const mockEbayPrice = Math.random() * 100 + 10;
        const mockJapanPrice = Math.random() * 80 + 8;

        await prisma.priceLog.create({
          data: {
            tracked_card_id,
            ebay_price: mockEbayPrice,
            japan_price: mockJapanPrice,
            profit: mockJapanPrice - mockEbayPrice * 0.3,
            profit_percent: ((mockJapanPrice - mockEbayPrice * 0.3) / (mockEbayPrice * 0.3)) * 100,
            scrape_status: 'success',
            source_note: 'Mock data - simulated price fetch',
          },
        });

        await prisma.trackedCard.update({
          where: { id: tracked_card_id },
          data: {
            latest_ebay_price: mockEbayPrice,
            latest_japan_price: mockJapanPrice,
            latest_checked_at: new Date(),
          },
        });

        await prisma.scrapeJob.update({
          where: { id: job.id },
          data: { status: 'success', finished_at: new Date() },
        });
      } catch (err) {
        console.error('Scrape job failed:', err);
        await prisma.scrapeJob.update({
          where: { id: job.id },
          data: { status: 'failed', finished_at: new Date() },
        });
      }
    }, 2000);

    return NextResponse.json({ job, message: 'Scrape job queued' });
  } catch (error) {
    console.error('POST /api/scrape error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
