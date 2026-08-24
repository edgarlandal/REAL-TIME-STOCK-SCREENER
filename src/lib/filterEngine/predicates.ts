import type { Stock } from "@/types/stock";

export interface StockPredicateCriteria {
  isWatchlist?: boolean;
  sectors?: readonly string[];
  industries?: readonly string[];
  minPrice?: number;
  maxPrice?: number;
  minPE?: number;
  maxPE?: number;
  minPB?: number;
  maxPB?: number;
  minRSI?: number;
  maxRSI?: number;
  minVolume?: number;
  maxVolume?: number;
  minROE?: number;
  maxROE?: number;
  minROCE?: number;
  maxROCE?: number;
  minDividendYield?: number;
  maxDividendYield?: number;
  minDebtToEquity?: number;
  maxDebtToEquity?: number;
}

export const minPrice = (stock: Stock, value: number): boolean => stock.price >= value;
export const maxPrice = (stock: Stock, value: number): boolean => stock.price <= value;
export const minPE = (stock: Stock, value: number): boolean => stock.pe >= value;
export const maxPE = (stock: Stock, value: number): boolean => stock.pe <= value;
export const minPB = (stock: Stock, value: number): boolean => stock.pb >= value;
export const maxPB = (stock: Stock, value: number): boolean => stock.pb <= value;
export const minRSI = (stock: Stock, value: number): boolean => stock.rsi14 >= value;
export const maxRSI = (stock: Stock, value: number): boolean => stock.rsi14 <= value;
export const minVolume = (stock: Stock, value: number): boolean => stock.volume >= value;
export const maxVolume = (stock: Stock, value: number): boolean => stock.volume <= value;
export const minROE = (stock: Stock, value: number): boolean => stock.roe >= value;
export const maxROE = (stock: Stock, value: number): boolean => stock.roe <= value;
export const minROCE = (stock: Stock, value: number): boolean => stock.roce >= value;
export const maxROCE = (stock: Stock, value: number): boolean => stock.roce <= value;
export const minDividendYield = (stock: Stock, value: number): boolean =>
  stock.dividendYield >= value;
export const maxDividendYield = (stock: Stock, value: number): boolean =>
  stock.dividendYield <= value;
export const minDebtToEquity = (stock: Stock, value: number): boolean =>
  stock.debtToEquity >= value;
export const maxDebtToEquity = (stock: Stock, value: number): boolean =>
  stock.debtToEquity <= value;
export const isWatchlist = (stock: Stock, value: boolean): boolean => stock.isWatchlist === value;

export function sectors(stock: Stock, values: readonly string[]): boolean {
  return matchesSelection(stock.sector, values);
}

export function industries(stock: Stock, values: readonly string[]): boolean {
  return matchesSelection(stock.industry, values);
}

export function matchesStockPredicates(stock: Stock, criteria: StockPredicateCriteria): boolean {
  if (criteria.isWatchlist !== undefined && !isWatchlist(stock, criteria.isWatchlist)) {
    return false;
  }

  if (criteria.sectors !== undefined && !sectors(stock, criteria.sectors)) {
    return false;
  }

  if (criteria.industries !== undefined && !industries(stock, criteria.industries)) {
    return false;
  }

  if (criteria.minPrice !== undefined && !minPrice(stock, criteria.minPrice)) return false;
  if (criteria.maxPrice !== undefined && !maxPrice(stock, criteria.maxPrice)) return false;
  if (criteria.minPE !== undefined && !minPE(stock, criteria.minPE)) return false;
  if (criteria.maxPE !== undefined && !maxPE(stock, criteria.maxPE)) return false;
  if (criteria.minPB !== undefined && !minPB(stock, criteria.minPB)) return false;
  if (criteria.maxPB !== undefined && !maxPB(stock, criteria.maxPB)) return false;
  if (criteria.minRSI !== undefined && !minRSI(stock, criteria.minRSI)) return false;
  if (criteria.maxRSI !== undefined && !maxRSI(stock, criteria.maxRSI)) return false;
  if (criteria.minVolume !== undefined && !minVolume(stock, criteria.minVolume)) return false;
  if (criteria.maxVolume !== undefined && !maxVolume(stock, criteria.maxVolume)) return false;
  if (criteria.minROE !== undefined && !minROE(stock, criteria.minROE)) return false;
  if (criteria.maxROE !== undefined && !maxROE(stock, criteria.maxROE)) return false;
  if (criteria.minROCE !== undefined && !minROCE(stock, criteria.minROCE)) return false;
  if (criteria.maxROCE !== undefined && !maxROCE(stock, criteria.maxROCE)) return false;
  if (criteria.minDividendYield !== undefined && !minDividendYield(stock, criteria.minDividendYield)) {
    return false;
  }
  if (criteria.maxDividendYield !== undefined && !maxDividendYield(stock, criteria.maxDividendYield)) {
    return false;
  }
  if (criteria.minDebtToEquity !== undefined && !minDebtToEquity(stock, criteria.minDebtToEquity)) {
    return false;
  }
  if (criteria.maxDebtToEquity !== undefined && !maxDebtToEquity(stock, criteria.maxDebtToEquity)) {
    return false;
  }

  return true;
}

function matchesSelection(value: string, values: readonly string[]): boolean {
  if (values.length === 0) {
    return true;
  }

  for (let index = 0; index < values.length; index += 1) {
    if (value === values[index]) {
      return true;
    }
  }

  return false;
}