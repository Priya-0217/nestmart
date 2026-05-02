'use client';

import { useMemo } from 'react';
import { Product } from '@/lib/types';
import { EmptyState } from '@/components/ui/empty-state';
import { WishlistGrid } from '@/features/account/components/wishlist-grid';
import { useWishlistStore } from '@/store/wishlist-store';

export function WishlistPanel({ products }: { products: Product[] }) {
  const wishlistIds = useWishlistStore((state) => state.productIds);

  const wishlistProducts = useMemo(() => {
    return wishlistIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product));
  }, [products, wishlistIds]);

  if (wishlistProducts.length === 0) {
    return (
      <EmptyState
        title="Your wishlist is empty"
        description="Save items you love so you can find them quickly later."
        ctaLabel="Browse products"
      />
    );
  }

  return <WishlistGrid products={wishlistProducts} />;
}
