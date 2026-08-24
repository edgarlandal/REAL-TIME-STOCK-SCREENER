export type CurrencyCode = "INR" | "USD";

interface CurrencyCellProps {
  value: number;
  currency?: CurrencyCode;
}

interface CompactNumberCellProps {
  value: number;
}

interface SectorBadgeProps {
  sector: string;
}

interface PercentageCellProps {
  value: number;
  showSign?: boolean;
}

const currencyFormatters: Record<CurrencyCode, Intl.NumberFormat> = {
  INR: new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }),
  USD: new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }),
};

const sectorBadgeStyles: Record<string, string> = {
  Technology: "border-cyan-400/30 bg-cyan-400/10 text-cyan-200",
  Financials: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
  Healthcare: "border-rose-400/30 bg-rose-400/10 text-rose-200",
  Energy: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  Industrials: "border-orange-400/30 bg-orange-400/10 text-orange-200",
  Consumer: "border-violet-400/30 bg-violet-400/10 text-violet-200",
};

export function formatCurrency(value: number, currency: CurrencyCode = "USD"): string {
  return currencyFormatters[currency].format(value);
}

export function formatCompactNumber(value: number): string {
  const absoluteValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absoluteValue >= 1_000_000_000) {
    return `${sign}${(absoluteValue / 1_000_000_000).toFixed(2).replace(/\.00$/, "")}B`;
  }

  if (absoluteValue >= 1_000_000) {
    return `${sign}${(absoluteValue / 1_000_000).toFixed(2).replace(/\.00$/, "")}M`;
  }

  if (absoluteValue >= 1_000) {
    return `${sign}${(absoluteValue / 1_000).toFixed(2).replace(/\.00$/, "")}K`;
  }

  return `${sign}${absoluteValue.toFixed(2).replace(/\.00$/, "")}`;
}

export function CurrencyCell({ value, currency = "USD" }: CurrencyCellProps) {
  return <span className="tabular-nums">{formatCurrency(value, currency)}</span>;
}

export function CompactNumberCell({ value }: CompactNumberCellProps) {
  return <span className="tabular-nums">{formatCompactNumber(value)}</span>;
}

export function SectorBadge({ sector }: SectorBadgeProps) {
  const colorClass = sectorBadgeStyles[sector] ?? "border-slate-400/30 bg-slate-400/10 text-slate-200";

  return (
    <span className={`inline-flex max-w-full border px-2 py-0.5 text-xs font-medium ${colorClass}`}>
      <span className="truncate">{sector}</span>
    </span>
  );
}

export function PercentageCell({ value, showSign = true }: PercentageCellProps) {
  const colorClass = value > 0 ? "text-gain-bright" : value < 0 ? "text-loss-bright" : "text-zinc-300";
  const sign = showSign && value > 0 ? "+" : "";

  return <span className={`tabular-nums font-medium ${colorClass}`}>{`${sign}${value.toFixed(2)}%`}</span>;
}