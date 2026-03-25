import { NextRequest, NextResponse } from 'next/server';

const USD_JPY_RATE = 150;

// GET /api/snkrdunk?cardId=91118
// Fetches lowest in-stock price from SNKRDUNK for a trading card
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const cardId = searchParams.get('cardId');

  if (!cardId) {
    return NextResponse.json({ error: 'cardId is required' }, { status: 400 });
  }

  // conditionId=22 = PSA 10, In-Stock Only, sorted by lowest price
  const url = `https://snkrdunk.com/en/v1/trading-cards/${cardId}/used-listings?perPage=20&page=1&sortType=price_asc&isOnlyOnSale=true&conditionId=22`;

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'en-US,en;q=0.9,ja;q=0.8',
        'Referer': 'https://snkrdunk.com/',
        'Origin': 'https://snkrdunk.com',
      },
      next: { revalidate: 300 }, // cache 5 minutes
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `SNKRDUNK returned ${res.status}` },
        { status: res.status }
      );
    }

    const data = await res.json();

    // Parse lowest price from response
    // SNKRDUNK returns { usedTradingCards: [...] }
    const listings =
      data?.usedTradingCards ||
      data?.listings ||
      data?.data?.listings ||
      data?.items ||
      data?.data?.items ||
      data?.tradingCardUsedListings ||
      data?.data?.tradingCardUsedListings ||
      data?.usedListings ||
      data?.results ||
      (Array.isArray(data?.data) ? data.data : null) ||
      (Array.isArray(data) ? data : null) ||
      [];

    if (!Array.isArray(listings) || listings.length === 0) {
      const topKeys = typeof data === 'object' && data !== null ? Object.keys(data) : [];
      return NextResponse.json(
        { error: 'No listings found', topKeys },
        { status: 404 }
      );
    }

    // First item is lowest price (sorted price_asc)
    const first = listings[0];

    // Price may be a number (JPY) or string like "US $2500" (USD)
    const rawPrice = first?.price ?? first?.listing_price ?? first?.sell_price ?? first?.amount ?? first?.current_price ?? null;

    if (rawPrice === null) {
      return NextResponse.json({ error: 'Could not parse price', listing: first }, { status: 422 });
    }

    let lowestPriceJPY: number;
    if (typeof rawPrice === 'string' && rawPrice.startsWith('US $')) {
      // Convert USD → JPY
      const usd = parseFloat(rawPrice.replace('US $', '').replace(',', ''));
      lowestPriceJPY = Math.round(usd * USD_JPY_RATE);
    } else {
      lowestPriceJPY = Number(rawPrice);
    }

    return NextResponse.json({
      cardId,
      lowestPriceJPY,
      listingCount: listings.length,
      listing: first,
    });
  } catch (err) {
    console.error('SNKRDUNK fetch error:', err);
    return NextResponse.json({ error: 'Failed to fetch from SNKRDUNK' }, { status: 500 });
  }
}
