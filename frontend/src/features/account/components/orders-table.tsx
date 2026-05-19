import Link from 'next/link';
import { Order } from '@/lib/types';
import { formatDate, formatPrice } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

function statusTone(status: Order['status']) {
  if (status === 'Delivered') {
    return 'success';
  }
  if (status === 'Cancelled') {
    return 'warning';
  }
  return 'muted';
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  return (
    <section className="surface overflow-hidden">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
        <p className="mt-1 text-xs text-foreground/55">Track the latest updates on your purchases.</p>
      </div>

      <div className="space-y-3 p-4 sm:hidden">
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-border bg-card p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-foreground">{order.id}</p>
                <p className="text-xs text-foreground/65">{formatDate(order.date)}</p>
              </div>
              <Badge tone={statusTone(order.status)}>{order.status}</Badge>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div className="rounded-lg bg-muted/55 px-2.5 py-2">
                <p className="text-[11px] uppercase tracking-wide text-foreground/55">Items</p>
                <p className="mt-0.5 font-medium text-foreground">{order.itemCount}</p>
              </div>
              <div className="rounded-lg bg-muted/55 px-2.5 py-2">
                <p className="text-[11px] uppercase tracking-wide text-foreground/55">Total</p>
                <p className="mt-0.5 font-medium text-foreground">{formatPrice(order.total)}</p>
              </div>
            </div>
            <div className="mt-3">
              <Link
                href={order.orderId ? `/account/orders/${order.orderId}` : '/account/orders'}
                className="inline-flex h-9 w-full items-center justify-center rounded-xl border border-border px-3 text-sm font-medium text-foreground/80 transition hover:bg-muted"
              >
                View Details & Review
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-muted/50 text-foreground/65">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-border transition-colors hover:bg-muted/30">
                <td className="px-5 py-3 font-semibold text-foreground">{order.id}</td>
                <td className="px-5 py-3 text-foreground/70">{formatDate(order.date)}</td>
                <td className="px-5 py-3 text-foreground/70">{order.itemCount}</td>
                <td className="px-5 py-3 text-foreground/80">{formatPrice(order.total)}</td>
                <td className="px-5 py-3">
                  <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                </td>
                <td className="px-5 py-3 text-right">
                  <Link
                    href={order.orderId ? `/account/orders/${order.orderId}` : '/account/orders'}
                    className="inline-flex h-9 items-center justify-center rounded-xl border border-border px-3 text-sm font-medium text-foreground/80 transition hover:bg-muted"
                  >
                    Review Products
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
