import { STOCK_NUMERIC_FIELDS, type Stock, type StockNumericField } from "@/types/stock";

const MARKET_CAP_CATEGORIES = new Set<Stock["marketCapCategory"]>([
  "large-cap",
  "mid-cap",
  "small-cap",
  "micro-cap",
]);

export function adaptStock(input: Record<string, unknown>): Stock {
  const numericValues = {} as Record<StockNumericField, number>;

  for (let index = 0; index < STOCK_NUMERIC_FIELDS.length; index += 1) {
    const field = STOCK_NUMERIC_FIELDS[index];
    numericValues[field] = parseFiniteNumber(input[field], field);
  }

  const marketCapCategory = parseString(input.marketCapCategory, "marketCapCategory") as Stock["marketCapCategory"];

  if (!MARKET_CAP_CATEGORIES.has(marketCapCategory)) {
    throw new TypeError("marketCapCategory must be a supported market-cap category");
  }

  return {
    symbol: parseString(input.symbol, "symbol"),
    name: parseString(input.name, "name"),
    sector: parseString(input.sector, "sector"),
    industry: parseString(input.industry, "industry"),
    marketCapCategory,
    ...numericValues,
    isWatchlist: parseBoolean(input.isWatchlist, "isWatchlist"),
    lastUpdated: parseDate(input.lastUpdated),
  };
}

export function adaptStocks(inputs: Record<string, unknown>[]): Stock[] {
  const stocks: Stock[] = [];

  for (let index = 0; index < inputs.length; index += 1) {
    stocks.push(adaptStock(inputs[index]));
  }

  return stocks;
}

export function parseFiniteNumber(value: unknown, fieldName: string): number {
  const parsedValue =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim() !== ""
        ? Number(value)
        : Number.NaN;

  if (!Number.isFinite(parsedValue)) {
    throw new TypeError(`${fieldName} must be a finite number`);
  }

  return parsedValue;
}

function parseString(value: unknown, fieldName: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new TypeError(`${fieldName} must be a non-empty string`);
  }

  return value;
}

function parseBoolean(value: unknown, fieldName: string): boolean {
  if (typeof value !== "boolean") {
    throw new TypeError(`${fieldName} must be a boolean`);
  }

  return value;
}

function parseDate(value: unknown): Date {
  const date = value instanceof Date ? value : new Date(value as string | number);

  if (Number.isNaN(date.getTime())) {
    throw new TypeError("lastUpdated must be a valid date");
  }

  return date;
}