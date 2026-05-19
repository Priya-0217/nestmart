import { Metadata } from 'next';
import { unstable_noStore as noStore } from 'next/cache';
import { Suspense } from 'react';
import { categoriesApi, productsApi } from '@/lib/api';
import { ProductsPageContent } from '@/features/catalog/components/products-page-content';
import { Product } from '@/lib/types';
import { CategoryTreeItem } from '@/lib/api';

/** Flatten a category tree into a map of { id → name } for quick lookup. */
function buildCategoryMap(nodes: CategoryTreeItem[]): Record<string, string> {
  const map: Record<string, string> = {};
  const stack = [...nodes];
  while (stack.length > 0) {
    const node = stack.shift()!;
    map[node._id] = node.name;
    map[node.slug] = node.name;
    if (node.children?.length) stack.unshift(...node.children);
  }
  return map;
}

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse NestMart products with category filters, price and rating controls, and sorting.'
};

type ProductsPageProps = {
  searchParams: {
    category?: string;
    search?: string;
    sort?: string;
    page?: string;
  };
};

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  noStore();
  const sortMap: Record<string, string> = {
    'featured': 'popular',
    'price-asc': 'price-asc',
    'price-desc': 'price-desc',
    'rating-desc': 'rating',
    'newest': 'newest'
  };
  const backendSort = searchParams.sort ? sortMap[searchParams.sort] : undefined;

  const pageNum = searchParams.page ? parseInt(searchParams.page) : 1;
  const validPage = isNaN(pageNum) ? 1 : pageNum;

  const [productsResponse, categoriesResponse] = await Promise.all([
    productsApi.list({
      category: searchParams.category || undefined,
      q: searchParams.search,
      sort: backendSort,
      page: validPage
    }, { cache: 'no-store' }).catch(() => ({
      items: [],
      pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
    })),
    categoriesApi.tree({ cache: 'no-store' }).catch(() => ({ items: [] }))
  ]);

  const items = productsResponse.items || [];
  const categories = categoriesResponse.items || [];

  // Build a flat ID → name lookup from the category tree
  const categoryMap = buildCategoryMap(categories);

  // Map backend ProductSummary to frontend Product type
  const mappedItems: Product[] = items.map((item: any) => {
    const rawCatId = String(item.category?._id || item.category || '');
    const categoryName = item.category?.name || categoryMap[rawCatId] || rawCatId;
    return {
      id: item._id,
      slug: item.slug || item._id,
      name: item.title,
      brand: item.brand,
      price: item.price,
      compareAtPrice: item.compareAtPrice ?? item.price,
      images: item.images && item.images.length > 0 ? item.images : ['/product-placeholder.svg'],
      rating: item.ratingAverage || 0,
      reviewCount: item.ratingCount || 0,
      stock: item.stock || 0,
      category: categoryName,
      tag: 'New',
      description: item.description || '',
      longDescription: '',
      features: item.features || [],
      specs: {},
      variants: item.variants || []
    };
  });

  return (
    <Suspense fallback={<div className="p-10 text-center">Loading products...</div>}>
      <ProductsPageContent 
        products={mappedItems} 
        initialCategory={searchParams.category} 
        initialQuery={searchParams.search} 
        categories={categories} 
      />
    </Suspense>
  );
}
