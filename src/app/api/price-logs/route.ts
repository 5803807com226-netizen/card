import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get('cardId');
    const limit = parseInt(searchParams.get('limit') || '30');

    if (!cardId) {
      return NextResponse.json({ error: 'cardId required' }, { status: 400 });
    }

    const logs = await prisma.priceLog.findMany({
      where: { tracked_card_id: cardId },
      orderBy: { checked_at: 'desc' },
      take: limit,
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('GET /api/price-logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tracked_card_id,
      ebay_price,
      japan_price,
      thai_price,
      profit,
      profit_percent,
      scrape_confidence,
      scrape_status,
      source_note,
    } = body;

    const log = await prisma.priceLog.create({
      data: {
        tracked_card_id,
        ebay_price: ebay_price ? parseFloat(ebay_price) : null,
        japan_price: japan_price ? parseFloat(japan_price) : null,
        thai_price: thai_price ? parseFloat(thai_price) : null,
        profit: profit ? parseFloat(profit) : null,
        profit_percent: profit_percent ? parseFloat(profit_percent) : null,
        scrape_confidence: scrape_confidence ? parseFloat(scrape_confidence) : null,
        scrape_status: scrape_status || null,
        source_note: source_note || null,
      },
    });

    // Update tracked card with latest prices
    await prisma.trackedCard.update({
      where: { id: tracked_card_id },
      data: {
        latest_ebay_price: ebay_price ? parseFloat(ebay_price) : undefined,
        latest_japan_price: japan_price ? parseFloat(japan_price) : undefined,
        latest_thai_price: thai_price ? parseFloat(thai_price) : undefined,
        latest_profit: profit ? parseFloat(profit) : undefined,
        latest_profit_percent: profit_percent ? parseFloat(profit_percent) : undefined,
        latest_checked_at: new Date(),
      },
    });

    return NextResponse.json({ log }, { status: 201 });
  } catch (error) {
    console.error('POST /api/price-logs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
