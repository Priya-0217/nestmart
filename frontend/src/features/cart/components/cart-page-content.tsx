'use client';

import { useEffect, useMemo, useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { CartLineItem } from '@/features/cart/components/cart-line-item';
import { CartList } from '@/features/cart/components/cart-list';
import { CartSummary } from '@/features/cart/components/cart-summary';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeading } from '@/components/ui/section-heading';
import { productsApi } from '@/lib/api';
import { useCartStore } from '@/store/cart-store';

export function CartPageContent() {
  const items = useCartStore((state) => state.items);
  const totals = useCartStore((state) => state.totals);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);
  const syncWithBackend = useCartStore((state) => state.syncWithBackend);
  
  const [fallbackProducts, setFallbackProducts] = useState<Record<string, { title: string; image: string; price: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      await syncWithBackend();
      if (active) setLoading(false);
    };
    load();
    return () => { active = false; };
  }, [syncWithBackend]);

  useEffect(() => {
    if (items.length === 0) return;

    let active = true;
    const loadFallbackProducts = async () => {
      try {
        const productIds = Array.from(new Set(items.map((item) => item.productId)));
        const results = await Promise.all(
          productIds.map(async (productId) => {
            const product = await productsApi.get(productId);
            return {
              productId,
              title: product.title ?? 'Product',
              image: product.images?.[0] ?? '/product-placeholder.svg',
              price: product.price ?? 0
            };
          })
        );
        if (!active) return;
        setFallbackProducts((prev) => {
          const next = { ...prev };
          for (const result of results) {
            next[result.productId] = { title: result.title, image: result.image, price: result.price };
          }
          return next;
        });
      } catch {
        // Ignore product lookup failures for fallback view.
      }
    };
    void loadFallbackProducts();
    return () => {
      active = false;
    };
  }, [items]);

  const lines = useMemo(() => {
    return items
      .map((item) => {
        const product = fallbackProducts[item.productId];
        if (!product) return null;
        return {
          productId: item.productId,
          productSlug: item.productId,
          productName: product.title,
          image: product.image,
          variantName: 'Standard',
          quantity: item.quantity,
          unitPrice: product.price
        };
      })
      .filter((line): line is NonNullable<typeof line> => Boolean(line));
  }, [fallbackProducts, items]);

  const subtotal = useMemo(() => {
    return lines.reduce((sum, line) => sum + line.unitPrice * line.quantity, 0);
  }, [lines]);

  const shipping = useMemo(() => {
    if (totals && subtotal === totals.subtotal) {
      return totals.shipping;
    }
    return subtotal > 0 ? 18 : 0;
  }, [totals, subtotal]);

  const tax = useMemo(() => {
    if (totals && subtotal === totals.subtotal) {
      return totals.tax;
    }
    return Math.round(subtotal * 0.08);
  }, [totals, subtotal]);

  return (
    <div className="space-y-5">
      <SectionHeading title="Shopping Cart" subtitle="Update quantities, remove items, or continue to secure checkout." />

      {loading ? (
        <div className="surface p-6 text-sm text-foreground/60">Loading cart...</div>
      ) : lines.length === 0 ? (
        <EmptyState
          title="Your cart is empty"
          description="Add products to your cart to begin checkout."
          ctaLabel="Browse Products"
          ctaHref="/products"
          icon={<ShoppingBag className="h-7 w-7" />}
        />
      ) : (
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1fr),340px]">
          <CartList>
            {lines.map((line) =>
              line ? (
                <CartLineItem
                  key={`${line.productId}-default`}
                  productSlug={line.productSlug}
                  productName={line.productName}
                  image={line.image}
                  variantName={line.variantName}
                  quantity={line.quantity}
                  unitPrice={line.unitPrice}
                  onQuantityChange={(next) => updateQuantity(line.productId, 'default', next)}
                  onRemove={() => removeItem(line.productId, 'default')}
                />
              ) : null
            )}
          </CartList>
          <CartSummary subtotal={subtotal} shipping={shipping} tax={tax} />
        </section>
      )}
    </div>
  );
}
