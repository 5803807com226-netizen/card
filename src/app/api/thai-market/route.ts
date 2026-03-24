import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const cardId = searchParams.get('cardId');

    const where = cardId ? { tracked_card_id: cardId } : {};

    const posts = await prisma.thaiMarketPost.findMany({
      where,
      include: {
        tracked_card: {
          include: { master_card: true },
        },
      },
      orderBy: { created_at: 'desc' },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error('GET /api/thai-market error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      tracked_card_id,
      posted_price,
      actual_sold_price,
      post_date,
      sold_date,
      post_url,
      source_name,
      status,
      note,
    } = body;

    const post = await prisma.thaiMarketPost.create({
      data: {
        tracked_card_id,
        posted_price: posted_price ? parseFloat(posted_price) : null,
        actual_sold_price: actual_sold_price ? parseFloat(actual_sold_price) : null,
        post_date: post_date ? new Date(post_date) : null,
        sold_date: sold_date ? new Date(sold_date) : null,
        post_url: post_url || null,
        source_name: source_name || null,
        status: status || 'available',
        note: note || null,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error('POST /api/thai-market error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 });

    const body = await req.json();
    const post = await prisma.thaiMarketPost.update({
      where: { id },
      data: body,
    });

    return NextResponse.json({ post });
  } catch (error) {
    console.error('PATCH /api/thai-market error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
