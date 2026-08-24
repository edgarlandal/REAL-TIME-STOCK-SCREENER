import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { INVESTMENT_PRESETS } from "@/lib/filterEngine/presets";
import type { FilterCondition, FilterGroup, FilterNode, FilterPreset } from "@/types/filter";
import type { Stock } from "@/types/stock";

export const FILTER_STORE_STORAGE_KEY = "stock-screener-filters";

export const EMPTY_FILTER_GROUP: FilterGroup = {
  id: "active-filters",
  logic: "AND",
  criteria: [],
};

export interface StockSort {
  field: keyof Stock;
  direction: "asc" | "desc";
}

interface FilterStoreState {
  criteria: FilterGroup;
  activeFilters: FilterCondition[];
  sort: StockSort;
  presets: FilterPreset[];
  setCriteria: (criteria: FilterGroup) => void;
  addFilter: (filter: FilterCondition) => void;
  updateFilter: (filter: FilterCondition) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  setSort: (sort: StockSort) => void;
  setPresets: (presets: FilterPreset[]) => void;
  savePreset: (preset: FilterPreset) => void;
  deletePreset: (presetId: string) => void;
  applyPreset: (presetId: string) => void;
}

function getActiveFilters(criteria: FilterGroup): FilterCondition[] {
  const activeFilters: FilterCondition[] = [];

  for (let index = 0; index < criteria.criteria.length; index += 1) {
    const criterion = criteria.criteria[index];

    if (!isFilterGroup(criterion)) {
      activeFilters.push(criterion);
    }
  }

  return activeFilters;
}

function isFilterGroup(node: FilterNode): node is FilterGroup {
  return "logic" in node;
}

export const useFilterStore = create<FilterStoreState>()(
  persist(
    (set, get) => ({
      criteria: EMPTY_FILTER_GROUP,
      activeFilters: [],
      sort: { field: "symbol", direction: "asc" },
      presets: [...INVESTMENT_PRESETS],
      setCriteria: (criteria) => set({ criteria, activeFilters: getActiveFilters(criteria) }),
      addFilter: (filter) => {
        const criteria = get().criteria;
        const nextCriteria = { ...criteria, criteria: [...criteria.criteria, filter] };

        set({ criteria: nextCriteria, activeFilters: getActiveFilters(nextCriteria) });
      },
      updateFilter: (filter) => {
        const criteria = get().criteria;
        const nextCriteria: FilterGroup = {
          ...criteria,
          criteria: criteria.criteria.map((criterion) =>
            !isFilterGroup(criterion) && criterion.id === filter.id ? filter : criterion,
          ),
        };

        set({ criteria: nextCriteria, activeFilters: getActiveFilters(nextCriteria) });
      },
      removeFilter: (filterId) => {
        const criteria = get().criteria;
        const nextCriteria: FilterGroup = {
          ...criteria,
          criteria: criteria.criteria.filter(
            (criterion) => isFilterGroup(criterion) || criterion.id !== filterId,
          ),
        };

        set({ criteria: nextCriteria, activeFilters: getActiveFilters(nextCriteria) });
      },
      clearFilters: () => set({ criteria: EMPTY_FILTER_GROUP, activeFilters: [] }),
      setSort: (sort) => set({ sort }),
      setPresets: (presets) => set({ presets }),
      savePreset: (preset) => set((state) => ({ presets: [...state.presets, preset] })),
      deletePreset: (presetId) =>
        set((state) => ({ presets: state.presets.filter(({ id }) => id !== presetId) })),
      applyPreset: (presetId) => {
        const presets = get().presets;

        for (let index = 0; index < presets.length; index += 1) {
          if (presets[index].id === presetId) {
            get().setCriteria(presets[index].criteria);
            return;
          }
        }
      },
    }),
    {
      name: FILTER_STORE_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ criteria, activeFilters, sort, presets }) => ({
        criteria,
        activeFilters,
        sort,
        presets,
      }),
    },
  ),
);