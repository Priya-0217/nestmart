'use client';

import { useMemo, useState } from 'react';
import { Check, Heart, ShoppingBag } from 'lucide-react';
import { Product } from '@/lib/types';
import { getDiscountPercent } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { PriceTag } from '@/components/ui/price-tag';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { RatingStars } from '@/components/ui/rating-stars';
import { VariantPicker } from '@/features/product/components/variant-picker';

export function ProductInfo({ product }: { product: Product }) {
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlist = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.productIds.includes(product.id));
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants[0]?.id ?? '');
  const [quantity, setQuantity] = useState(1);

  const selectedVariant = useMemo(() => product.variants.find((variant) => variant.id === selectedVariantId), [product.variants, selectedVariantId]);

  const displayPrice = selectedVariant?.price ?? product.price;
  const discount = getDiscountPercent(displayPrice, product.compareAtPrice);

  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <Badge tone="warning">{product.tag}</Badge>
        <h1 className="text-3xl font-semibold text-foreground">{product.name}</h1>
        <p className="text-sm text-foreground/65">{product.brand} • {product.category}</p>
        <RatingStars rating={product.rating} reviewCount={product.reviewCount} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <PriceTag price={displayPrice} compareAtPrice={product.compareAtPrice} className="text-2xl" />
        {discount > 0 ? <Badge tone="success">Save {discount}%</Badge> : null}
      </div>

      <p className="text-sm leading-6 text-foreground/80">{product.longDescription}</p>

      <VariantPicker variants={product.variants} activeVariantId={selectedVariantId} onChange={setSelectedVariantId} />

      <div className="flex flex-wrap items-center gap-3">
        <QuantityStepper value={quantity} onChange={setQuantity} />
        <Button
          size="lg"
          className="gap-2"
          onClick={() => {
            if (!selectedVariant) {
              return;
            }
            addItem(product.id, selectedVariant.id, quantity);
          }}
        >
          <ShoppingBag className="h-4 w-4" />
          Add to Cart
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="gap-2"
          onClick={() => toggleWishlist(product.id)}
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-current text-rose-500' : ''}`} />
          {isWishlisted ? 'Saved' : 'Wishlist'}
        </Button>
      </div>

      <ul className="space-y-2 rounded-2xl border border-border bg-white p-4 text-sm text-foreground/75">
        {product.features.map((feature) => (
          <li key={feature} className="flex items-center gap-2">
            <Check className="h-4 w-4 text-primary" />
            {feature}
          </li>
        ))}
      </ul>
    </section>
  );
}
