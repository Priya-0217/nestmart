'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { products } from '@/data/catalog';
import { Product } from '@/lib/types';
import { ProductGrid } from '@/features/catalog/components/product-grid';
import { ProductTile } from '@/features/catalog/components/product-tile';
import { SectionHeading } from '@/components/ui/section-heading';
import { TRANSITION_STANDARD } from '@/lib/motion';

type CollectionStripProps = {
  title: string;
  subtitle: string;
  productIds: string[];
};

export function CollectionStrip({ title, subtitle, productIds }: CollectionStripProps) {
  const items = productIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product));

  if (items.length === 0) {
    return null;
  }

  return (
    <section className="space-y-4">
      <SectionHeading
        title={title}
        subtitle={subtitle}
        action={
          <Link href="/products" className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline">
            View all
            <ArrowRight className="h-4 w-4" />
          </Link>
        }
      />
      <div className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 pr-2 sm:hidden">
        {items.map((product) => (
          <motion.div key={product.id} className="min-w-[240px] snap-start" whileHover={{ y: -6 }} transition={TRANSITION_STANDARD}>
            <ProductTile product={product} />
          </motion.div>
        ))}
      </div>
      <div className="hidden sm:block">
        <ProductGrid products={items} />
      </div>
    </section>
  );
}
