import Link from 'next/link';
import { Product } from '@/lib/types';
import { PriceTag } from '@/components/ui/price-tag';
import { ProductImage } from '@/components/ui/product-image';

export function WishlistGrid({ products }: { products: Product[] }) {
  return (
    <section className="surface p-5">
      <h2 className="text-lg font-semibold">Wishlist</h2>
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {products.map((product) => (
          <article key={product.id} className="rounded-xl border border-border bg-card p-3">
            <Link href={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden rounded-lg">
              <ProductImage src={product.images[0]} alt={product.name} category={product.category} fill className="object-cover" sizes="(max-width: 768px) 100vw, 20vw" />
            </Link>
            <p className="mt-2 text-sm font-semibold">{product.name}</p>
            <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} className="mt-1" />
          </article>
        ))}
      </div>
    </section>
  );
}
