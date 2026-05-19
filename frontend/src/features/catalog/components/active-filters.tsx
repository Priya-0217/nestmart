'use client';

import { X } from 'lucide-react';
import { Filters } from '@/features/catalog/components/filters-panel';
import { CategoryTreeItem } from '@/lib/api';

type ActiveFiltersProps = {
  filters: Filters;
  onChange: (filters: Filters) => void;
  categories?: CategoryTreeItem[];
};

function findCategoryName(items: CategoryTreeItem[] | undefined, idOrSlug: string): string {
  if (!items) return idOrSlug;
  const stack = [...items];
  while (stack.length > 0) {
    const node = stack.shift()!;
    if (node._id === idOrSlug || node.slug === idOrSlug) return node.name;
    if (node.children?.length) stack.unshift(...node.children);
  }
  return idOrSlug;
}

export function ActiveFilters({ filters, onChange, categories }: ActiveFiltersProps) {
  const chips: Array<{ label: string; remove: () => void }> = [];

  filters.categories.forEach((category) => {
    chips.push({
      label: findCategoryName(categories, category),
      remove: () => onChange({ ...filters, categories: filters.categories.filter((item) => item !== category) })
    });
  });
  filters.brands.forEach((brand) => chips.push({ label: brand, remove: () => onChange({ ...filters, brands: filters.brands.filter((item) => item !== brand) }) }));
  filters.tags.forEach((tag) => chips.push({ label: tag, remove: () => onChange({ ...filters, tags: filters.tags.filter((item) => item !== tag) }) }));

  if (filters.minRating > 0) {
    chips.push({ label: `${filters.minRating}+ stars`, remove: () => onChange({ ...filters, minRating: 0 }) });
  }

  if (filters.minPrice > 0 || filters.maxPrice < 100000) {
    chips.push({
      label: `Price ${filters.minPrice} - ${filters.maxPrice}`,
      remove: () => onChange({ ...filters, minPrice: 0, maxPrice: 100000 })
    });
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
            brands: [],
            tags: [],
            brandQuery: '',
            minRating: 0,
            inStockOnly: false,
            minPrice: 0,
            maxPrice: 100000
          })
        }
      >
        Clear all
      </button>
    </div>
  );
}
