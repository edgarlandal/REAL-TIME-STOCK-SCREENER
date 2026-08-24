"use client";

import { useEffect, useRef } from "react";
import {
  ColorType,
  createChart,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
  type LineData,
  type UTCTimestamp,
} from "lightweight-charts";
import { calculateRSI } from "@/lib/indicators/rsi";
import type { CandleData } from "@/types/chart";
import type { ChartLogicalRange } from "./StockChart";

interface RSIChartClientProps {
  data: CandleData[];
  height: number;
  visibleRange: ChartLogicalRange | null;
}

function toRSILineData(data: CandleData[]): LineData[] {
  const rsi = calculateRSI(data);
  const lineData: LineData[] = [];

  for (let index = 0; index < rsi.length; index += 1) {
    lineData.push({ time: rsi[index].time as UTCTimestamp, value: rsi[index].value });
  }

  return lineData;
}

export function RSIChartClient({ data, height, visibleRange }: RSIChartClientProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const seriesRef = useRef<ISeriesApi<"Line"> | null>(null);

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
    const series = chart.addLineSeries({ color: "#38bdf8", lineWidth: 2, priceLineVisible: false });
    const resizeObserver = new ResizeObserver(([entry]) => {
      chart.applyOptions({ width: entry.contentRect.width, height });
    });

    series.createPriceLine({
      price: 70,
      color: "#ff5252",
      lineStyle: LineStyle.Dashed,
      lineWidth: 1,
      axisLabelVisible: true,
      title: "Sobrecompra",
    });
    series.createPriceLine({
      price: 30,
      color: "#00e676",
      lineStyle: LineStyle.Dashed,
      lineWidth: 1,
      axisLabelVisible: true,
      title: "Sobreventa",
    });
    chartRef.current = chart;
    seriesRef.current = series;
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      seriesRef.current = null;
      chartRef.current = null;
      chart.remove();
    };
  }, [height]);

  useEffect(() => {
    seriesRef.current?.setData(toRSILineData(data));
  }, [data]);

  useEffect(() => {
    if (visibleRange !== null) {
      chartRef.current?.timeScale().setVisibleLogicalRange(visibleRange);
    }
  }, [visibleRange]);

  return <div ref={containerRef} aria-label="RSI 14" className="mt-2 w-full overflow-hidden border border-white/10" style={{ height }} />;
}