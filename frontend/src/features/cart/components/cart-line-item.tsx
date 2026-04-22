'use client';

import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { ProductImage } from '@/components/ui/product-image';

type CartLineItemProps = {
  productSlug: string;
  productName: string;
  image: string;
  variantName: string;
  quantity: number;
  unitPrice: number;
  onQuantityChange: (next: number) => void;
  onRemove: () => void;
};

export function CartLineItem({ productSlug, productName, image, variantName, quantity, unitPrice, onQuantityChange, onRemove }: CartLineItemProps) {
  return (
    <article className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Link href={`/products/${productSlug}`} className="relative h-20 w-20 overflow-hidden rounded-xl">
          <ProductImage src={image} alt={productName} fill className="object-cover" sizes="80px" />
        </Link>
        <div>
          <Link href={`/products/${productSlug}`} className="text-sm font-semibold text-foreground hover:text-primary">
            {productName}
          </Link>
          <p className="mt-0.5 text-xs text-foreground/60">{variantName}</p>
          <p className="mt-1 text-sm font-medium text-foreground">{formatPrice(unitPrice)}</p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <QuantityStepper value={quantity} onChange={onQuantityChange} />
        <p className="min-w-24 text-right text-sm font-semibold">{formatPrice(unitPrice * quantity)}</p>
        <button className="focus-ring flex h-11 w-11 items-center justify-center rounded-full text-foreground/50 hover:bg-muted hover:text-secondary" onClick={onRemove} aria-label="Remove line item">
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  );
}
