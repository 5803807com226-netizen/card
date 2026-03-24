import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const game = searchParams.get('game') || '';
    const set = searchParams.get('set') || '';
    const psa = searchParams.get('psa') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = (searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

    const where: Record<string, unknown> = {};

    if (search) {
      where.master_card = {
        card_name: { contains: search, mode: 'insensitive' },
      };
    }
    if (game) {
      where.master_card = {
        ...(where.master_card as Record<string, unknown>),
        game_type: game,
      };
    }
    if (set) {
      where.master_card = {
        ...(where.master_card as Record<string, unknown>),
        set_name: { contains: set, mode: 'insensitive' },
      };
    }
    if (psa) {
      where.psa_grade = parseInt(psa);
    }
    if (status) {
      where.current_status = status;
    }

    const orderBy: Record<string, string> = {};
    const sortableFields = [
      'created_at',
      'updated_at',
      'latest_ebay_price',
      'latest_japan_price',
      'latest_thai_price',
      'latest_profit',
      'latest_profit_percent',
    ];
    if (sortableFields.includes(sortBy)) {
      orderBy[sortBy] = sortOrder;
    } else {
      orderBy['created_at'] = 'desc';
    }

    const cards = await prisma.trackedCard.findMany({
      where,
      include: {
        master_card: true,
      },
      orderBy,
    });

    return NextResponse.json({ cards });
  } catch (error) {
    console.error('GET /api/cards error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      game_type,
      source_provider,
      source_card_id,
      card_name,
      set_name,
      set_code,
      card_number,
      image_url,
      rarity,
      psa_grade,
      ebay_url,
      japan_url,
      thai_price,
      thai_buy_price,
      note,
      label,
      priority_tier,
    } = body;

    // Upsert master card
    const masterCard = await prisma.masterCard.upsert({
      where: {
        game_type_source_provider_source_card_id: {
          game_type,
          source_provider,
          source_card_id,
        },
      },
      update: {
        card_name,
        set_name,
        set_code,
        card_number,
        image_url,
        rarity,
      },
      create: {
        game_type,
        source_provider,
        source_card_id,
        card_name,
        set_name,
        set_code,
        card_number,
        image_url,
        rarity,
      },
    });

    const trackedCard = await prisma.trackedCard.create({
      data: {
        master_card_id: masterCard.id,
        psa_grade: psa_grade || null,
        ebay_url: ebay_url || null,
        japan_url: japan_url || null,
        thai_price: thai_price ? parseFloat(thai_price) : null,
        thai_buy_price: thai_buy_price ? parseFloat(thai_buy_price) : null,
        note: note || null,
        label: label || null,
        priority_tier: priority_tier || 'C',
      },
      include: {
        master_card: true,
      },
    });

    return NextResponse.json({ card: trackedCard }, { status: 201 });
  } catch (error) {
    console.error('POST /api/cards error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
