import { SearchCardResult } from '@/types';

const MOCK_DRAGONBALL_CARDS: SearchCardResult[] = [
  {
    id: 'dragonball_mock_BT1-001',
    name: 'Son Goku',
    set_name: 'Galactic Battle',
    set_code: 'BT1',
    card_number: 'BT1-001',
    rarity: 'SCR',
    image_url: undefined,
    game_type: 'dragonball',
    source_provider: 'mock',
    source_card_id: 'BT1-001',
  },
  {
    id: 'dragonball_mock_BT1-002',
    name: 'Vegeta',
    set_name: 'Galactic Battle',
    set_code: 'BT1',
    card_number: 'BT1-002',
    rarity: 'SR',
    image_url: undefined,
    game_type: 'dragonball',
    source_provider: 'mock',
    source_card_id: 'BT1-002',
  },
  {
    id: 'dragonball_mock_BT2-001',
    name: 'Gohan',
    set_name: 'Union Force',
    set_code: 'BT2',
    card_number: 'BT2-001',
    rarity: 'SR',
    image_url: undefined,
    game_type: 'dragonball',
    source_provider: 'mock',
    source_card_id: 'BT2-001',
  },
  {
    id: 'dragonball_mock_BT3-001',
    name: 'Frieza',
    set_name: 'Cross Worlds',
    set_code: 'BT3',
    card_number: 'BT3-001',
    rarity: 'SCR',
    image_url: undefined,
    game_type: 'dragonball',
    source_provider: 'mock',
    source_card_id: 'BT3-001',
  },
  {
    id: 'dragonball_mock_BT4-001',
    name: 'Piccolo',
    set_name: 'Colossal Warfare',
    set_code: 'BT4',
    card_number: 'BT4-001',
    rarity: 'SR',
    image_url: undefined,
    game_type: 'dragonball',
    source_provider: 'mock',
    source_card_id: 'BT4-001',
  },
];

export async function searchDragonBallCards(query: string): Promise<SearchCardResult[]> {
  const q = query.toLowerCase();
  return MOCK_DRAGONBALL_CARDS.filter(
    (c) =>
      c.name.toLowerCase().includes(q) ||
      (c.card_number && c.card_number.toLowerCase().includes(q)) ||
      c.set_name.toLowerCase().includes(q)
  );
}
