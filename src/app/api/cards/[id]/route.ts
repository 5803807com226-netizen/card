import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const card = await prisma.trackedCard.findUnique({
      where: { id: params.id },
      include: {
        master_card: true,
        price_logs: {
          orderBy: { checked_at: 'desc' },
          take: 90,
        },
        portfolio_records: {
          orderBy: { created_at: 'desc' },
        },
        thai_market_posts: {
          orderBy: { created_at: 'desc' },
        },
      },
    });

    if (!card) {
      return NextResponse.json({ error: 'Card not found' }, { status: 404 });
    }

    return NextResponse.json({ card });
  } catch (error) {
    console.error('GET /api/cards/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const {
      psa_grade,
      ebay_url,
      japan_url,
      thai_price,
      thai_buy_price,
      note,
      label,
      priority_tier,
      current_status,
      latest_ebay_price,
      latest_japan_price,
      latest_thai_price,
      latest_profit,
      latest_profit_percent,
      latest_checked_at,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (psa_grade !== undefined) updateData.psa_grade = psa_grade;
    if (ebay_url !== undefined) updateData.ebay_url = ebay_url;
    if (japan_url !== undefined) updateData.japan_url = japan_url;
    if (thai_price !== undefined) updateData.thai_price = thai_price ? parseFloat(thai_price) : null;
    if (thai_buy_price !== undefined) updateData.thai_buy_price = thai_buy_price ? parseFloat(thai_buy_price) : null;
    if (note !== undefined) updateData.note = note;
    if (label !== undefined) updateData.label = label;
    if (priority_tier !== undefined) updateData.priority_tier = priority_tier;
    if (current_status !== undefined) updateData.current_status = current_status;
    if (latest_ebay_price !== undefined) updateData.latest_ebay_price = latest_ebay_price;
    if (latest_japan_price !== undefined) updateData.latest_japan_price = latest_japan_price;
    if (latest_thai_price !== undefined) updateData.latest_thai_price = latest_thai_price;
    if (latest_profit !== undefined) updateData.latest_profit = latest_profit;
    if (latest_profit_percent !== undefined) updateData.latest_profit_percent = latest_profit_percent;
    if (latest_checked_at !== undefined) updateData.latest_checked_at = latest_checked_at;

    const card = await prisma.trackedCard.update({
      where: { id: params.id },
      data: updateData,
      include: {
        master_card: true,
      },
    });

    return NextResponse.json({ card });
  } catch (error) {
    console.error('PATCH /api/cards/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.trackedCard.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/cards/[id] error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
