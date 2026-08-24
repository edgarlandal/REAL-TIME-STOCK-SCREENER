"use client";

import { Download, Info } from "lucide-react";
import { useState } from "react";
import type { CandleData } from "@/types/chart";

export const CHART_TIMEFRAMES = ["1D", "1W", "1M", "3M", "1Y", "5Y"] as const;
export type ChartTimeframe = (typeof CHART_TIMEFRAMES)[number];

interface ChartControlsProps {
  timeframe: ChartTimeframe;
  activeCandle?: CandleData;
  onTimeframeChange: (timeframe: ChartTimeframe) => void;
  onSaveScreenshot: () => void;
}

const numberFormatter = new Intl.NumberFormat("en-US", { maximumFractionDigits: 2 });
const volumeFormatter = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 2 });

export function ChartControls({
  timeframe,
  activeCandle,
  onTimeframeChange,
  onSaveScreenshot,
}: ChartControlsProps) {
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);

  return (
    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
      <div aria-label="Temporalidad del gráfico" className="flex border border-white/10 bg-financial-card">
        {CHART_TIMEFRAMES.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={timeframe === option}
            className={`h-7 min-w-9 border-r border-white/10 px-2 text-xs font-medium last:border-r-0 ${
              timeframe === option ? "bg-white/10 text-white" : "text-zinc-400 hover:text-white"
            }`}
            onClick={() => onTimeframeChange(option)}
          >
            {option}
          </button>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <div className="relative">
          <button
            type="button"
            aria-label="Ver valores OHLCV"
            aria-expanded={isTooltipOpen}
            className="flex size-7 items-center justify-center border border-white/10 text-zinc-300 hover:border-white/25 hover:text-white"
            onClick={() => setIsTooltipOpen((open) => !open)}
          >
            <Info aria-hidden="true" className="size-4" />
          </button>
          {isTooltipOpen ? <OHLCVTooltip candle={activeCandle} /> : null}
        </div>
        <button
          type="button"
          aria-label="Guardar captura PNG"
          title="Guardar captura PNG"
          className="flex size-7 items-center justify-center border border-white/10 text-zinc-300 hover:border-white/25 hover:text-white"
          onClick={onSaveScreenshot}
        >
          <Download aria-hidden="true" className="size-4" />
        </button>
      </div>
    </div>
  );
}

function OHLCVTooltip({ candle }: { candle?: CandleData }) {
  if (candle === undefined) {
    return (
      <div role="tooltip" className="absolute right-0 top-8 z-20 w-52 border border-white/10 bg-financial-card p-3 text-xs text-zinc-300 shadow-lg shadow-black/40">
        Sin datos OHLCV disponibles.
      </div>
    );
  }

  const values = [
    ["Open", candle.open],
    ["High", candle.high],
    ["Low", candle.low],
    ["Close", candle.close],
    ["Volume", candle.volume],
  ] as const;

  return (
    <div role="tooltip" className="absolute right-0 top-8 z-20 w-52 border border-white/10 bg-financial-card p-3 text-xs shadow-lg shadow-black/40">
      <div className="mb-2 border-b border-white/10 pb-2 font-medium text-zinc-200">OHLCV</div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-zinc-400">
        {values.map(([label, value]) => (
          <div key={label} className="contents">
            <dt>{label}</dt>
            <dd className="text-right tabular-nums text-zinc-100">
              {label === "Volume" ? volumeFormatter.format(value) : numberFormatter.format(value)}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}