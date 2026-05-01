import { AlertTriangle, Boxes, PackageCheck, ReceiptText, Users } from 'lucide-react';
import { StatCard } from '@/features/account/components/stat-card';
import { OrdersTable } from '@/features/account/components/orders-table';
import { AdminSidebar } from '@/features/admin/components/admin-sidebar';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';
import { orders, products } from '@/data/catalog';

export function AdminPageContent() {
  const deliveredOrders = orders.filter((order) => order.status === 'Delivered').length;
  const processingOrders = orders.filter((order) => order.status === 'Processing').length;
  const lowStockProducts = products.filter((product) => product.stock <= 20);
  const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

  return (
    <div className="space-y-4 sm:space-y-5">
      <SectionHeading title="Admin Dashboard" subtitle="Monitor storefront performance, order activity, and inventory health from one place." />

      <div className="grid gap-4 lg:grid-cols-[220px,minmax(0,1fr)] lg:gap-5">
        <AdminSidebar />

        <div className="space-y-4 sm:space-y-5">
          <section id="overview" className="scroll-mt-24 space-y-4">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard label="Total Orders" value={String(orders.length)} icon={<ReceiptText className="h-4 w-4 text-primary" />} />
              <StatCard label="Delivered" value={String(deliveredOrders)} icon={<PackageCheck className="h-4 w-4 text-primary" />} />
              <StatCard label="Low Stock" value={String(lowStockProducts.length)} icon={<AlertTriangle className="h-4 w-4 text-primary" />} />
              <StatCard label="Revenue" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(totalRevenue)} icon={<Users className="h-4 w-4 text-primary" />} />
            </div>
          </section>

          <section id="orders" className="scroll-mt-24">
            <OrdersTable orders={orders} />
          </section>

          <section id="inventory" className="surface scroll-mt-24 p-5 sm:p-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold">Inventory alerts</h2>
                <p className="mt-1 text-sm text-foreground/65">Products nearing stock limits and categories that may need replenishment soon.</p>
              </div>
              <Badge tone="muted">{lowStockProducts.length} items flagged</Badge>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {lowStockProducts.slice(0, 6).map((product) => (
                <article key={product.id} className="rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-foreground">{product.name}</p>
                      <p className="mt-1 text-sm text-foreground/65">{product.category} • {product.brand}</p>
                    </div>
                    <Badge tone={product.stock <= 10 ? 'warning' : 'muted'}>{product.stock} left</Badge>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section id="settings" className="surface scroll-mt-24 p-5 sm:p-6">
            <div className="flex items-center gap-2">
              <Boxes className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold">Operations settings</h2>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">Storefront notices</p>
                <p className="mt-1 text-sm text-foreground/65">Homepage banners and service announcements can be configured here in a future iteration.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">Fulfillment workflow</p>
                <p className="mt-1 text-sm text-foreground/65">Shipment SLA and courier settings will live alongside order operations as this dashboard expands.</p>
              </div>
              <div className="rounded-xl border border-border bg-card p-4">
                <p className="text-sm font-medium text-foreground">Team access</p>
                <p className="mt-1 text-sm text-foreground/65">Admin roles and audit controls can be added without changing the shell structure introduced here.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
