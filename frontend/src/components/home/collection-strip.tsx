'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { products } from '@/data/catalog';
import { Product } from '@/lib/types';
import { ProductGrid } from '@/components/catalog/product-grid';
import { ProductTile } from '@/components/catalog/product-tile';
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
  const railRef = useRef<HTMLDivElement>(null);
  const [dragLimit, setDragLimit] = useState(0);

  useEffect(() => {
    const rail = railRef.current;
    if (!rail) {
      return;
    }

    const updateLimits = () => {
      const limit = rail.scrollWidth - rail.clientWidth;
      setDragLimit(limit > 0 ? limit : 0);
    };

    updateLimits();
    window.addEventListener('resize', updateLimits);
    return () => window.removeEventListener('resize', updateLimits);
  }, [items.length]);

  const canDrag = dragLimit > 0;

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
      <motion.div
        ref={railRef}
        drag={canDrag ? 'x' : false}
        dragConstraints={{ left: -dragLimit, right: 0 }}
        dragElastic={0.12}
        className="flex w-full snap-x snap-mandatory gap-4 overflow-x-auto pb-2 pr-2 active:cursor-grabbing sm:hidden"
        style={{ cursor: canDrag ? 'grab' : 'auto' }}
      >
        {items.map((product) => (
          <motion.div key={product.id} className="min-w-[240px] snap-start" whileHover={{ y: -6 }} transition={TRANSITION_STANDARD}>
            <ProductTile product={product} />
          </motion.div>
        ))}
      </motion.div>
      <div className="hidden sm:block">
        <ProductGrid products={items} />
      </div>
    </section>
  );
}
