"use client";

import { useEffect, useRef, useState, type MutableRefObject } from "react";
import {
  ColorType,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type LogicalRange,
  type UTCTimestamp,
} from "lightweight-charts";
import { calculateBollingerBands } from "@/lib/indicators/bollinger";
import { calculateSMA } from "@/lib/indicators/sma";
import { calculateVolumeProfile } from "@/lib/indicators/volumeProfile";
import type { CandleData, VolumeProfileBin } from "@/types/chart";
import type { ChartLogicalRange, StockChartOverlays } from "./StockChart";

interface StockChartClientProps {
  data: CandleData[];
  height: number;
  overlays: StockChartOverlays;
  onVisibleRangeChange: (range: ChartLogicalRange | null) => void;
  captureRef: MutableRefObject<(() => void) | null>;
}

interface VolumeProfileBar {
  id: string;
  top: number;
  height: number;
  widthPercent: number;
  isPOC: boolean;
}

function toChartData(data: CandleData[]): CandlestickData[] {
  return data.map((candle) => ({
    time: candle.time as UTCTimestamp,
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
  }));
}

function toLineData(data: Array<{ time: number; value: number | null }>): LineData[] {
  const lineData: LineData[] = [];

  for (let index = 0; index < data.length; index += 1) {
    const point = data[index];

    if (point.value !== null) {
      lineData.push({ time: point.time as UTCTimestamp, value: point.value });
    }
  }

  return lineData;
}

