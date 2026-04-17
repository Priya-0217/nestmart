'use client';

import { useMemo, useState } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { Product } from '@/lib/types';
import { ActiveFilters } from '@/components/catalog/active-filters';
import { Breadcrumb } from '@/components/catalog/breadcrumb';
import { Filters, FiltersPanel } from '@/components/catalog/filters-panel';
import { ProductGrid } from '@/components/catalog/product-grid';
import { SortSelect, SortValue } from '@/components/catalog/sort-select';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeading } from '@/components/ui/section-heading';

type ProductsPageContentProps = {
  products: Product[];
  initialCategory?: string;
};

const initialFilters: Filters = {
  query: '',
  categories: [],
  minRating: 0,
  inStockOnly: false,
  maxPrice: 1500
};

export function ProductsPageContent({ products, initialCategory }: ProductsPageContentProps) {
  const [filters, setFilters] = useState<Filters>({
    ...initialFilters,
    categories: initialCategory ? [initialCategory] : []
  });
  const [sort, setSort] = useState<SortValue>('featured');
  const [showFilters, setShowFilters] = useState(false);

  const filteredProducts = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    let list = products.filter((product) => {
      const matchesQuery = query ? product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query) : true;
      const matchesCategory = filters.categories.length > 0 ? filters.categories.includes(product.category) : true;
      const matchesRating = product.rating >= filters.minRating;
      const matchesStock = filters.inStockOnly ? product.stock > 0 : true;
      const matchesPrice = product.price <= filters.maxPrice;

      return matchesQuery && matchesCategory && matchesRating && matchesStock && matchesPrice;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'featured':
        default:
          return 0;
      }
    });

    return list;
  }, [filters, products, sort]);

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Products' }]} />

      <SectionHeading
        title="Product Listing"
        subtitle="Browse all collections with functional filters and sorting."
        action={
          <button className="focus-ring inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-2 text-sm font-medium lg:hidden" onClick={() => setShowFilters((value) => !value)}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[280px,minmax(0,1fr)]">
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <FiltersPanel products={products} filters={filters} onChange={setFilters} />
        </div>
        <div className="space-y-4">
          <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground/70">{filteredProducts.length} products found</p>
            <SortSelect value={sort} onChange={setSort} />
          </div>
          <ActiveFilters filters={filters} onChange={setFilters} />
          {filteredProducts.length > 0 ? (
            <ProductGrid products={filteredProducts} />
          ) : (
            <EmptyState title="No matching products" description="Try broadening your filters or search phrase to see more items." ctaLabel="Reset and browse all" ctaHref="/products" />
          )}
        </div>
      </div>
    </div>
  );
}
