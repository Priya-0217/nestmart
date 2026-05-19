import { Product } from '@/lib/types';
import { ProductImage } from '@/components/ui/product-image';
import { PriceTag } from '@/components/ui/price-tag';
import { RatingStars } from '@/components/ui/rating-stars';
import Link from 'next/link';

export function ProductList({ products }: { products: Product[] }) {
  return (
    <div className="space-y-3">
      {products.map((product) => (
        <article key={product.id} className="surface flex gap-4 p-4">
          <Link href={`/products/${product.slug || product.id}`} className="relative block h-28 w-28 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-32 sm:w-32">
            <ProductImage
              src={product.images[0]}
              alt={product.name}
              category={product.category}
              fill
              className="object-cover"
              sizes="160px"
            />
          </Link>
          <div className="min-w-0 flex-1 space-y-1.5">
            <Link href={`/products/${product.slug || product.id}`} className="line-clamp-2 text-base font-semibold text-foreground hover:underline">
              {product.name}
            </Link>
            <p className="text-xs text-foreground/55">{product.category}</p>
            <RatingStars rating={product.ratingAverage} reviewCount={product.ratingCount} />
            <PriceTag price={product.price} compareAtPrice={product.compareAtPrice} />
            <p className="line-clamp-2 text-sm text-foreground/70">{product.description}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
