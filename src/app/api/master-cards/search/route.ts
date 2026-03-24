import { NextRequest, NextResponse } from 'next/server';
import { searchPokemonCards } from '@/lib/api/pokemon-tcg';
import { searchOnePieceCards } from '@/lib/api/one-piece';
import { searchDragonBallCards } from '@/lib/api/dragon-ball';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const game = searchParams.get('game') || 'pokemon';

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] });
    }

    let results = [];

    switch (game) {
      case 'pokemon':
        results = await searchPokemonCards(query);
        break;
      case 'onepiece':
        results = await searchOnePieceCards(query);
        break;
      case 'dragonball':
        results = await searchDragonBallCards(query);
        break;
      default:
        results = await searchPokemonCards(query);
    }

    return NextResponse.json({ results });
  } catch (error) {
    console.error('GET /api/master-cards/search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
