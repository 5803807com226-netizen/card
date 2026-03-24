import axios from 'axios';
import { SearchCardResult } from '@/types';

const TCGDEX_API = 'https://api.tcgdex.net/v2/en';

interface TCGDexCard {
  id: string;
  localId: string;
  name: string;
  image?: string;
  rarity?: string;
  category?: string;
  set?: {
    id: string;
    name: string;
  };
}

// Mock One Piece card data since there's no well-known free public API
const MOCK_ONE_PIECE_CARDS: SearchCardResult[] = [
  {
    id: 'onepiece_mock_OP01-001',
    name: 'Monkey.D.Luffy',
    set_name: 'Romance Dawn',
    set_code: 'OP01',
    card_number: 'OP01-001',
    rarity: 'L',
    image_url: 'https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-001_EN.webp',
    game_type: 'onepiece',
    source_provider: 'mock',
    source_card_id: 'OP01-001',
  },
  {
    id: 'onepiece_mock_OP01-002',
    name: 'Roronoa Zoro',
    set_name: 'Romance Dawn',
    set_code: 'OP01',
    card_number: 'OP01-002',
    rarity: 'SR',
    image_url: 'https://limitlesstcg.nyc3.cdn.digitaloceanspaces.com/one-piece/OP01/OP01-002_EN.webp',
    game_type: 'onepiece',
    source_provider: 'mock',
    source_card_id: 'OP01-002',
  },
  {
    id: 'onepiece_mock_OP01-003',
    name: 'Nami',
    set_name: 'Romance Dawn',
    set_code: 'OP01',
    card_number: 'OP01-003',
    rarity: 'R',
    image_url: undefined,
    game_type: 'onepiece',
    source_provider: 'mock',
    source_card_id: 'OP01-003',
  },
  {
    id: 'onepiece_mock_OP02-001',
    name: 'Monkey.D.Luffy',
    set_name: 'Paramount War',
    set_code: 'OP02',
    card_number: 'OP02-001',
    rarity: 'L',
    image_url: undefined,
    game_type: 'onepiece',
    source_provider: 'mock',
    source_card_id: 'OP02-001',
  },
];

export async function searchOnePieceCards(query: string): Promise<SearchCardResult[]> {
  try {
    // Try TCGDex first
    const response = await axios.get(`${TCGDEX_API}/cards`, {
      params: { name: query },
      timeout: 5000,
    });

    const cards: TCGDexCard[] = response.data || [];
    if (cards.length > 0) {
      return cards.slice(0, 20).map((card) => ({
        id: `onepiece_tcgdex_${card.id}`,
        name: card.name,
        set_name: card.set?.name || '',
        set_code: card.set?.id,
        card_number: card.localId,
        rarity: card.rarity,
        image_url: card.image ? `${card.image}/high.webp` : undefined,
        game_type: 'onepiece' as const,
        source_provider: 'tcgdex',
        source_card_id: card.id,
      }));
    }
  } catch {
    // Fall through to mock data
  }

  // Fallback to mock data
  const q = query.toLowerCase();
  return MOCK_ONE_PIECE_CARDS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.card_number && c.card_number.toLowerCase().includes(q)) ||
      c.set_name.toLowerCase().includes(q)
  );
}
