'use client';

import Link from 'next/link';
import { ArrowRight, CalendarDays, CheckCircle2, CreditCard, Package, ShoppingBag, Truck } from 'lucide-react';
import { EmptyState } from '@/components/ui/empty-state';
import { Badge } from '@/components/ui/badge';
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
  const orderDate = formatDate(order.date);
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
    <div className="mx-auto max-w-6xl space-y-8 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] border border-primary/10 bg-gradient-to-br from-primary via-[#4f6fed] to-[#273b96] px-6 py-8 text-primary-foreground shadow-[0_30px_90px_rgba(26,86,219,0.28)] sm:px-10 sm:py-10 lg:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.12),transparent_30%)]" />
        <div className="relative grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <Badge tone="default" className="bg-white/15 text-white backdrop-blur-md">Order received</Badge>
              <Badge tone="muted" className="bg-white/10 text-white/85 backdrop-blur-md">#{order.id}</Badge>
            </div>

            <div className="space-y-3">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-white/15 text-white shadow-lg shadow-black/10 backdrop-blur-md">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h1 className="text-4xl font-black tracking-tight sm:text-5xl">Order confirmed</h1>
              <p className="max-w-2xl text-base leading-7 text-white/82 sm:text-lg">
                Thanks for your purchase. We’ve received your order and started processing it right away. You’ll find everything you need to track the delivery below.
              </p>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-white/80">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                <CalendarDays className="h-4 w-4" />
                Placed {orderDate}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                <ShoppingBag className="h-4 w-4" />
                {order.itemCount} item{order.itemCount === 1 ? '' : 's'}
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 backdrop-blur-md">
                <CreditCard className="h-4 w-4" />
                Paid with {order.paymentLast4}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                href="/account"
                className="inline-flex h-12 items-center justify-center rounded-full bg-white px-6 text-sm font-semibold text-primary transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/95"
              >
                View order status
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
              <Link
                href="/products"
                className="inline-flex h-12 items-center justify-center rounded-full border border-white/25 bg-white/10 px-6 text-sm font-semibold text-white backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/15"
              >
                Continue shopping
              </Link>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 rounded-[2rem] bg-white/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-white/12 p-6 backdrop-blur-xl shadow-2xl shadow-black/10">
              <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.28em] text-white/65">Receipt snapshot</p>
                  <p className="mt-1 text-lg font-bold text-white">Order #{order.id}</p>
                </div>
                <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/85">
                  {order.status}
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/55">Placed</p>
                  <p className="mt-1 text-sm font-medium text-white">{orderDate}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/55">Total</p>
                  <p className="mt-1 text-sm font-medium text-white">{formatPrice(order.total)}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/55">Shipping</p>
                  <p className="mt-1 text-sm font-medium text-white">{shippingMethodLabel}</p>
                </div>
                <div className="rounded-2xl bg-white/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/55">Payment</p>
                  <p className="mt-1 text-sm font-medium text-white">Ending {order.paymentLast4}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 h-72 w-72 rounded-full bg-black/10 blur-3xl" />
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr,380px]">
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between gap-3 px-2">
              <h2 className="text-xl font-bold">Delivery & contact</h2>
              <Badge tone="success">Processing</Badge>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="group rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-2.5 text-primary transition-transform group-hover:scale-110">
                    <Package className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground">Customer Info</h3>
                </div>
                <div className="space-y-1.5 text-sm text-foreground/70">
                  <p className="font-semibold text-foreground">{order.contact.firstName} {order.contact.lastName}</p>
                  <p>{order.contact.email}</p>
                  <p>{order.contact.phone}</p>
                </div>
              </div>

              <div className="group rounded-[1.75rem] border border-border/70 bg-card p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-2xl bg-primary/10 p-2.5 text-primary transition-transform group-hover:scale-110">
                    <Truck className="h-5 w-5" />
                  </div>
                  <h3 className="font-bold text-foreground">Shipping Details</h3>
                </div>
                <div className="space-y-1.5 text-sm text-foreground/70">
                  <p className="font-semibold text-foreground">{order.shipping.address}</p>
                  <p>{order.shipping.city}, {order.shipping.state} {order.shipping.postalCode}</p>
                  <p>{order.shipping.country}</p>
                  <div className="mt-3 inline-block rounded-full bg-muted px-3 py-1 text-xs font-bold uppercase tracking-wider text-foreground/60">
                    {shippingMethodLabel}
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="px-2 text-xl font-bold">What’s next?</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { title: 'Processing', desc: 'We are confirming inventory and preparing your items.' },
                { title: 'Shipping', desc: `Tracking details will be sent to ${order.contact.email} shortly.` },
                { title: 'Delivery', desc: 'Our courier will contact you once the package is nearby.' }
              ].map((step, i) => (
                <div key={step.title} className="relative rounded-[1.75rem] border border-border/70 bg-gradient-to-b from-card to-muted/20 p-6 shadow-sm">
                  <span className="absolute -left-3 -top-3 flex h-8 w-8 items-center justify-center rounded-full border border-border bg-card text-xs font-black shadow-sm">
                    {i + 1}
                  </span>
                  <h4 className="font-bold text-foreground">{step.title}</h4>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/60">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-border/70 bg-card shadow-sm">
            <div className="border-b border-border/70 bg-muted/20 px-6 py-5">
              <h2 className="text-lg font-bold">Order Summary</h2>
            </div>
            <div className="p-6">
              <OrderReview 
                lines={reviewLines} 
                subtotal={order.subtotal} 
                shipping={order.shippingFee} 
                tax={order.tax} 
              />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
