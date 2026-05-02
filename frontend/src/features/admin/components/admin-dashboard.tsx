'use client';

import { FormEvent, ReactNode, useEffect, useMemo, useState } from 'react';
import { Activity, AlertTriangle, Boxes, CheckCircle2, IndianRupee, PackageCheck, RefreshCcw, ShieldCheck, UsersRound } from 'lucide-react';
import { adminApi, AdminDashboardStats, AdminInventoryAlert, AdminUser, ApiFetchError } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SectionHeading } from '@/components/ui/section-heading';
import { Badge } from '@/components/ui/badge';

const formatCurrency = (value: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

function StatTile({ label, value, icon }: { label: string; value: string; icon: ReactNode }) {
  return (
    <div className="surface p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-foreground/60">{label}</p>
        <span className="rounded-full bg-primary/10 p-2 text-primary">{icon}</span>
      </div>
      <p className="mt-3 text-2xl font-bold tracking-normal text-foreground">{value}</p>
    </div>
  );
}

export function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [alerts, setAlerts] = useState<AdminInventoryAlert[]>([]);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [days, setDays] = useState(30);
  const [threshold, setThreshold] = useState(10);
  const [productIds, setProductIds] = useState('');
  const [orderIds, setOrderIds] = useState('');
  const [orderStatus, setOrderStatus] = useState('processing');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const topRevenueDay = useMemo(() => {
    if (!stats?.dailyRevenue.length) return null;
    return stats.dailyRevenue.reduce((best, day) => (day.revenue > best.revenue ? day : best), stats.dailyRevenue[0]);
  }, [stats]);

  async function loadDashboard() {
    setLoading(true);
    setError('');
    try {
      const [nextStats, nextAlerts, nextUsers] = await Promise.all([
        adminApi.stats(days),
        adminApi.inventoryAlerts(threshold),
        adminApi.users(1, 8)
      ]);
      setStats(nextStats);
      setAlerts(nextAlerts.items);
      setUsers(nextUsers.items);
    } catch (err) {
      const apiError = err as ApiFetchError;
      setError(apiError.message || 'Unable to load admin data. Sign in as an admin or manager and try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function handleProductBulkUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    const ids = productIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (!ids.length) {
      setError('Add at least one product ID.');
      return;
    }
    try {
      const result = await adminApi.bulkUpdateProducts({ productIds: ids, update: { isActive: false } });
      setMessage(`Products updated: ${result.modified} of ${result.matched} matched.`);
      setProductIds('');
      void loadDashboard();
    } catch (err) {
      setError((err as ApiFetchError).message || 'Product update failed.');
    }
  }

  async function handleOrderBulkUpdate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setError('');
    const ids = orderIds.split(',').map((id) => id.trim()).filter(Boolean);
    if (!ids.length) {
      setError('Add at least one order ID.');
      return;
    }
    try {
      const result = await adminApi.bulkUpdateOrderStatus({ orderIds: ids, status: orderStatus });
      setMessage(`Orders updated: ${result.modified} of ${result.matched} matched.`);
      setOrderIds('');
      void loadDashboard();
    } catch (err) {
      setError((err as ApiFetchError).message || 'Order update failed.');
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <SectionHeading title="Admin Panel" subtitle="Monitor store health, review inventory, and manage operational updates." />
        <Button variant="outline" className="gap-2" onClick={() => void loadDashboard()} disabled={loading}>
          <RefreshCcw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="surface flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
          Stats Range
          <Input type="number" min={1} max={365} value={days} onChange={(event) => setDays(Number(event.target.value))} />
        </label>
        <label className="flex flex-1 flex-col gap-2 text-sm font-medium">
          Stock Alert Threshold
          <Input type="number" min={0} max={1000} value={threshold} onChange={(event) => setThreshold(Number(event.target.value))} />
        </label>
        <Button className="mt-1 sm:mt-7" onClick={() => void loadDashboard()} disabled={loading}>
          Apply
        </Button>
      </div>

      {error ? <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700 dark:border-rose-500/30 dark:bg-rose-950/30 dark:text-rose-200">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-medium text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-950/30 dark:text-emerald-200">{message}</div> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatTile label="Revenue" value={stats ? formatCurrency(stats.revenue) : loading ? 'Loading' : '-'} icon={<IndianRupee className="h-4 w-4" />} />
        <StatTile label="Orders" value={stats ? String(stats.ordersCount) : loading ? 'Loading' : '-'} icon={<PackageCheck className="h-4 w-4" />} />
        <StatTile label="Users" value={stats ? String(stats.usersCount) : loading ? 'Loading' : '-'} icon={<UsersRound className="h-4 w-4" />} />
        <StatTile label="Conversion" value={stats ? `${stats.conversion}%` : loading ? 'Loading' : '-'} icon={<Activity className="h-4 w-4" />} />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.1fr),minmax(340px,0.9fr)]">
        <section className="surface p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">Order Status</h2>
            <Badge tone="muted">{topRevenueDay ? `Best day ${topRevenueDay.date}` : 'No revenue yet'}</Badge>
          </div>
          <div className="mt-4 space-y-3">
            {(stats?.byStatus ?? []).map((item) => (
              <div key={item.status} className="flex items-center justify-between rounded-xl bg-muted/60 px-3 py-2 text-sm">
                <span className="font-medium capitalize">{item.status}</span>
                <span className="text-foreground/70">{item.count}</span>
              </div>
            ))}
            {!loading && !stats?.byStatus.length ? <p className="text-sm text-foreground/60">No orders found for this range.</p> : null}
          </div>
        </section>

        <section className="surface p-5">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">Inventory Alerts</h2>
          </div>
          <div className="mt-4 space-y-3">
            {alerts.map((item) => (
              <div key={item._id} className="flex items-center justify-between gap-3 rounded-xl border border-border px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{item.title}</p>
                  <p className="text-xs text-foreground/60">{formatCurrency(item.price)}</p>
                </div>
                <Badge tone="warning">{item.stock} left</Badge>
              </div>
            ))}
            {!loading && alerts.length === 0 ? <p className="text-sm text-foreground/60">Inventory is above the selected threshold.</p> : null}
          </div>
        </section>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <section className="surface p-5">
          <h2 className="text-lg font-semibold">Bulk Product Action</h2>
          <form className="mt-4 space-y-3" onSubmit={handleProductBulkUpdate}>
            <Input value={productIds} onChange={(event) => setProductIds(event.target.value)} placeholder="Product IDs separated by commas" />
            <Button type="submit" variant="danger" className="gap-2">
              <Boxes className="h-4 w-4" />
              Deactivate Products
            </Button>
          </form>
        </section>

        <section className="surface p-5">
          <h2 className="text-lg font-semibold">Bulk Order Status</h2>
          <form className="mt-4 space-y-3" onSubmit={handleOrderBulkUpdate}>
            <Input value={orderIds} onChange={(event) => setOrderIds(event.target.value)} placeholder="Order IDs separated by commas" />
            <select className="focus-ring h-11 w-full rounded-2xl border border-border bg-card px-3 text-sm" value={orderStatus} onChange={(event) => setOrderStatus(event.target.value)}>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <Button type="submit" className="gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Update Orders
            </Button>
          </form>
        </section>
      </div>

      <section className="surface overflow-hidden p-5">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Recent Users</h2>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-border text-xs uppercase text-foreground/50">
              <tr>
                <th className="py-3 pr-4">Name</th>
                <th className="py-3 pr-4">Email</th>
                <th className="py-3 pr-4">Role</th>
                <th className="py-3 pr-4">Verified</th>
                <th className="py-3 pr-4">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user) => (
                <tr key={user.id}>
                  <td className="py-3 pr-4 font-medium">{user.name ?? 'Customer'}</td>
                  <td className="py-3 pr-4 text-foreground/70">{user.email}</td>
                  <td className="py-3 pr-4 capitalize">{user.role}</td>
                  <td className="py-3 pr-4">{user.emailVerified ? 'Yes' : 'No'}</td>
                  <td className="py-3 pr-4 text-foreground/70">{new Date(user.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!loading && users.length === 0 ? <p className="py-4 text-sm text-foreground/60">No users found.</p> : null}
        </div>
      </section>
    </div>
  );
}
