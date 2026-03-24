export type GameType = 'pokemon' | 'onepiece' | 'dragonball';
export type PriorityTier = 'S' | 'A' | 'B' | 'C';
export type CardStatus = 'tracking' | 'holding' | 'sold';
export type ThaiMarketStatus = 'available' | 'sold' | 'unknown';
export type ScrapeJobStatus = 'pending' | 'running' | 'success' | 'failed';

export interface MasterCard {
  id: string;
  game_type: GameType;
  source_provider: string;
  source_card_id: string;
  card_name: string;
  set_name?: string | null;
  set_code?: string | null;
  card_number?: string | null;
  image_url?: string | null;
  rarity?: string | null;
  category?: string | null;
  language_base: string;
  metadata_json?: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

export interface TrackedCard {
  id: string;
  master_card_id: string;
  master_card: MasterCard;
  psa_grade?: number | null;
  ebay_url?: string | null;
  japan_url?: string | null;
  thai_price?: number | null;
  thai_buy_price?: number | null;
  note?: string | null;
  label?: string | null;
  priority_tier: PriorityTier;
  current_status: CardStatus;
  latest_ebay_price?: number | null;
  latest_japan_price?: number | null;
  latest_thai_price?: number | null;
  latest_profit?: number | null;
  latest_profit_percent?: number | null;
  latest_checked_at?: string | null;
  next_check_at?: string | null;
  created_at: string;
  updated_at: string;
  price_logs?: PriceLog[];
  portfolio_records?: PortfolioRecord[];
  thai_market_posts?: ThaiMarketPost[];
}

export interface PriceLog {
  id: string;
  tracked_card_id: string;
  checked_at: string;
  ebay_price?: number | null;
  japan_price?: number | null;
  thai_price?: number | null;
  profit?: number | null;
  profit_percent?: number | null;
  scrape_confidence?: number | null;
  scrape_status?: string | null;
  source_note?: string | null;
  raw_payload_json?: Record<string, unknown> | null;
  created_at: string;
}

export interface PortfolioRecord {
  id: string;
  tracked_card_id: string;
  tracked_card?: TrackedCard;
  buy_price?: number | null;
  buy_date?: string | null;
  sell_price?: number | null;
  sell_date?: string | null;
  sell_platform?: string | null;
  realized_profit?: number | null;
  note?: string | null;
  created_at: string;
}

export interface ThaiMarketPost {
  id: string;
  tracked_card_id: string;
  posted_price?: number | null;
  actual_sold_price?: number | null;
  post_date?: string | null;
  sold_date?: string | null;
  post_url?: string | null;
  source_name?: string | null;
  status: ThaiMarketStatus;
  note?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ScrapeJob {
  id: string;
  tracked_card_id: string;
  status: ScrapeJobStatus;
  priority: number;
  scheduled_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
  retry_count: number;
  error_message?: string | null;
  created_at: string;
}

export interface DashboardStats {
  totalCards: number;
  totalProfit: number;
  totalLoss: number;
  updatedToday: number;
  trend7d: number;
  trend30d: number;
}

export interface PortfolioStats {
  holding: number;
  sold: number;
  totalCapital: number;
  totalProfit: number;
  totalLoss: number;
  net: number;
}

export interface SearchCardResult {
  id: string;
  name: string;
  set_name: string;
  set_code?: string;
  card_number?: string;
  rarity?: string;
  image_url?: string;
  game_type: GameType;
  source_provider: string;
  source_card_id: string;
}

export interface CardFilters {
  search: string;
  game: string;
  set: string;
  psa: string;
  status: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}
