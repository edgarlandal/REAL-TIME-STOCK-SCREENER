export type FilterCategory =
  | "identity"
  | "market-data"
  | "volume"
  | "price-range"
  | "valuation"
  | "profitability"
  | "financial-health"
  | "ownership"
  | "technical"
  | "watchlist"
  | "metadata";

export type FilterField =
  | "symbol"
  | "name"
  | "sector"
  | "industry"
  | "marketCapCategory"
  | "price"
  | "ltp"
  | "change"
  | "changePercent"
  | "open"
  | "high"
  | "low"
  | "close"
  | "volume"
  | "avgVolume30"
  | "fiftyTwoWeekHigh"
  | "fiftyTwoWeekLow"
  | "pe"
  | "pb"
  | "roe"
  | "roce"
  | "debtToEquity"
  | "dividendYield"
  | "eps"
  | "promoterHolding"
  | "freeCashFlow"
  | "rsi14"
  | "sma20"
  | "sma50"
  | "sma200"
  | "macd"
  | "macdSignal"
  | "volumeProfilePeak"
  | "isWatchlist"
  | "lastUpdated";

export interface RangeFilter {
  min: number;
  max: number;
}

export interface MultiSelectFilter {
  values: string[];
}

export interface BooleanFilter {
  value: boolean;
}

export type FilterOperator = "between" | "in" | "equals";

export interface FilterCondition {
  id: string;
  field: FilterField;
  category: FilterCategory;
  operator: FilterOperator;
  filter: RangeFilter | MultiSelectFilter | BooleanFilter;
}

export interface FilterGroup {
  id: string;
  logic: "AND" | "OR";
  criteria: FilterNode[];
}

export type FilterNode = FilterCondition | FilterGroup;

export interface FilterPreset {
  id: string;
  name: string;
  description: string;
  criteria: FilterGroup;
}

export const FILTER_FIELDS_BY_CATEGORY: Record<FilterCategory, readonly FilterField[]> = {
  identity: ["symbol", "name", "sector", "industry", "marketCapCategory"],
  "market-data": ["price", "ltp", "change", "changePercent", "open", "high", "low", "close"],
  volume: ["volume", "avgVolume30", "volumeProfilePeak"],
  "price-range": ["fiftyTwoWeekHigh", "fiftyTwoWeekLow"],
  valuation: ["pe", "pb", "dividendYield", "eps"],
  profitability: ["roe", "roce", "freeCashFlow"],
  "financial-health": ["debtToEquity"],
  ownership: ["promoterHolding"],
  technical: ["rsi14", "sma20", "sma50", "sma200", "macd", "macdSignal"],
  watchlist: ["isWatchlist"],
  metadata: ["lastUpdated"],
};