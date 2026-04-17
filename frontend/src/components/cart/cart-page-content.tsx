'use client';

import { ShoppingBag } from 'lucide-react';
import { CartLineItem } from '@/components/cart/cart-line-item';
import { CartList } from '@/components/cart/cart-list';
import { CartSummary } from '@/components/cart/cart-summary';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeading } from '@/components/ui/section-heading';
import { getProductById } from '@/data/catalog';
import { useCartStore } from '@/store/cart-store';

export function CartPageContent() {
  const items = useCartStore((state) => state.items);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const removeItem = useCartStore((state) => state.removeItem);

  const lines = items
    .map((item) => {
      const product = getProductById(item.productId);
      const variant = product?.variants.find((option) => option.id === item.variantId);
      if (!product || !variant) {
        return null;
      }
      return {
        item,
        product,
        variant,
        lineTotal: variant.price * item.quantity
      };
    })
    .filter(Boolean);

  const subtotal = lines.reduce((sum, line) => sum + (line?.lineTotal ?? 0), 0);
  const shipping = subtotal > 0 ? 18 : 0;
  const tax = Math.round(subtotal * 0.08);

  return (
    <div className="space-y-5">
      <SectionHeading title="Shopping Cart" subtitle="Update quantities, remove items, or continue to secure checkout." />

      {lines.length === 0 ? (
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
                  key={`${line.product.id}-${line.variant.id}`}
                  productSlug={line.product.slug}
                  productName={line.product.name}
                  image={line.product.images[0]}
                  variantName={line.variant.name}
                  quantity={line.item.quantity}
                  unitPrice={line.variant.price}
                  onQuantityChange={(next) => updateQuantity(line.product.id, line.variant.id, next)}
                  onRemove={() => removeItem(line.product.id, line.variant.id)}
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
