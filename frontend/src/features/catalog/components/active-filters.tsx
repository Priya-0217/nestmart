'use client';

import { X } from 'lucide-react';
import { Filters } from '@/features/catalog/components/filters-panel';

type ActiveFiltersProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
};

export function ActiveFilters({ filters, onChange }: ActiveFiltersProps) {
  const chips: Array<{ label: string; remove: () => void }> = [];

  filters.categories.forEach((category) => chips.push({ label: category, remove: () => onChange({ ...filters, categories: filters.categories.filter((item) => item !== category) }) }));

  if (filters.minRating > 0) {
    chips.push({ label: `${filters.minRating}+ stars`, remove: () => onChange({ ...filters, minRating: 0 }) });
  }

  if (filters.inStockOnly) {
    chips.push({ label: 'In stock', remove: () => onChange({ ...filters, inStockOnly: false }) });
  }

  if (chips.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button key={chip.label} className="focus-ring inline-flex items-center gap-1 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-foreground/80 hover:bg-muted" onClick={chip.remove}>
          {chip.label}
          <X className="h-3.5 w-3.5" />
        </button>
      ))}
      <button
        className="text-xs font-semibold text-primary hover:underline"
        onClick={() =>
          onChange({
            ...filters,
            categories: [],
            minRating: 0,
            inStockOnly: false
          })
        }
      >
        Clear all
      </button>
    </div>
  );
}
