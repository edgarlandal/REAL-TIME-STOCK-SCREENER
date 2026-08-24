export interface SectorHeatmapStock {
  sector: string;
  marketCap: number;
  changePercent: number;
}

interface SectorHeatmapProps {
  stocks: SectorHeatmapStock[];
}

interface SectorSummary {
  sector: string;
  totalMarketCap: number;
  averageChangePercent: number;
  stockCount: number;
}

export function aggregateSectorHeatmap(stocks: SectorHeatmapStock[]): SectorSummary[] {
  const sectors = new Map<string, { marketCap: number; totalChangePercent: number; stockCount: number }>();

  for (let index = 0; index < stocks.length; index += 1) {
    const stock = stocks[index];
    const current = sectors.get(stock.sector) ?? { marketCap: 0, totalChangePercent: 0, stockCount: 0 };

    current.marketCap += stock.marketCap;
    current.totalChangePercent += stock.changePercent;
    current.stockCount += 1;
    sectors.set(stock.sector, current);
  }

  const summaries: SectorSummary[] = [];

  for (const [sector, summary] of sectors) {
    summaries.push({
      sector,
      totalMarketCap: summary.marketCap,
      averageChangePercent: summary.totalChangePercent / summary.stockCount,
      stockCount: summary.stockCount,
    });
  }

  summaries.sort((first, second) => second.totalMarketCap - first.totalMarketCap);
  return summaries;
}

export function SectorHeatmap({ stocks }: SectorHeatmapProps) {
  const sectors = aggregateSectorHeatmap(stocks);
  const totalMarketCap = sectors.reduce((total, sector) => total + sector.totalMarketCap, 0);

  if (sectors.length === 0) {
    return (
      <div className="flex min-h-64 items-center justify-center border border-white/10 bg-financial-card text-sm text-zinc-400">
        No hay datos sectoriales disponibles.
      </div>
    );
  }

  return (
    <section aria-label="Mapa de calor sectorial" className="w-full border border-white/10 bg-financial-card p-3">
      <header className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-zinc-100">Mapa de Calor por Sector</h2>
        <span className="text-xs text-zinc-400">Tamaño: Market Cap · Color: cambio medio</span>
      </header>
      <div className="grid auto-rows-[7rem] grid-flow-dense grid-cols-12 gap-1">
        {sectors.map((sector) => {
          const share = sector.totalMarketCap / totalMarketCap;
          const columnSpan = Math.min(12, Math.max(2, Math.round(share * 12)));

          return (
            <article
              key={sector.sector}
              className={`flex min-w-0 flex-col justify-between border border-white/10 p-3 ${getChangeColor(sector.averageChangePercent)}`}
              style={{ gridColumn: `span ${columnSpan}` }}
              title={`${sector.sector}: ${formatPercent(sector.averageChangePercent)} · ${formatMarketCap(sector.totalMarketCap)}`}
            >
              <div className="min-w-0">
                <h3 className="truncate text-sm font-semibold text-white">{sector.sector}</h3>
                <p className="mt-1 text-xs text-white/70">
                  {sector.stockCount} {sector.stockCount === 1 ? "acción" : "acciones"}
                </p>
              </div>
              <div className="flex items-end justify-between gap-2 tabular-nums">
                <span className="truncate text-xs text-white/80">{formatMarketCap(sector.totalMarketCap)}</span>
                <span className="text-sm font-bold text-white">{formatPercent(sector.averageChangePercent)}</span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}

function getChangeColor(changePercent: number): string {
  if (changePercent >= 2) return "bg-emerald-500/45";
  if (changePercent >= 0.5) return "bg-emerald-500/30";
  if (changePercent > 0) return "bg-emerald-500/15";
  if (changePercent <= -2) return "bg-rose-500/45";
  if (changePercent <= -0.5) return "bg-rose-500/30";
  if (changePercent < 0) return "bg-rose-500/15";
  return "bg-slate-500/20";
}

function formatPercent(value: number): string {
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function formatMarketCap(value: number): string {
  if (value >= 1_000_000_000_000) return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(2)}B`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(2)}M`;
  return `$${value.toLocaleString("en-US")}`;
}