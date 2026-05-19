import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/features/catalog/components/breadcrumb';
import { ProductGallery } from '@/features/product/components/product-gallery';
import { ProductInfo } from '@/features/product/components/product-info';
import { ProductDetailTabs } from '@/features/product/components/product-detail-tabs';
import { ProductReviewsSection } from '@/features/product/components/product-reviews-section';
import { RecentlyViewedStrip } from '@/features/product/components/recently-viewed-strip';
import { RelatedProducts } from '@/features/product/components/related-products';
import { productsApi } from '@/lib/api';
import { Product } from '@/lib/types';

type ProductDetailPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  try {
    const product = await productsApi.get(params.slug, { cache: 'no-store' });
    return {
      title: product.title,
      description: product.brand,
      openGraph: {
        title: product.title,
        description: product.brand,
        images: [{ url: product.images[0] }]
      }
    };
  } catch {
    return { title: 'Product Not Found' };
  }
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  try {
    const rawProduct = await productsApi.get(params.slug, { cache: 'no-store' });
    const [relatedResponse, browsePoolResponse] = await Promise.all([
      productsApi.related(rawProduct._id, { cache: 'no-store' }).catch(() => ({
        items: [],
        pagination: { page: 1, limit: 12, total: 0, totalPages: 0 }
      })),
      productsApi.list({ limit: 30 }, { cache: 'no-store' }).catch(() => ({
        items: [],
        pagination: { page: 1, limit: 30, total: 0, totalPages: 0 }
      }))
    ]);

    const relatedProducts = relatedResponse.items || [];
    const browsePool = browsePoolResponse.items || [];

    const mapToProduct = (item: any): Product => ({
      id: item._id || item.id,
      slug: item.slug || item._id || item.id,
      name: item.title || item.name || 'Unknown Product',
      brand: item.brand || 'NestMart',
      price: item.price || 0,
      compareAtPrice: item.compareAtPrice ?? item.price ?? 0,
      images: item.images && item.images.length > 0 ? item.images : ['/product-placeholder.svg'],
      rating: Number.isFinite(item.ratingAverage) ? Number(item.ratingAverage) : 0,
      reviewCount: Number.isFinite(item.ratingCount) ? Number(item.ratingCount) : 0,
      stock: Number.isFinite(item.stock) ? Number(item.stock) : 0,
      category: item.category?.name || String(item.category?._id || item.category || 'General'),
      tag: Array.isArray(item.tags) && item.tags.length > 0 ? String(item.tags[0]) : 'Featured',
      description: item.description || '',
      longDescription: item.description || '',
      features: item.features || [],
      specs: Object.fromEntries(
        Object.entries(item.attributes ?? {})
          .filter(([, value]) => typeof value === 'string' || typeof value === 'number')
          .map(([key, value]) => [key, String(value)])
      ),
      variants: item.variants || []
    });

    const product = mapToProduct(rawProduct);
    const mappedRelated = relatedProducts.map((item: any) => mapToProduct(item));
    const mappedBrowsePool = browsePool.map((item: any) => mapToProduct(item));

    return (
      <div className="space-y-10 pb-10">
        <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: product.name }]} />

        <section className="grid items-start gap-8 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] xl:gap-10">
          <ProductGallery images={product.images} name={product.name} category={product.brand} />
          <ProductInfo product={product} />
        </section>

        <ProductDetailTabs description={product.description} specs={product.specs} />

        <ProductReviewsSection productId={product.id} rating={product.rating} ratingCount={product.reviewCount} />

        <RelatedProducts products={mappedRelated} />
        <RecentlyViewedStrip products={mappedBrowsePool} />
      </div>
    );
  } catch (error) {
    console.error('Error loading product page:', error);
    notFound();
  }
}
