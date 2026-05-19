"use client";

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { Package, Search } from 'lucide-react';
import { ordersApi, type Order as ApiOrder } from '@/lib/api';
import { formatDate, formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { SectionHeading } from '@/components/ui/section-heading';

function statusTone(status: string) {
  if (status === 'delivered') return 'success';
  if (status === 'cancelled' || status === 'returned' || status === 'refunded') return 'warning';
  return 'muted';
}

export default function Page() {
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    ordersApi
      .listMine(1, 50)
      .then((result) => {
        if (mounted) setOrders(result.items);
      })
      .catch(() => {
        if (mounted) setOrders([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const filteredOrders = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return orders;
    return orders.filter((order) => {
      const haystacks = [order.orderNumber, order.status, order.paymentStatus, order.paymentMethod, ...order.items.map((item) => item.title)];
      return haystacks.some((value) => value.toLowerCase().includes(term));
    });
  }, [orders, query]);

  return (
    <div className="space-y-6">
      <SectionHeading title="My Orders" subtitle="Review your order history, track fulfillment, and open any purchase to leave or edit a product review." />

      <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 rounded-full border border-border bg-card px-3 py-2 text-sm text-foreground/70 sm:min-w-80">
          <Search className="h-4 w-4" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search order number, status, or product name"
            className="w-full bg-transparent outline-none placeholder:text-foreground/40"
          />
        </div>
        <p className="text-sm text-foreground/60">{filteredOrders.length} order{filteredOrders.length === 1 ? '' : 's'}</p>
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <div key={index} className="h-48 animate-pulse rounded-3xl bg-muted/60" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          icon={<Package className="h-6 w-6" />}
          title="No orders yet"
          description="Your purchases will appear here once checkout is complete."
          ctaLabel="Browse products"
          ctaHref="/products"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredOrders.map((order) => (
            <article key={order._id} className="surface flex h-full flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">{order.orderNumber}</p>
                  <h3 className="mt-1 text-lg font-semibold text-foreground">{formatPrice(order.total)}</h3>
                  <p className="text-sm text-foreground/60">Placed {formatDate(order.placedAt ?? order.createdAt ?? new Date().toISOString())}</p>
                </div>
                <Badge tone={statusTone(order.status)} className="capitalize">
                  {order.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="mt-4 space-y-2 text-sm text-foreground/70">
                <p>{order.items.reduce((sum, item) => sum + item.quantity, 0)} item{order.items.length === 1 ? '' : 's'}</p>
                <p className="line-clamp-2">{order.items.map((item) => item.title).join(', ')}</p>
              </div>

              <div className="mt-5 flex items-center justify-between gap-3 border-t border-border pt-4">
                <div className="text-xs text-foreground/55">
                  <p>{order.paymentMethod.toUpperCase()} / {order.paymentStatus}</p>
                </div>
                <Link
                  href={`/account/orders/${order._id}`}
                  className="button-interactive group focus-ring inline-flex h-11 min-w-[44px] items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white transition-all duration-300 ease-in-out hover:bg-primary/90 hover:shadow-glow"
                >
                  View details & review
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
