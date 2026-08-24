import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { DataGrid } from "../DataGrid";
import type { Stock } from "@/types/stock";

const VIEWPORT_HEIGHT = 360;

vi.mock("@tanstack/react-virtual", () => ({
  useVirtualizer: ({ count, estimateSize }: { count: number; estimateSize: () => number }) => ({
    getTotalSize: () => count * estimateSize(),
    getVirtualItems: () =>
      Array.from({ length: Math.min(count, 25) }, (_, index) => ({
        index,
        start: index * estimateSize(),
      })),
  }),
}));

function createMockStocks(count: number): Stock[] {
  const stocks: Stock[] = [];

  for (let index = 0; index < count; index += 1) {
    stocks.push({
      symbol: `STOCK-${index}`,
      name: `Mock Stock ${index}`,
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
      volume: 1_000_000,
      avgVolume30: 1_000_000,
      fiftyTwoWeekHigh: 120,
      fiftyTwoWeekLow: 80,
      pe: 20,
      pb: 2,
      roe: 15,
      roce: 15,
      debtToEquity: 0.5,
      dividendYield: 2,
      eps: 5,
      promoterHolding: 50,
      freeCashFlow: 1_000_000,
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
    });
  }

  return stocks;
}

describe("DataGrid", () => {
  it("renders only the visible rows and overscan instead of all 5,000 rows", async () => {
    render(<DataGrid data={createMockStocks(5_000)} height={VIEWPORT_HEIGHT} />);

    await waitFor(() => expect(screen.getByText("STOCK-0")).toBeInTheDocument());

    const renderedDataRows = screen.getAllByRole("row").length - 1;

    expect(renderedDataRows).toBeGreaterThanOrEqual(20);
    expect(renderedDataRows).toBeLessThanOrEqual(30);
    expect(screen.queryByText("STOCK-4999")).not.toBeInTheDocument();
  });
});