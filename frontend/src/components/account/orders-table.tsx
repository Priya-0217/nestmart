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
      <div className="border-b border-border px-4 py-4 sm:px-5">
        <h2 className="text-lg font-semibold">Recent Orders</h2>
      </div>

      <div className="space-y-3 p-4 sm:hidden">
        {orders.map((order) => (
          <article key={order.id} className="rounded-xl border border-border bg-white p-3">
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
          </article>
        ))}
      </div>

      <div className="hidden overflow-x-auto sm:block">
        <table className="w-full min-w-[620px] text-left text-sm">
          <thead className="bg-muted/65 text-foreground/65">
            <tr>
              <th className="px-5 py-3 font-medium">Order</th>
              <th className="px-5 py-3 font-medium">Date</th>
              <th className="px-5 py-3 font-medium">Items</th>
              <th className="px-5 py-3 font-medium">Total</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-t border-border">
                <td className="px-5 py-3 font-semibold">{order.id}</td>
                <td className="px-5 py-3">{formatDate(order.date)}</td>
                <td className="px-5 py-3">{order.itemCount}</td>
                <td className="px-5 py-3">{formatPrice(order.total)}</td>
                <td className="px-5 py-3">
                  <Badge tone={statusTone(order.status)}>{order.status}</Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
