'use client';

import { EmptyState } from '@/components/ui/empty-state';
import { WishlistGrid } from '@/features/account/components/wishlist-grid';

export type WishlistProduct = {
  id: string;
  slug: string;
  name: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  category?: string;
};

export function WishlistPanel({ products }: { products: WishlistProduct[] }) {
  if (products.length === 0) {
    return (
      <div className="surface p-6">
        <EmptyState
          title="Your wishlist is empty"
          description="Save items you love so you can find them quickly later."
          ctaLabel="Browse products"
        />
      </div>
    );
  }

  return <WishlistGrid products={products} />;
}
