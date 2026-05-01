'use client';

import Link from 'next/link';
import { CheckCircle2, Package, Truck } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckoutSectionCard } from '@/features/checkout/components/checkout-section-card';
import { OrderReview } from '@/features/checkout/components/order-review';
import { formatDate, formatPrice } from '@/lib/utils';
import { useCheckoutStore } from '@/store/checkout-store';

export function OrderConfirmationPageContent() {
  const order = useCheckoutStore((state) => state.lastCompletedOrder);

  if (!order) {
    return (
      <EmptyState
        title="No recent order found"
        description="Complete checkout to view your order confirmation and delivery summary here."
        ctaLabel="Browse Products"
        ctaHref="/products"
      />
    );
  }

  const shippingMethodLabel = order.shipping.shippingMethod === 'standard' ? 'Standard (3-5 days)' : 'Express (1-2 days)';
  const reviewLines = [
    { label: 'Contact', value: `${order.contact.firstName} ${order.contact.lastName} • ${order.contact.email}` },
    {
      label: 'Ship to',
      value: `${order.shipping.address}, ${order.shipping.city}, ${order.shipping.state} ${order.shipping.postalCode}, ${order.shipping.country}`
    },
    { label: 'Shipping', value: shippingMethodLabel },
    { label: 'Payment', value: `Card ending in ${order.paymentLast4}` },
    ...order.lines.map((line) => ({
      label: `${line.title} (${line.variant}) x ${line.quantity}`,
      value: formatPrice(line.total)
    }))
  ];

  return (
    <div className="space-y-5">
      <CheckoutSectionCard
        title="Order confirmed"
        description="Your order has been placed successfully. A confirmation email is on the way with tracking updates and delivery details."
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <div className="space-y-2 text-sm text-foreground/75">
              <p className="font-medium text-foreground">Thanks for shopping with NestMart.</p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{order.id}</Badge>
                <Badge tone="muted">{order.status}</Badge>
                <Badge tone="muted">{formatDate(order.date)}</Badge>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/account">
              <Button>Go to Account</Button>
            </Link>
            <Link href="/products">
              <Button variant="outline">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </CheckoutSectionCard>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr),360px]">
        <div className="space-y-4">
          <CheckoutSectionCard title="Delivery details">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/45 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Package className="h-4 w-4 text-primary" />
                  Contact
                </div>
                <p className="text-sm text-foreground/70">{order.contact.firstName} {order.contact.lastName}</p>
                <p className="text-sm text-foreground/70">{order.contact.email}</p>
                <p className="text-sm text-foreground/70">{order.contact.phone}</p>
              </div>
              <div className="rounded-xl border border-border bg-muted/45 p-4">
                <div className="mb-2 flex items-center gap-2 text-sm font-medium text-foreground">
                  <Truck className="h-4 w-4 text-primary" />
                  Shipping
                </div>
                <p className="text-sm text-foreground/70">{order.shipping.address}</p>
                <p className="text-sm text-foreground/70">{order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}</p>
                <p className="text-sm text-foreground/70">{order.shipping.country}</p>
                <p className="mt-2 text-sm font-medium text-foreground">{shippingMethodLabel}</p>
              </div>
            </div>
          </CheckoutSectionCard>

          <CheckoutSectionCard title="What happens next">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">Order processing</p>
                <p className="mt-1 text-sm text-foreground/65">We are confirming inventory and preparing your shipment now.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">Shipping updates</p>
                <p className="mt-1 text-sm text-foreground/65">Tracking details will be sent to {order.contact.email} once the package leaves our warehouse.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">Need help?</p>
                <p className="mt-1 text-sm text-foreground/65">Visit your account dashboard to review orders or continue browsing for more essentials.</p>
              </div>
            </div>
          </CheckoutSectionCard>
        </div>

        <aside className="space-y-4">
          <CheckoutSectionCard title="Order summary" description={`${order.itemCount} item${order.itemCount === 1 ? '' : 's'} in this order.`}>
            <OrderReview lines={reviewLines} subtotal={order.subtotal} shipping={order.shippingFee} tax={order.tax} />
          </CheckoutSectionCard>
        </aside>
      </div>
    </div>
  );
}
