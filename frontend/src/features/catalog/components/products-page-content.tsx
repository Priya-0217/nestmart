'use client';

import { useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List, SlidersHorizontal } from 'lucide-react';
import { CategoryTreeItem } from '@/lib/api';
import { Product } from '@/lib/types';
import { ActiveFilters } from '@/features/catalog/components/active-filters';
import { Breadcrumb } from '@/features/catalog/components/breadcrumb';
import { CategoryTreeSidebar } from '@/features/catalog/components/category-tree-sidebar';
import { Filters, FiltersPanel } from '@/features/catalog/components/filters-panel';
import { ProductGrid } from '@/features/catalog/components/product-grid';
import { ProductList } from '@/features/catalog/components/product-list';
import { SortSelect, SortValue } from '@/features/catalog/components/sort-select';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeading } from '@/components/ui/section-heading';

type ProductsPageContentProps = {
  products: Product[];
  initialCategory?: string;
  initialQuery?: string;
  categories?: CategoryTreeItem[];
};

const initialFilters: Filters = {
  query: '',
  categories: [],
  brands: [],
  tags: [],
  brandQuery: '',
  minRating: 0,
  inStockOnly: false,
  minPrice: 0,
  maxPrice: 100000
};

type ViewMode = 'grid' | 'list';
type BrowseMode = 'paged' | 'infinite';

const PAGE_SIZE = 12;

function findCategoryLabel(categories: CategoryTreeItem[] | undefined, categoryId?: string): string | undefined {
  if (!categories || !categoryId) return undefined;
  const stack = [...categories];
  while (stack.length > 0) {
    const current = stack.shift();
    if (!current) continue;
    if (current._id === categoryId || current.slug === categoryId || current.name === categoryId) return current.name;
    stack.unshift(...current.children);
  }
  return undefined;
}

