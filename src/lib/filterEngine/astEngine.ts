import type {
  BooleanFilter,
  FilterCondition,
  FilterGroup,
  FilterNode,
  FieldComparisonFilter,
  MultiSelectFilter,
  NumericFilter,
  RangeFilter,
} from "@/types/filter";
import type { Stock } from "@/types/stock";

export function filterStocks(stocks: Stock[], criteria: FilterGroup): Stock[] {
  const matches: Stock[] = [];

  for (let index = 0; index < stocks.length; index += 1) {
    const stock = stocks[index];

    if (matchesFilterNode(stock, criteria)) {
      matches.push(stock);
    }
  }

  return matches;
}

export function matchesFilterNode(stock: Stock, node: FilterNode): boolean {
  if ("logic" in node) {
    return matchesFilterGroup(stock, node);
  }

  return matchesFilterCondition(stock, node);
}

export function matchesFilterCondition(stock: Stock, condition: FilterCondition): boolean {
  const value = stock[condition.field];

  switch (condition.operator) {
    case "between": {
      const filter = condition.filter as RangeFilter;
      return typeof value === "number" && value >= filter.min && value <= filter.max;
    }
    case "in": {
      const filter = condition.filter as MultiSelectFilter;

      for (let index = 0; index < filter.values.length; index += 1) {
        if (value === filter.values[index]) {
          return true;
        }
      }

      return false;
    }
    case "equals": {
      const filter = condition.filter as BooleanFilter;
      return typeof value === "boolean" && value === filter.value;
    }
    case "lessThan": {
      const filter = condition.filter as NumericFilter;
      return typeof value === "number" && value < filter.value;
    }
    case "greaterThan": {
      const filter = condition.filter as NumericFilter;
      return typeof value === "number" && value > filter.value;
    }
    case "greaterThanField": {
      const filter = condition.filter as FieldComparisonFilter;
      const comparisonValue = stock[filter.field];
      return (
        typeof value === "number" &&
        typeof comparisonValue === "number" &&
        value > comparisonValue * filter.multiplier
      );
    }
  }
}

function matchesFilterGroup(stock: Stock, group: FilterGroup): boolean {
  if (group.logic === "AND") {
    for (let index = 0; index < group.criteria.length; index += 1) {
      if (!matchesFilterNode(stock, group.criteria[index])) {
        return false;
      }
    }

    return true;
  }

  for (let index = 0; index < group.criteria.length; index += 1) {
    if (matchesFilterNode(stock, group.criteria[index])) {
      return true;
    }
  }

  return false;
}