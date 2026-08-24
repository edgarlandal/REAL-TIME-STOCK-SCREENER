import { beforeEach, describe, expect, it } from "vitest";
import type { FilterCondition } from "@/types/filter";
import { INVESTMENT_PRESETS } from "@/lib/filterEngine/presets";
import {
  EMPTY_FILTER_GROUP,
  FILTER_STORE_STORAGE_KEY,
  useFilterStore,
} from "./filterStore";

const rsiFilter: FilterCondition = {
  id: "rsi",
  field: "rsi14",
  category: "technical",
  operator: "between",
  filter: { min: 40, max: 60 },
};

beforeEach(() => {
  localStorage.clear();
  useFilterStore.setState({
    criteria: EMPTY_FILTER_GROUP,
    activeFilters: [],
    sort: { field: "symbol", direction: "asc" },
    presets: [...INVESTMENT_PRESETS],
  });
});

describe("useFilterStore", () => {
  it("manages active criteria and sorting state", () => {
    const store = useFilterStore.getState();

    store.addFilter(rsiFilter);
    store.setSort({ field: "price", direction: "desc" });

    expect(useFilterStore.getState().activeFilters).toEqual([rsiFilter]);
    expect(useFilterStore.getState().criteria.criteria).toEqual([rsiFilter]);
    expect(useFilterStore.getState().sort).toEqual({ field: "price", direction: "desc" });

    store.removeFilter("rsi");

    expect(useFilterStore.getState().activeFilters).toEqual([]);
  });

  it("applies and persists presets through localStorage", () => {
    const store = useFilterStore.getState();

    store.applyPreset("value-stocks");

    expect(useFilterStore.getState().criteria).toEqual(INVESTMENT_PRESETS[0].criteria);
    expect(JSON.parse(localStorage.getItem(FILTER_STORE_STORAGE_KEY) ?? "{}"))
      .toMatchObject({ state: { criteria: INVESTMENT_PRESETS[0].criteria } });
  });
});