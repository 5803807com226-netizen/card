import axios from 'axios';
import { SearchCardResult } from '@/types';

const POKEMON_TCG_API = 'https://api.pokemontcg.io/v2';

interface PokemonCard {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  images?: {
    small?: string;
    large?: string;
  };
  set?: {
    id: string;
    name: string;
    series?: string;
  };
  supertype?: string;
  subtypes?: string[];
}

export async function searchPokemonCards(query: string): Promise<SearchCardResult[]> {
  try {
    const headers: Record<string, string> = {};
    if (process.env.POKEMON_TCG_API_KEY) {
      headers['X-Api-Key'] = process.env.POKEMON_TCG_API_KEY;
    }

    const response = await axios.get(`${POKEMON_TCG_API}/cards`, {
      params: {
        q: `name:${query}*`,
        pageSize: 20,
        select: 'id,name,number,rarity,images,set,supertype,subtypes',
      },
      headers,
    });

    const cards: PokemonCard[] = response.data?.data || [];

    return cards.map((card) => ({
      id: `pokemon_ptcgapi_${card.id}`,
      name: card.name,
      set_name: card.set?.name || '',
      set_code: card.set?.id,
      card_number: card.number,
      rarity: card.rarity,
      image_url: card.images?.small || card.images?.large,
      game_type: 'pokemon' as const,
      source_provider: 'ptcgapi',
      source_card_id: card.id,
    }));
  } catch (error) {
    console.error('Pokemon TCG API error:', error);
    return [];
  }
}
