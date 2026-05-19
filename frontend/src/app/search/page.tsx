import { Metadata } from 'next';
import { ProductsPageContent } from '@/features/catalog/components/products-page-content';
import { categoriesApi, productsApi } from '@/lib/api';
import { Product } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Search Results',
  description: 'Browse all products that match your search with advanced filters and sorting.'
};

type SearchPageProps = {
  searchParams: {
    q?: string;
  };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = searchParams.q || '';
  const [{ items }, { items: categories }] = await Promise.all([
    productsApi.list({ q: query, limit: 60 }, { cache: 'no-store' }),
    categoriesApi.tree({ cache: 'no-store' })
  ]);

  const mappedItems: Product[] = items.map((item: any) => ({
    id: item._id,
    slug: item.slug,
    name: item.title,
    brand: item.brand,
    price: item.price,
    compareAtPrice: item.compareAtPrice ?? item.price,
    images: item.images && item.images.length > 0 ? item.images : ['/product-placeholder.svg'],
    rating: item.ratingAverage || 0,
    reviewCount: item.ratingCount || 0,
    stock: item.stock || 0,
    category: String(item.category?._id || item.category || 'General'),
    tag: Array.isArray(item.tags) && item.tags.length > 0 ? String(item.tags[0]) : 'Featured',
    description: item.description || '',
    longDescription: item.description || '',
    features: item.features || [],
    specs: {},
    variants: item.variants || []
  }));

  return <ProductsPageContent products={mappedItems} initialQuery={query} categories={categories} />;
}
