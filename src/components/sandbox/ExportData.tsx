"use client";

import { Download, FileJson, FileSpreadsheet } from "lucide-react";
import type { Stock } from "@/types/stock";

interface ExportDataProps {
  stocks: Stock[];
  filename?: string;
}

const STOCK_FIELDS: Array<keyof Stock> = [
  "symbol",
  "name",
  "sector",
  "industry",
  "marketCapCategory",
  "price",
  "ltp",
  "change",
  "changePercent",
  "open",
  "high",
  "low",
  "close",
  "volume",
  "avgVolume30",
  "fiftyTwoWeekHigh",
  "fiftyTwoWeekLow",
  "pe",
  "pb",
  "roe",
  "roce",
  "debtToEquity",
  "dividendYield",
  "eps",
  "promoterHolding",
  "freeCashFlow",
  "salesGrowth",
  "rsi14",
  "sma20",
  "sma50",
  "sma200",
  "macd",
  "macdSignal",
  "volumeProfilePeak",
  "isWatchlist",
  "lastUpdated",
];

export function stocksToCsv(stocks: Stock[]): string {
  const rows = [STOCK_FIELDS.join(",")];

  for (let index = 0; index < stocks.length; index += 1) {
    const stock = stocks[index];
    const values: string[] = [];

    for (let fieldIndex = 0; fieldIndex < STOCK_FIELDS.length; fieldIndex += 1) {
      const value = stock[STOCK_FIELDS[fieldIndex]];
      values.push(escapeCsvValue(value instanceof Date ? value.toISOString() : String(value)));
    }

    rows.push(values.join(","));
  }

  return rows.join("\r\n");
}

export function downloadExport(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ExportData({ stocks, filename = "stock-screener-results" }: ExportDataProps) {
  function exportCsv(): void {
    downloadExport(`\uFEFF${stocksToCsv(stocks)}`, `${filename}.csv`, "text/csv");
  }

  function exportJson(): void {
    downloadExport(JSON.stringify(stocks, null, 2), `${filename}.json`, "application/json");
  }

  return (
    <section aria-label="Exportar datos filtrados" className="flex flex-wrap items-center justify-between gap-3 border border-white/10 bg-financial-card p-4">
      <div>
        <h2 className="text-sm font-semibold text-zinc-100">Exportar Resultados</h2>
        <p className="mt-1 text-xs text-zinc-400">{stocks.length.toLocaleString("en-US")} acciones filtradas</p>
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={stocks.length === 0}
          className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-sm text-zinc-200 hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          onClick={exportCsv}
        >
          <FileSpreadsheet aria-hidden="true" className="size-4 text-emerald-300" />
          CSV
        </button>
        <button
          type="button"
          disabled={stocks.length === 0}
          className="inline-flex h-9 items-center gap-2 border border-white/10 px-3 text-sm text-zinc-200 hover:border-white/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          onClick={exportJson}
        >
          <FileJson aria-hidden="true" className="size-4 text-amber-300" />
          JSON
        </button>
        <Download aria-hidden="true" className="hidden size-4 text-zinc-500 sm:block" />
      </div>
    </section>
  );
}

function escapeCsvValue(value: string): string {
  const protectedValue = /^[=+\-@]/.test(value) ? `'${value}` : value;
  return /[",\r\n]/.test(protectedValue) ? `"${protectedValue.replaceAll('"', '""')}"` : protectedValue;
}