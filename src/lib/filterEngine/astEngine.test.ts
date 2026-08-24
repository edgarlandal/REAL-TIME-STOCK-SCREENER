import { describe, expect, it } from "vitest";
import type { FilterGroup } from "@/types/filter";
import type { Stock } from "@/types/stock";
import { filterStocks } from "./astEngine";

function createStock(symbol: string, rsi14: number, sector = "Technology"): Stock {
  return {
    symbol,
    name: symbol,
    sector,
    industry: "Software",
    marketCapCategory: "large-cap",
    price: 100,
    ltp: 100,
    change: 0,
    changePercent: 0,
    open: 100,
    high: 100,
    low: 100,
    close: 100,
    volume: 1_000,
    avgVolume30: 1_000,
    fiftyTwoWeekHigh: 120,
    fiftyTwoWeekLow: 80,
    pe: 20,
    pb: 2,
    roe: 10,
    roce: 10,
    debtToEquity: 1,
    dividendYield: 1,
    eps: 5,
    promoterHolding: 50,
    freeCashFlow: 1_000,
    rsi14,
    sma20: 100,
    sma50: 100,
    sma200: 100,
    macd: 0,
    macdSignal: 0,
    volumeProfilePeak: 100,
    isWatchlist: false,
    lastUpdated: new Date(0),
  };
}

const criteria: FilterGroup = {
  id: "root",
  logic: "AND",
  criteria: [
    {
      id: "rsi",
      field: "rsi14",
      category: "technical",
      operator: "between",
      filter: { min: 40, max: 60 },
    },
    {
      id: "sectors",
      field: "sector",
      category: "identity",
      operator: "in",
      filter: { values: ["Technology"] },
    },
  ],
};

describe("filterStocks", () => {
  it("evaluates nested AST criteria with AND/OR short-circuit semantics", () => {
    const nestedCriteria: FilterGroup = {
      ...criteria,
      criteria: [
        ...criteria.criteria,
        {
          id: "alternatives",
          logic: "OR",
          criteria: [
            {
              id: "watchlist",
              field: "isWatchlist",
              category: "watchlist",
              operator: "equals",
              filter: { value: true },
            },
            {
              id: "financials",
              field: "sector",
              category: "identity",
              operator: "in",
              filter: { values: ["Technology"] },
            },
          ],
        },
      ],
    };

    const result = filterStocks(
      [createStock("MATCH", 50), createStock("RSI_FAIL", 30), createStock("SECTOR_FAIL", 50, "Energy")],
      nestedCriteria,
    );

    expect(result.map(({ symbol }) => symbol)).toEqual(["MATCH"]);
  });

  it("filters 5,000 stocks without creating intermediate result arrays", () => {
    const stocks: Stock[] = [];

    for (let index = 0; index < 5_000; index += 1) {
      stocks.push(createStock(`STOCK-${index}`, index % 100));
    }

    const result = filterStocks(stocks, criteria);

    expect(result).toHaveLength(1_050);
    expect(result.every((stock) => stock.rsi14 >= 40 && stock.rsi14 <= 60)).toBe(true);
  });
});