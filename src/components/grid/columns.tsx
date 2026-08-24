"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { ColumnDef, HeaderContext } from "@tanstack/react-table";
import {
  CompactNumberCell,
  CurrencyCell,
  PercentageCell,
  SectorBadge,
} from "@/components/grid/CellRenderers";
import type { Stock } from "@/types/stock";

type NumericStockField = {
  [Key in keyof Stock]: Stock[Key] extends number ? Key : never;
}[keyof Stock];

type TextStockField = "symbol" | "name" | "sector" | "industry" | "marketCapCategory";

const integerFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const decimalFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const compactFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 2,
});
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function SortableHeader({ column, label }: HeaderContext<Stock, unknown> & { label: string }) {
  const sortDirection = column.getIsSorted();
  const Icon = sortDirection === "asc" ? ArrowUp : sortDirection === "desc" ? ArrowDown : ArrowUpDown;

  return (
    <button
      type="button"
      className="inline-flex items-center gap-1 whitespace-nowrap text-left font-medium text-zinc-300 hover:text-white"
      onClick={() => column.toggleSorting(sortDirection === "asc")}
    >
      {label}
      <Icon aria-hidden="true" className="size-3.5" />
      <span className="sr-only">
        {sortDirection === "asc"
          ? "Sorted ascending"
          : sortDirection === "desc"
            ? "Sorted descending"
            : "Not sorted"}
      </span>
    </button>
  );
}

function sortableHeader(label: string) {
  return (context: HeaderContext<Stock, unknown>) => <SortableHeader {...context} label={label} />;
}

function textColumn(accessorKey: TextStockField, label: string): ColumnDef<Stock> {
  return {
    accessorKey,
    header: sortableHeader(label),
    cell: ({ getValue }) =>
      accessorKey === "sector" ? <SectorBadge sector={getValue<string>()} /> : getValue<string>(),
  };
}

function numericColumn(
  accessorKey: NumericStockField,
  label: string,
  formatter: Intl.NumberFormat = decimalFormatter,
  suffix = "",
): ColumnDef<Stock> {
  return {
    accessorKey,
    header: sortableHeader(label),
    cell: ({ getValue }) => `${formatter.format(getValue<number>())}${suffix}`,
  };
}

export const stockColumns: ColumnDef<Stock>[] = [
  textColumn("symbol", "Symbol"),
  textColumn("name", "Name"),
  textColumn("sector", "Sector"),
  textColumn("industry", "Industry"),
  textColumn("marketCapCategory", "Market Cap"),
  numericColumn("price", "Price", currencyFormatter),
  numericColumn("ltp", "LTP", currencyFormatter),
  {
    accessorKey: "change",
    header: sortableHeader("Change"),
    cell: ({ getValue }) => <CurrencyCell value={getValue<number>()} />,
  },
  {
    accessorKey: "changePercent",
    header: sortableHeader("Change %"),
    cell: ({ getValue }) => <PercentageCell value={getValue<number>()} />,
  },
  numericColumn("open", "Open", currencyFormatter),
  numericColumn("high", "High", currencyFormatter),
  numericColumn("low", "Low", currencyFormatter),
  numericColumn("close", "Close", currencyFormatter),
  {
    accessorKey: "volume",
    header: sortableHeader("Volume"),
    cell: ({ getValue }) => <CompactNumberCell value={getValue<number>()} />,
  },
  {
    accessorKey: "avgVolume30",
    header: sortableHeader("Avg Volume 30D"),
    cell: ({ getValue }) => <CompactNumberCell value={getValue<number>()} />,
  },
  numericColumn("fiftyTwoWeekHigh", "52W High", currencyFormatter),
  numericColumn("fiftyTwoWeekLow", "52W Low", currencyFormatter),
  numericColumn("pe", "P/E"),
  numericColumn("pb", "P/B"),
  {
    accessorKey: "roe",
    header: sortableHeader("ROE"),
    cell: ({ getValue }) => <PercentageCell value={getValue<number>()} showSign={false} />,
  },
  {
    accessorKey: "roce",
    header: sortableHeader("ROCE"),
    cell: ({ getValue }) => <PercentageCell value={getValue<number>()} showSign={false} />,
  },
  numericColumn("debtToEquity", "Debt/Equity"),
  numericColumn("dividendYield", "Dividend Yield", decimalFormatter, "%"),
  numericColumn("eps", "EPS", currencyFormatter),
  numericColumn("promoterHolding", "Promoter Holding", decimalFormatter, "%"),
  {
    accessorKey: "freeCashFlow",
    header: sortableHeader("Free Cash Flow"),
    cell: ({ getValue }) => <CompactNumberCell value={getValue<number>()} />,
  },
  {
    accessorKey: "salesGrowth",
    header: sortableHeader("Sales Growth"),
    cell: ({ getValue }) => <PercentageCell value={getValue<number>()} />,
  },
  numericColumn("rsi14", "RSI 14"),
  numericColumn("sma20", "SMA 20", currencyFormatter),
  numericColumn("sma50", "SMA 50", currencyFormatter),
  numericColumn("sma200", "SMA 200", currencyFormatter),
  numericColumn("macd", "MACD"),
  numericColumn("macdSignal", "MACD Signal"),
  numericColumn("volumeProfilePeak", "Volume Profile POC", currencyFormatter),
  {
    accessorKey: "isWatchlist",
    header: sortableHeader("Watchlist"),
    cell: ({ getValue }) => (getValue<boolean>() ? "Yes" : "No"),
  },
  {
    accessorKey: "lastUpdated",
    header: sortableHeader("Last Updated"),
    cell: ({ getValue }) => getValue<Date>().toLocaleString(),
  },
];

export const STOCK_COLUMN_COUNT = stockColumns.length;