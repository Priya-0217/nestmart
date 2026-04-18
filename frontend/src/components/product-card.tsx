'use client';

import { Product } from '@/data/products';
import { formatPrice } from '@/lib/utils';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { ProductImage } from '@/components/ui/product-image';

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <motion.article
      whileHover={{ y: -8, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 220, damping: 18 }}
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
    >
      <div className="relative h-48 w-full overflow-hidden">
        <ProductImage src={product.image} alt={product.title} fill className="object-cover" />
      </div>
      <div className="space-y-3 p-4">
        <span className="inline-flex rounded-full bg-accent/15 px-3 py-1 text-xs font-semibold text-amber-700">{product.tag}</span>
        <h3 className="text-lg font-semibold">{product.title}</h3>
        <p className="text-sm text-slate-500">{product.category}</p>
        <div className="flex items-center justify-between">
          <p className="font-bold text-trust">{formatPrice(product.price)}</p>
          <p className="text-sm text-slate-400 line-through">{formatPrice(product.originalPrice)}</p>
        </div>
        <p className="inline-flex items-center gap-1 text-sm text-slate-600">
          <Star size={14} className="fill-accent text-accent" /> {product.rating}
        </p>
      </div>
    </motion.article>
  );
}
