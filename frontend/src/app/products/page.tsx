import { Metadata } from 'next';
import { products } from '@/data/catalog';
import { ProductsPageContent } from '@/features/catalog/components/products-page-content';

export const metadata: Metadata = {
  title: 'Products',
  description: 'Browse NestMart products with category filters, price and rating controls, and sorting.'
};

type ProductsPageProps = {
  searchParams: {
    category?: string;
    search?: string;
  };
};

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return <ProductsPageContent products={products} initialCategory={searchParams.category} initialQuery={searchParams.search} />;
}
