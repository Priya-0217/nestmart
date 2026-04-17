'use client';

import { useEffect, useMemo, useState } from 'react';
import { Product } from '@/lib/types';
import { ProductGrid } from '@/components/catalog/product-grid';
import { SectionHeading } from '@/components/ui/section-heading';
import { getCategoryClicks, getRecentlyViewed } from '@/lib/personalization';

const MAX_ITEMS = 6;

export function PersonalizedShelves({ products }: { products: Product[] }) {
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [categoryClicks, setCategoryClicks] = useState<Record<string, number>>({});

  useEffect(() => {
    setRecentIds(getRecentlyViewed());
    setCategoryClicks(getCategoryClicks());
  }, []);

  const recentlyViewed = useMemo(() => {
    return recentIds
      .map((id) => products.find((product) => product.id === id))
      .filter((product): product is Product => Boolean(product))
      .slice(0, MAX_ITEMS);
  }, [recentIds, products]);

  const recommended = useMemo(() => {
    const categories = Object.entries(categoryClicks)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);

    if (categories.length === 0) {
      return [];
    }

    const recentSet = new Set(recentIds);
    const picked: Product[] = [];

    categories.slice(0, 2).forEach((category) => {
      products
        .filter((product) => product.category === category && !recentSet.has(product.id))
        .forEach((product) => {
          if (picked.length < MAX_ITEMS) {
            picked.push(product);
          }
        });
    });

    if (picked.length < MAX_ITEMS) {
      products
        .filter((product) => !recentSet.has(product.id) && !picked.some((item) => item.id === product.id))
        .sort((a, b) => b.rating - a.rating)
        .slice(0, MAX_ITEMS - picked.length)
        .forEach((product) => picked.push(product));
    }

    return picked.slice(0, MAX_ITEMS);
  }, [categoryClicks, products, recentIds]);

  if (recentlyViewed.length === 0 && recommended.length === 0) {
    return null;
  }

  return (
    <section className="space-y-8">
      {recentlyViewed.length > 0 ? (
        <div className="space-y-4">
          <SectionHeading title="Recently viewed" subtitle="Pick up where you left off." />
          <ProductGrid products={recentlyViewed} />
        </div>
      ) : null}

      {recommended.length > 0 ? (
        <div className="space-y-4">
          <SectionHeading title="Recommended for you" subtitle="Curated from what you click most." />
          <ProductGrid products={recommended} />
        </div>
      ) : null}
    </section>
  );
}
