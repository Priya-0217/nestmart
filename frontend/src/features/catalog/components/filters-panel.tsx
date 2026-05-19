'use client';

import { useMemo } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Chip } from '@/components/ui/chip';
import { Input } from '@/components/ui/input';
import { Product } from '@/lib/types';
import { formatPrice } from '@/lib/utils';

export type Filters = {
  query: string;
  categories: string[];
  brands: string[];
  tags: string[];
  brandQuery: string;
  minRating: number;
  inStockOnly: boolean;
  minPrice: number;
  maxPrice: number;
};

export type FiltersPanelProps = {
  products: Product[];
  filters: Filters;
  onChange: (next: Filters) => void;
};

export function FiltersPanel({ products, filters, onChange }: FiltersPanelProps) {
  const categories = Array.from(new Set(products.map((product) => product.category))).sort();
  const brands = Array.from(new Set(products.map((product) => product.brand))).sort();
  const tags = Array.from(new Set(products.map((product) => product.tag).filter(Boolean))).sort();
  const filteredBrands = useMemo(() => {
    const q = filters.brandQuery.trim().toLowerCase();
    if (!q) return brands;
    return brands.filter((brand) => brand.toLowerCase().includes(q));
  }, [brands, filters.brandQuery]);

  const absoluteMinPrice = useMemo(() => Math.min(...products.map((product) => product.price), 0), [products]);
  const absoluteMaxPrice = useMemo(() => Math.max(...products.map((product) => product.price), 100000), [products]);

  function toggleCategory(category: string) {
    const exists = filters.categories.includes(category);
    onChange({
      ...filters,
      categories: exists ? filters.categories.filter((item) => item !== category) : [...filters.categories, category]
    });
  }

  function toggleBrand(brand: string) {
    const exists = filters.brands.includes(brand);
    onChange({
      ...filters,
      brands: exists ? filters.brands.filter((item) => item !== brand) : [...filters.brands, brand]
    });
  }

  function toggleTag(tag: string) {
    const exists = filters.tags.includes(tag);
    onChange({
      ...filters,
      tags: exists ? filters.tags.filter((item) => item !== tag) : [...filters.tags, tag]
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
        <div className="mt-2 grid grid-cols-2 gap-2">
          <Input
            type="number"
            min={absoluteMinPrice}
            max={filters.maxPrice}
            value={filters.minPrice}
            onChange={(event) => onChange({ ...filters, minPrice: Number(event.target.value) || absoluteMinPrice })}
            placeholder="Min"
          />
          <Input
            type="number"
            min={filters.minPrice}
            max={absoluteMaxPrice}
            value={filters.maxPrice}
            onChange={(event) => onChange({ ...filters, maxPrice: Number(event.target.value) || absoluteMaxPrice })}
            placeholder="Max"
          />
        </div>
        <input
          type="range"
          min={absoluteMinPrice}
          max={absoluteMaxPrice}
          step={10}
          value={filters.maxPrice}
          onChange={(event) => onChange({ ...filters, maxPrice: Number(event.target.value) })}
          className="mt-3 w-full accent-primary"
        />
        <p className="mt-1 text-sm text-foreground/65">
          {formatPrice(filters.minPrice)} - {formatPrice(filters.maxPrice)}
        </p>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/70">Brand</h3>
        <Input
          className="mt-2"
          placeholder="Search brand"
          value={filters.brandQuery}
          onChange={(event) => onChange({ ...filters, brandQuery: event.target.value })}
        />
        <div className="mt-2 max-h-36 space-y-2 overflow-auto pr-1">
          {filteredBrands.map((brand) => (
            <Checkbox key={brand} label={brand} checked={filters.brands.includes(brand)} onChange={() => toggleBrand(brand)} />
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-foreground/70">Tags</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <Chip key={tag} label={tag} active={filters.tags.includes(tag)} onClick={() => toggleTag(tag)} />
          ))}
        </div>
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