export function StockChartClient({ data, height, overlays, onVisibleRangeChange, captureRef }: StockChartClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Candlestick"> | null>(null);
  const sma20SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const sma50SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const sma200SeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bollingerUpperSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bollingerMiddleSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const bollingerLowerSeriesRef = useRef<ISeriesApi<"Line"> | null>(null);
  const profileBinsRef = useRef<VolumeProfileBin[]>([]);
  const profileProjectionRef = useRef<() => void>(() => undefined);
  const [volumeProfileBars, setVolumeProfileBars] = useState<VolumeProfileBar[]>([]);

  useEffect(() => {
    const container = containerRef.current;

    if (container === null) {
      return;
    }

    const chart = createChart(container, {
      width: container.clientWidth,
      height,
      layout: {
        background: { type: ColorType.Solid, color: "#0b0e14" },
        textColor: "#a1a1aa",
      },
      grid: {
        vertLines: { color: "rgba(255, 255, 255, 0.05)" },
        horzLines: { color: "rgba(255, 255, 255, 0.05)" },
      },
      rightPriceScale: { borderColor: "rgba(255, 255, 255, 0.1)" },
      timeScale: { borderColor: "rgba(255, 255, 255, 0.1)", timeVisible: true },
    });
    const series = chart.addCandlestickSeries({
      upColor: "#00c805",
      downColor: "#ff3b30",
      borderUpColor: "#00c805",
      borderDownColor: "#ff3b30",
      wickUpColor: "#00e676",
      wickDownColor: "#ff5252",
    });
    const sma20Series = chart.addLineSeries({ color: "#fbbf24", lineWidth: 1, visible: false });
    const sma50Series = chart.addLineSeries({ color: "#38bdf8", lineWidth: 1, visible: false });
    const sma200Series = chart.addLineSeries({ color: "#c084fc", lineWidth: 1, visible: false });
    const bollingerUpperSeries = chart.addLineSeries({ color: "#94a3b8", lineWidth: 1, visible: false });
    const bollingerMiddleSeries = chart.addLineSeries({ color: "#64748b", lineWidth: 1, visible: false });
    const bollingerLowerSeries = chart.addLineSeries({ color: "#94a3b8", lineWidth: 1, visible: false });
    let animationFrame: number | undefined;
    const projectVolumeProfile = (): void => {
      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }

      animationFrame = requestAnimationFrame(() => {
        const maxVolume = profileBinsRef.current.reduce(
          (highestVolume, bin) => Math.max(highestVolume, bin.volume),
          0,
        );
        const profileBars: VolumeProfileBar[] = [];

        if (maxVolume > 0) {
          for (let index = 0; index < profileBinsRef.current.length; index += 1) {
            const bin = profileBinsRef.current[index];
            const upperCoordinate = series.priceToCoordinate(bin.priceMax);
            const lowerCoordinate = series.priceToCoordinate(bin.priceMin);

            if (upperCoordinate === null || lowerCoordinate === null) {
              continue;
            }

            profileBars.push({
              id: `${bin.priceMin}-${bin.priceMax}`,
              top: Math.min(upperCoordinate, lowerCoordinate),
              height: Math.max(3, Math.abs(lowerCoordinate - upperCoordinate)),
              widthPercent: (bin.volume / maxVolume) * 100,
              isPOC: bin.isPOC,
            });
          }
        }

        setVolumeProfileBars(profileBars);
        animationFrame = undefined;
      });
    };
    const resizeObserver = new ResizeObserver(([entry]) => {
      chart.applyOptions({ width: entry.contentRect.width, height });
      projectVolumeProfile();
    });
    const handleVisibleRangeChange = (range: LogicalRange | null): void => {
      onVisibleRangeChange(range === null ? null : { from: range.from, to: range.to });
    };
    const saveScreenshot = (): void => {
      const image = chart.takeScreenshot();
      const link = document.createElement("a");

      link.download = `stock-chart-${Date.now()}.png`;
      link.href = image.toDataURL("image/png");
      link.click();
    };

    chartRef.current = chart;
    seriesRef.current = series;
    sma20SeriesRef.current = sma20Series;
    sma50SeriesRef.current = sma50Series;
    sma200SeriesRef.current = sma200Series;
    bollingerUpperSeriesRef.current = bollingerUpperSeries;
    bollingerMiddleSeriesRef.current = bollingerMiddleSeries;
    bollingerLowerSeriesRef.current = bollingerLowerSeries;
    profileProjectionRef.current = projectVolumeProfile;
    captureRef.current = saveScreenshot;
    resizeObserver.observe(container);
    chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

    return () => {
      resizeObserver.disconnect();
      chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleRangeChange);

      if (animationFrame !== undefined) {
        cancelAnimationFrame(animationFrame);
      }

      profileProjectionRef.current = () => undefined;
      captureRef.current = null;
      seriesRef.current = null;
      sma20SeriesRef.current = null;
      sma50SeriesRef.current = null;
      sma200SeriesRef.current = null;
      bollingerUpperSeriesRef.current = null;
      bollingerMiddleSeriesRef.current = null;
      bollingerLowerSeriesRef.current = null;
      chartRef.current = null;
      chart.remove();
    };
  }, [captureRef, height, onVisibleRangeChange]);

  useEffect(() => {
    seriesRef.current?.setData(toChartData(data));
    sma20SeriesRef.current?.setData(toLineData(calculateSMA(data, 20)));
    sma50SeriesRef.current?.setData(toLineData(calculateSMA(data, 50)));
    sma200SeriesRef.current?.setData(toLineData(calculateSMA(data, 200)));

    const bollinger = calculateBollingerBands(data);
    bollingerUpperSeriesRef.current?.setData(toLineData(bollinger.map(({ time, upper }) => ({ time, value: upper }))));
    bollingerMiddleSeriesRef.current?.setData(toLineData(bollinger.map(({ time, middle }) => ({ time, value: middle }))));
    bollingerLowerSeriesRef.current?.setData(toLineData(bollinger.map(({ time, lower }) => ({ time, value: lower }))));
    profileBinsRef.current = calculateVolumeProfile(data);
    chartRef.current?.timeScale().fitContent();
    profileProjectionRef.current();
  }, [data]);

  useEffect(() => {
    sma20SeriesRef.current?.applyOptions({ visible: overlays.sma20 });
    sma50SeriesRef.current?.applyOptions({ visible: overlays.sma50 });
    sma200SeriesRef.current?.applyOptions({ visible: overlays.sma200 });
    bollingerUpperSeriesRef.current?.applyOptions({ visible: overlays.bollinger });
    bollingerMiddleSeriesRef.current?.applyOptions({ visible: overlays.bollinger });
    bollingerLowerSeriesRef.current?.applyOptions({ visible: overlays.bollinger });
  }, [overlays]);

  return (
    <div className="relative w-full overflow-hidden border border-white/10" style={{ height }}>
      <div ref={containerRef} className="h-full w-full" />
      <div aria-label="Volume Profile" className="pointer-events-none absolute inset-y-0 right-0 w-28">
        {volumeProfileBars.map((bar) => (
          <div
            key={bar.id}
            className={`absolute right-0 ${bar.isPOC ? "bg-gain/70" : "bg-slate-400/25"}`}
            style={{ top: bar.top, height: bar.height, width: `${bar.widthPercent}%` }}
          >
            {bar.isPOC ? (
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] font-bold text-gain-bright">
                POC
              </span>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}