export function ProductsPageContent({ products, initialCategory, initialQuery, categories }: ProductsPageContentProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<Filters>(() => {
    const rawCategory = initialCategory;
    const resolvedCategory = rawCategory ? findCategoryLabel(categories, rawCategory) || rawCategory : undefined;
    return {
      ...initialFilters,
      query: initialQuery ?? '',
      categories: resolvedCategory ? [resolvedCategory] : []
    };
  });
  const [sort, setSort] = useState<SortValue>('featured');
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [browseMode, setBrowseMode] = useState<BrowseMode>('paged');

  const page = Math.max(1, Number(searchParams.get('page') || '1'));
  const activeCategoryId = filters.categories[0];
  const activeCategoryLabel = findCategoryLabel(categories, activeCategoryId);

  useEffect(() => {
    const sortParam = searchParams.get('sort') as SortValue | null;
    if (sortParam) setSort(sortParam);

    const rawCategory = searchParams.get('category') || initialCategory;
    const resolvedCategory = rawCategory ? findCategoryLabel(categories, rawCategory) || rawCategory : undefined;

    const parsedFilters: Filters = {
      ...initialFilters,
      query: searchParams.get('search') || initialQuery || '',
      categories: resolvedCategory ? [resolvedCategory] : [],
      brands: (searchParams.get('brand') || '').split(',').filter(Boolean),
      tags: (searchParams.get('tags') || '').split(',').filter(Boolean),
      minRating: Number(searchParams.get('minRating') || 0),
      inStockOnly: searchParams.get('inStock') === 'true',
      minPrice: Number(searchParams.get('minPrice') || 0),
      maxPrice: Number(searchParams.get('maxPrice') || 100000),
      brandQuery: ''
    };

    setFilters(parsedFilters);

    const paramView = searchParams.get('view');
    if (paramView === 'grid' || paramView === 'list') setViewMode(paramView);

    const paramMode = searchParams.get('mode');
    if (paramMode === 'paged' || paramMode === 'infinite') setBrowseMode(paramMode);
  }, [searchParams, initialCategory, initialQuery]);

  useEffect(() => {
    const storedView = window.localStorage.getItem('nestmart-product-view');
    if ((storedView === 'grid' || storedView === 'list') && !searchParams.get('view')) {
      setViewMode(storedView);
    }
    const storedMode = window.localStorage.getItem('nestmart-browse-mode');
    if ((storedMode === 'paged' || storedMode === 'infinite') && !searchParams.get('mode')) {
      setBrowseMode(storedMode);
    }
  }, [searchParams]);

  function updateUrl(next: Partial<Filters> & { sort?: SortValue; page?: number; view?: ViewMode; mode?: BrowseMode }) {
    const params = new URLSearchParams(searchParams.toString());
    const merged: Filters = { ...filters, ...next };
    const nextSort = next.sort ?? sort;
    const nextPage = next.page ?? page;
    const nextView = next.view ?? viewMode;
    const nextMode = next.mode ?? browseMode;

    if (merged.query.trim()) params.set('search', merged.query.trim()); else params.delete('search');
    if (merged.categories[0]) params.set('category', merged.categories[0]); else params.delete('category');
    if (merged.brands.length > 0) params.set('brand', merged.brands.join(',')); else params.delete('brand');
    if (merged.tags.length > 0) params.set('tags', merged.tags.join(',')); else params.delete('tags');
    if (merged.minRating > 0) params.set('minRating', String(merged.minRating)); else params.delete('minRating');
    if (merged.inStockOnly) params.set('inStock', 'true'); else params.delete('inStock');
    if (merged.minPrice > 0) params.set('minPrice', String(merged.minPrice)); else params.delete('minPrice');
    if (merged.maxPrice < 100000) params.set('maxPrice', String(merged.maxPrice)); else params.delete('maxPrice');

    params.set('sort', nextSort);
    if (nextPage > 1) params.set('page', String(nextPage)); else params.delete('page');
    params.set('view', nextView);
    params.set('mode', nextMode);

    router.replace(`${pathname}?${params.toString()}`);
  }

  const filteredProducts = useMemo(() => {
    const query = filters.query.trim().toLowerCase();

    let list = products.filter((product) => {
      const matchesQuery = query ? product.name.toLowerCase().includes(query) || product.brand.toLowerCase().includes(query) : true;
      const matchesCategory = filters.categories.length > 0 ? filters.categories.includes(product.category) : true;
      const matchesBrand = filters.brands.length > 0 ? filters.brands.includes(product.brand) : true;
      const matchesTag = filters.tags.length > 0 ? filters.tags.includes(product.tag) : true;
      const matchesRating = product.ratingAverage >= filters.minRating;
      const matchesStock = filters.inStockOnly ? product.stock > 0 : true;
      const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      return matchesQuery && matchesCategory && matchesBrand && matchesTag && matchesRating && matchesStock && matchesPrice;
    });

    list = [...list].sort((a, b) => {
      switch (sort) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-desc':
          return b.ratingAverage - a.ratingAverage;
        case 'newest':
          return b.id.localeCompare(a.id);
        case 'featured':
        default:
          return 0;
      }
    });

    return list;
  }, [filters, products, sort]);

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pagedProducts = filteredProducts.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const infiniteProducts = filteredProducts.slice(0, safePage * PAGE_SIZE);
  const visibleProducts = browseMode === 'infinite' ? infiniteProducts : pagedProducts;

  return (
    <div className="space-y-5">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, ...(activeCategoryLabel ? [{ label: activeCategoryLabel }] : [])]} />

      <SectionHeading
        title="Product Listing"
        subtitle="Browse all collections with functional filters and sorting."
        action={
          <button className="focus-ring inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm font-medium lg:hidden" onClick={() => setShowFilters((value) => !value)}>
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[280px,minmax(0,1fr)]">
        <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="space-y-4">
            <FiltersPanel
              products={products}
              filters={filters}
              onChange={(nextFilters) => {
                setFilters(nextFilters);
                updateUrl({ ...nextFilters, page: 1 });
              }}
            />
          </div>
        </div>

        <div className="space-y-4">
          <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground/70">{filteredProducts.length} products found</p>
            <div className="flex flex-wrap items-center gap-2">
              <SortSelect
                value={sort}
                onChange={(nextSort) => {
                  setSort(nextSort);
                  updateUrl({ sort: nextSort, page: 1 });
                }}
              />

              <div className="inline-flex rounded-full border border-border bg-card p-1">
                <button
                  type="button"
                  className={`focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full ${viewMode === 'grid' ? 'bg-primary text-white' : 'text-foreground/70'}`}
                  onClick={() => {
                    setViewMode('grid');
                    window.localStorage.setItem('nestmart-product-view', 'grid');
                    updateUrl({ view: 'grid' });
                  }}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  className={`focus-ring inline-flex h-8 w-8 items-center justify-center rounded-full ${viewMode === 'list' ? 'bg-primary text-white' : 'text-foreground/70'}`}
                  onClick={() => {
                    setViewMode('list');
                    window.localStorage.setItem('nestmart-product-view', 'list');
                    updateUrl({ view: 'list' });
                  }}
                  aria-label="List view"
                >
                  <List className="h-4 w-4" />
                </button>
              </div>

              <button
                type="button"
                className="focus-ring rounded-full border border-border px-3 py-2 text-xs font-semibold hover:bg-muted"
                onClick={() => {
                  const nextMode: BrowseMode = browseMode === 'paged' ? 'infinite' : 'paged';
                  setBrowseMode(nextMode);
                  window.localStorage.setItem('nestmart-browse-mode', nextMode);
                  updateUrl({ mode: nextMode, page: 1 });
                }}
              >
                {browseMode === 'paged' ? 'Infinite mode' : 'Paged mode'}
              </button>
            </div>
          </div>

          <ActiveFilters
            filters={filters}
            categories={categories}
            onChange={(nextFilters) => {
              setFilters(nextFilters);
              updateUrl({ ...nextFilters, page: 1 });
            }}
          />

          {visibleProducts.length > 0 ? (
            viewMode === 'grid' ? <ProductGrid products={visibleProducts} /> : <ProductList products={visibleProducts} />
          ) : (
            <EmptyState title="No matching products" description="Try broadening your filters or search phrase to see more items." ctaLabel="Reset and browse all" ctaHref="/products" />
          )}

          {filteredProducts.length > 0 && browseMode === 'paged' ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              <button
                type="button"
                className="focus-ring rounded-full border border-border px-3 py-1.5 text-sm disabled:opacity-50"
                disabled={safePage <= 1}
                onClick={() => updateUrl({ page: Math.max(1, safePage - 1) })}
              >
                Previous
              </button>
              <span className="text-sm text-foreground/65">Page {safePage} of {totalPages}</span>
              <button
                type="button"
                className="focus-ring rounded-full border border-border px-3 py-1.5 text-sm disabled:opacity-50"
                disabled={safePage >= totalPages}
                onClick={() => updateUrl({ page: Math.min(totalPages, safePage + 1) })}
              >
                Next
              </button>
            </div>
          ) : null}

          {filteredProducts.length > 0 && browseMode === 'infinite' && visibleProducts.length < filteredProducts.length ? (
            <div className="flex justify-center">
              <button
                type="button"
                className="focus-ring rounded-full border border-border px-4 py-2 text-sm font-semibold hover:bg-muted"
                onClick={() => updateUrl({ page: safePage + 1 })}
              >
                Load more
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
