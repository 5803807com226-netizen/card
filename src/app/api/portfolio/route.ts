import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const records = await prisma.portfolioRecord.findMany({
      include: {
        tracked_card: {
          include: {
            master_card: true,
          },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    // Calculate stats
    const holding = records.filter((r) => !r.sell_date).length;
    const sold = records.filter((r) => r.sell_date).length;
    const totalCapital = records.reduce((sum, r) => sum + (r.buy_price || 0), 0);
    const profits = records
      .filter((r) => (r.realized_profit || 0) > 0)
      .reduce((sum, r) => sum + (r.realized_profit || 0), 0);
    const losses = records
      .filter((r) => (r.realized_profit || 0) < 0)
      .reduce((sum, r) => sum + (r.realized_profit || 0), 0);
    const net = profits + losses;

    return NextResponse.json({
      records,
      stats: { holding, sold, totalCapital, profits, losses, net },
    });
  } catch (error) {
    console.error('GET /api/portfolio error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tracked_card_id,
      buy_price,
      buy_date,
      sell_price,
      sell_date,
      sell_platform,
      realized_profit,
      note,
    } = body;

    const record = await prisma.portfolioRecord.create({
      data: {
        tracked_card_id,
        buy_price: buy_price ? parseFloat(buy_price) : null,
        buy_date: buy_date ? new Date(buy_date) : null,
        sell_price: sell_price ? parseFloat(sell_price) : null,
        sell_date: sell_date ? new Date(sell_date) : null,
        sell_platform: sell_platform || null,
        realized_profit: realized_profit ? parseFloat(realized_profit) : null,
        note: note || null,
      },
      include: {
        tracked_card: {
          include: { master_card: true },
        },
      },
    });

    // Update card status if sold
    if (sell_date) {
      await prisma.trackedCard.update({
        where: { id: tracked_card_id },
        data: { current_status: 'sold' },
      });
    }

    return NextResponse.json({ record }, { status: 201 });
  } catch (error) {
    console.error('POST /api/portfolio error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
