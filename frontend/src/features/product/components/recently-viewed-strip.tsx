'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product } from '@/lib/types';
import { ProductTile } from '@/features/catalog/components/product-tile';
import { getRecentlyViewed } from '@/lib/personalization';

export function RecentlyViewedStrip({ products }: { products: Product[] }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const recent = useMemo(() => {
    if (!mounted) return [];
    const ids = getRecentlyViewed();
    return ids
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product))
      .slice(0, 8);
  }, [products, mounted]);

  if (!mounted || recent.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold text-foreground">Recently viewed</h2>
      <div className="flex gap-4 overflow-x-auto pb-2">
        {recent.map((item) => (
          <div key={item.id} className="min-w-[240px] max-w-[240px] shrink-0">
            <ProductTile product={item} />
          </div>
        ))}
      </div>
    </section>
  );
}
