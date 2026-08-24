import type { FilterPreset } from "@/types/filter";

export const INVESTMENT_PRESETS: readonly FilterPreset[] = [
  {
    id: "value-stocks",
    name: "Value Stocks",
    description: "P/E below 15, P/B below 1.5, and dividend yield above 2%.",
    criteria: {
      id: "value-stocks-criteria",
      logic: "AND",
      criteria: [
        {
          id: "value-pe",
          field: "pe",
          category: "valuation",
          operator: "lessThan",
          filter: { value: 15 },
        },
        {
          id: "value-pb",
          field: "pb",
          category: "valuation",
          operator: "lessThan",
          filter: { value: 1.5 },
        },
        {
          id: "value-dividend-yield",
          field: "dividendYield",
          category: "valuation",
          operator: "greaterThan",
          filter: { value: 2 },
        },
      ],
    },
  },
  {
    id: "growth-momentum",
    name: "Growth Momentum",
    description: "RSI above 60 and sales growth above 15%.",
    criteria: {
      id: "growth-momentum-criteria",
      logic: "AND",
      criteria: [
        {
          id: "growth-rsi",
          field: "rsi14",
          category: "technical",
          operator: "greaterThan",
          filter: { value: 60 },
        },
        {
          id: "growth-sales",
          field: "salesGrowth",
          category: "profitability",
          operator: "greaterThan",
          filter: { value: 15 },
        },
      ],
    },
  },
  {
    id: "large-cap-quality",
    name: "Large Cap Quality",
    description: "Large-cap companies with debt-to-equity below 0.5.",
    criteria: {
      id: "large-cap-quality-criteria",
      logic: "AND",
      criteria: [
        {
          id: "quality-market-cap",
          field: "marketCapCategory",
          category: "identity",
          operator: "in",
          filter: { values: ["large-cap"] },
        },
        {
          id: "quality-debt-to-equity",
          field: "debtToEquity",
          category: "financial-health",
          operator: "lessThan",
          filter: { value: 0.5 },
        },
      ],
    },
  },
  {
    id: "technical-breakout",
    name: "Technical Breakout",
    description: "Price above SMA200 with volume above 1.5 times average volume.",
    criteria: {
      id: "technical-breakout-criteria",
      logic: "AND",
      criteria: [
        {
          id: "breakout-price",
          field: "price",
          category: "technical",
          operator: "greaterThanField",
          filter: { field: "sma200", multiplier: 1 },
        },
        {
          id: "breakout-volume",
          field: "volume",
          category: "volume",
          operator: "greaterThanField",
          filter: { field: "avgVolume30", multiplier: 1.5 },
        },
      ],
    },
  },
];

export const INVESTMENT_PRESETS_BY_ID: Readonly<Record<string, FilterPreset>> = {
  "value-stocks": INVESTMENT_PRESETS[0],
  "growth-momentum": INVESTMENT_PRESETS[1],
  "large-cap-quality": INVESTMENT_PRESETS[2],
  "technical-breakout": INVESTMENT_PRESETS[3],
};