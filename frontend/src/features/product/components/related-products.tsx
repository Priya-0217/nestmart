import { Product } from '@/lib/types';
import { ProductGrid } from '@/features/catalog/components/product-grid';
import { SectionHeading } from '@/components/ui/section-heading';

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <SectionHeading title="You May Also Like" subtitle="Similar picks from this collection." />
      <ProductGrid products={products} />
    </section>
  );
}
