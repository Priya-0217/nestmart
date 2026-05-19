'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, Heart, RotateCcw, ShieldCheck, ShoppingBag, Star, Truck } from 'lucide-react';
import { getDiscountPercent } from '@/lib/utils';
import { useCartStore } from '@/store/cart-store';
import { useWishlistStore } from '@/store/wishlist-store';
import { Button } from '@/components/ui/button';
import { QuantityStepper } from '@/components/ui/quantity-stepper';
import { VariantPicker } from '@/features/product/components/variant-picker';
import { usersApi } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { trackProductView } from '@/lib/personalization';
import { formatPrice } from '@/lib/utils';

const trustBadges = [
  { icon: Truck, label: 'Free Delivery' },
  { icon: RotateCcw, label: 'Easy Returns' },
  { icon: ShieldCheck, label: 'Secure Payment' }
];

export function ProductInfo({ product }: { product: any }) {
  const { status } = useSession();
  const router = useRouter();
  const addItem = useCartStore((state) => state.addItem);
  const toggleWishlistLocal = useWishlistStore((state) => state.toggleItem);
  const isWishlisted = useWishlistStore((state) => state.productIds.includes(product._id || product.id));
  const [selectedVariantId, setSelectedVariantId] = useState(product.variants?.[0]?.id ?? 'default');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const variants = product.variants ?? [];
  const selectedVariant = useMemo(() => variants.find((variant: any) => variant.id === selectedVariantId), [variants, selectedVariantId]);

  const displayPrice = selectedVariant?.price ?? product.price;
  const compareAtPrice = product.compareAtPrice;
  const discount = getDiscountPercent(displayPrice, product.compareAtPrice);
  const availableStock = selectedVariant?.stock ?? product.stock ?? 0;

  const productId = product._id || product.id;
  const productName = product.title || product.name;
  const ratingValue = Number.isFinite(product.rating) ? Number(product.rating) : (Number.isFinite(product.ratingAverage) ? Number(product.ratingAverage) : 0);
  const reviewCount = Number.isFinite(product.reviewCount) ? Number(product.reviewCount) : (Number.isFinite(product.ratingCount) ? Number(product.ratingCount) : 0);

  useEffect(() => {
    trackProductView(productId, String(product.category?.name || product.category || 'General'));
  }, [productId, product.category]);

  async function handleToggleWishlist() {
    if (status !== 'authenticated') {
      router.push(`/auth/login?callbackUrl=${encodeURIComponent(`/products/${product.slug}`)}`);
      return;
    }

    // Always toggle local store for immediate UI update
    toggleWishlistLocal(productId);

    // If authenticated, also sync with backend
    try {
      if (isWishlisted) {
        await usersApi.removeFromWishlist(productId);
      } else {
        await usersApi.addToWishlist(productId);
      }
    } catch (err) {
      console.error('Failed to sync wishlist with backend:', err);
      // Rollback local change if backend fails?
      // For now just log, local storage is the primary source of truth for the session.
    }
  }

  return (
    <section className="surface space-y-7 rounded-[28px] p-6 sm:p-8">
      <div className="space-y-4">
        <span className="inline-flex w-fit items-center rounded-full border border-secondary/20 bg-secondary/12 px-3 py-1 text-xs font-semibold tracking-wide text-secondary">New</span>
        <div className="space-y-3">
          <h1 className="max-w-2xl font-display text-[clamp(2rem,3vw,3rem)] font-bold leading-tight text-foreground">{productName}</h1>
          <div className="space-y-2 text-sm text-foreground/60">
            <div>
              <span className="font-medium text-foreground/45">SKU:</span>
              <span className="ml-2">{selectedVariant?.sku || product.sku || `NM-${String(productId).slice(-6)}`}</span>
            </div>
            <div>
              <span className="font-medium text-foreground/45">Seller:</span>
              <span className="ml-2">{product.brand || 'NestMart'}</span>
            </div>
            {product.category && (
              <div>
                <span className="font-medium text-foreground/45">Category:</span>
                <span className="ml-2 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
                  {typeof product.category === 'string' ? product.category : product.category.name}
                </span>
              </div>
            )}
          </div>
        </div>

        <a href="#reviews" className="inline-flex w-fit items-center gap-2 rounded-full bg-background/70 px-3 py-2 text-sm text-foreground/70 transition hover:bg-background focus-ring">
          <div className="flex items-center gap-0.5 text-secondary">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star key={index} className={`h-4 w-4 ${index < Math.max(0, Math.min(5, Math.round(ratingValue))) ? 'fill-current' : ''}`} />
            ))}
          </div>
          <span className="font-medium text-foreground/75">
            {ratingValue > 0 ? ratingValue.toFixed(1) : '0.0'}
          </span>
          <span>({reviewCount} ratings)</span>
        </a>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-end gap-3">
          <p className="font-display text-4xl font-bold tracking-tight text-foreground">{formatPrice(displayPrice)}</p>
          {compareAtPrice && compareAtPrice > displayPrice ? <span className="pb-1 text-sm text-foreground/45 line-through">{formatPrice(compareAtPrice)}</span> : null}
          {discount > 0 ? <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Save {discount}%</span> : null}
        </div>
        <p className="text-sm text-foreground/55">Inclusive of all taxes</p>
      </div>

      <p className="max-w-2xl text-sm leading-7 text-foreground/70">{product.description || product.longDescription}</p>

      {variants.length > 0 && <VariantPicker variants={variants} activeVariantId={selectedVariantId} onChange={setSelectedVariantId} />}

      {availableStock > 0 && availableStock <= 5 ? <p className="text-sm font-semibold text-amber-600">Only {availableStock} left!</p> : null}

      {product.features?.length > 0 ? (
        <div className="space-y-3 rounded-[24px] border border-border/80 bg-background/45 p-4">
          <p className="text-sm font-semibold text-foreground">Highlights</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {product.features.map((feature: string) => (
              <li key={feature} className="flex items-start gap-2 text-sm leading-6 text-foreground/70">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)] lg:items-stretch xl:grid-cols-[auto_minmax(0,1fr)_minmax(0,1fr)_auto]">
        <QuantityStepper value={quantity} onChange={(next) => setQuantity(Math.max(1, Math.min(next, Math.max(availableStock, 1))))} className="justify-between" />
        <Button
          size="lg"
          className="w-full min-w-0 whitespace-nowrap gap-2 rounded-full bg-primary px-4 text-white shadow-sm hover:bg-primary/90 xl:px-6"
          disabled={adding || availableStock === 0}
          onClick={async () => {
            setAdding(true);
            try {
              await addItem(productId, selectedVariantId, quantity);
            } finally {
              setAdding(false);
            }
          }}
        >
          <ShoppingBag className="h-4 w-4" />
          {adding ? 'Adding...' : 'Add to Cart'}
        </Button>
        <Button
          size="lg"
          variant="secondary"
          className="w-full min-w-0 whitespace-nowrap gap-2 rounded-full px-4 text-foreground xl:px-6"
          disabled={availableStock === 0}
          onClick={async () => {
            await addItem(productId, selectedVariantId, quantity);
            router.push('/checkout');
          }}
        >
          Buy Now
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="w-full min-w-0 whitespace-nowrap gap-2 rounded-full px-4 lg:col-span-3 xl:col-span-1 xl:px-6"
          aria-label={isWishlisted ? 'Saved to wishlist' : 'Add to wishlist'}
          aria-pressed={isWishlisted}
          onClick={handleToggleWishlist}
        >
          <Heart className={`h-5 w-5 ${isWishlisted ? 'fill-current text-secondary' : ''}`} />
          <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
        </Button>
      </div>

      <div className="grid gap-3 rounded-[24px] border border-border/80 bg-background/55 p-4 sm:grid-cols-3">
        {trustBadges.map((badge) => {
          const Icon = badge.icon;
          return (
            <div key={badge.label} className="flex items-center gap-3 rounded-2xl px-2 py-1.5 text-sm text-foreground/70">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-medium">{badge.label}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
