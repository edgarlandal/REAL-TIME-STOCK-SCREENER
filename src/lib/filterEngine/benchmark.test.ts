import { describe, expect, it } from "vitest";
import type { FilterGroup } from "@/types/filter";
import type { Stock } from "@/types/stock";
import {
  assertSpeedDemon,
  benchmarkFilter,
  meetsSpeedDemonThreshold,
  SPEED_DEMON_MAX_DURATION_MS,
} from "./benchmark";

const stock: Stock = {
  symbol: "ACME",
  name: "Acme Corp",
  sector: "Technology",
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
  salesGrowth: 10,
  rsi14: 50,
  sma20: 100,
  sma50: 100,
  sma200: 100,
  macd: 0,
  macdSignal: 0,
  volumeProfilePeak: 100,
  isWatchlist: false,
  lastUpdated: new Date(0),
};

const criteria: FilterGroup = {
  id: "all-stocks",
  logic: "AND",
  criteria: [],
};

describe("benchmarkFilter", () => {
  it("records the exact performance.now duration and Speed Demon status", () => {
    const samples = [10, 42.75];
    const result = benchmarkFilter([stock], criteria, () => samples.shift()!);

    expect(result.stocks).toEqual([stock]);
    expect(result.matchedCount).toBe(1);
    expect(result.durationMs).toBe(32.75);
    expect(result.isSpeedDemon).toBe(true);
  });

  it("enforces the strict under-100ms Speed Demon budget", () => {
    expect(meetsSpeedDemonThreshold(SPEED_DEMON_MAX_DURATION_MS - 0.001)).toBe(true);
    expect(meetsSpeedDemonThreshold(SPEED_DEMON_MAX_DURATION_MS)).toBe(false);

    expect(() =>
      assertSpeedDemon({
        stocks: [],
        durationMs: SPEED_DEMON_MAX_DURATION_MS,
        matchedCount: 0,
        isSpeedDemon: false,
      }),
    ).toThrow(/under 100ms/);
  });
});