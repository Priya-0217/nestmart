import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Breadcrumb } from '@/features/catalog/components/breadcrumb';
import { ProductGallery } from '@/features/product/components/product-gallery';
import { ProductInfo } from '@/features/product/components/product-info';
import { RelatedProducts } from '@/features/product/components/related-products';
import { SpecsTable } from '@/features/product/components/specs-table';
import { getProductById, getProductBySlug, getRelatedProducts, products } from '@/data/catalog';

type ProductDetailPageProps = {
  params: {
    slug: string;
  };
};

export function generateStaticParams() {
  return products.map((product) => ({ slug: product.slug }));
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const product = getProductBySlug(params.slug) ?? getProductById(params.slug);
  if (!product) {
    return { title: 'Product Not Found' };
  }

  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: product.name,
      description: product.description,
      images: [{ url: product.images[0] }]
    }
  };
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = getProductBySlug(params.slug) ?? getProductById(params.slug);
  if (!product) {
    notFound();
  }

  const relatedProducts = getRelatedProducts(product);

  return (
    <div className="space-y-8">
      <Breadcrumb items={[{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: product.name }]} />

      <section className="grid gap-6 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <ProductInfo product={product} />
      </section>

      <SpecsTable specs={product.specs} />

      <RelatedProducts products={relatedProducts} />
    </div>
  );
}
