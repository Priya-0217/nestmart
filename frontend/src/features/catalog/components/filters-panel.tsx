'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

type Filters = {
  query: string;
  categories: string[];
  minRating: number;
  inStockOnly: boolean;
  maxPrice: number;
};

type FiltersPanelProps = {
  products: Product[];
  filters: Filters;
  onChange: (next: Filters) => void;
};

export function FiltersPanel({ products, filters, onChange }: FiltersPanelProps) {
  const categories = Array.from(new Set(products.map((product) => product.category))).sort();

  function toggleCategory(category: string) {
    const exists = filters.categories.includes(category);
    onChange({
      ...filters,
      categories: exists ? filters.categories.filter((item) => item !== category) : [...filters.categories, category]
    });
  }

  return (
    <aside className="surface h-fit space-y-5 p-4 sm:p-5">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/70">Search</h3>
        <Input placeholder="Find by name or brand" value={filters.query} onChange={(event) => onChange({ ...filters, query: event.target.value })} className="mt-2" />
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/70">Category</h3>
        <div className="mt-2 space-y-2">
          {categories.map((category) => (
            <Checkbox key={category} label={category} checked={filters.categories.includes(category)} onChange={() => toggleCategory(category)} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/70">Rating</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {[0, 3.5, 4, 4.5].map((value) => (
            <Chip key={String(value)} label={value === 0 ? 'All' : `${value}+`} active={filters.minRating === value} onClick={() => onChange({ ...filters, minRating: value })} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/70">Max Price</h3>
        <input
          type="range"
          min={50}
          max={1500}
          step={10}
          value={filters.maxPrice}
          onChange={(event) => onChange({ ...filters, maxPrice: Number(event.target.value) })}
          className="mt-3 w-full accent-primary"
        />
        <p className="mt-1 text-sm text-foreground/65">Up to {formatPrice(filters.maxPrice)}</p>
      </div>

      <Checkbox
        label="In-stock items only"
        description="Hide products that are currently unavailable."
        checked={filters.inStockOnly}
        onChange={(event) => onChange({ ...filters, inStockOnly: event.currentTarget.checked })}
      />
    </aside>
  );
}

export type { Filters };
