'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BadgeDollarSign, MousePointerClick, ReceiptText, RefreshCw, Users } from 'lucide-react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { NameType, ValueType } from 'recharts/types/component/DefaultTooltipContent';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { adminApi, type AdminDashboardStats } from '@/lib/api';
import { adminShortcuts } from '../components/admin-data';
import { AdminMotionCard, AdminPageHeader } from '../components/admin-ui';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await adminApi.stats(30);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
      setMetrics(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const trafficSeries = useMemo(() => {
    if (!metrics?.dailyRevenue?.length) return [];
    return metrics.dailyRevenue.slice(-7).map((item) => ({
      name: new Date(item.date).toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: item.revenue,
      orders: item.orders
    }));
  }, [metrics]);

  const kpis = [
    {
      label: 'Revenue',
      value: formatPrice(metrics?.revenue ?? 0),
      sub: 'Last 30 days',
      icon: BadgeDollarSign,
      tone: 'text-primary'
    },
    {
      label: 'Orders',
      value: String(metrics?.ordersCount ?? 0),
      sub: 'All channels',
      icon: ReceiptText,
      tone: 'text-secondary'
    },
    {
      label: 'Users',
      value: String(metrics?.usersCount ?? 0),
      sub: 'Total registered',
      icon: Users,
      tone: 'text-sky-600'
    },
    {
      label: 'Conversion',
      value: `${(metrics?.conversion ?? 0).toFixed(2)}%`,
      sub: 'Storefront checkout',
      icon: MousePointerClick,
      tone: 'text-emerald-600'
    }
  ];

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Executive Dashboard"
        subtitle="Track revenue, orders, traffic, and conversion in one operating view."
        actions={[
          {
            key: 'refresh',
            node: (
              <Button variant="outline" onClick={fetchMetrics} disabled={loading} className="rounded-full">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )
          }
        ]}
        chips={error ? <Badge tone="warning">Live API unavailable</Badge> : <Badge tone="success">Live admin telemetry</Badge>}
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpis.map((stat) => {
          const Icon = stat.icon;
          return (
            <AdminMotionCard key={stat.label} className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-foreground/60">{stat.label}</p>
                  <p className="mt-2 text-2xl font-semibold text-foreground">{loading ? '...' : stat.value}</p>
                  <p className="mt-1 text-xs text-foreground/45">{stat.sub}</p>
                </div>
                <span className={`rounded-xl bg-muted/50 p-2.5 ${stat.tone}`}>
                  <Icon className="h-5 w-5" />
                </span>
              </div>
            </AdminMotionCard>
          );
        })}
      </div>

      <div className="grid gap-6">
        <AdminMotionCard className="p-5 sm:p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground">Revenue and orders trend</h3>
              <p className="text-sm text-foreground/60">Performance over the last 7 days of activity.</p>
            </div>
          </div>

          <div className="h-72 w-full">
            {trafficSeries.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trafficSeries}>
                  <defs>
                    <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1A56DB" stopOpacity="0.35" />
                      <stop offset="95%" stopColor="#1A56DB" stopOpacity="0" />
                    </linearGradient>
                    <linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F59E0B" stopOpacity="0.3" />
                      <stop offset="95%" stopColor="#F59E0B" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.25)" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'rgb(100 116 139)' }} />
                  <YAxis yAxisId="left" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'rgb(100 116 139)' }} />
                  <YAxis yAxisId="right" orientation="right" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: 'rgb(100 116 139)' }} />
                  {/* Fixed Recharts Tooltip formatter types for production build */}
                  <Tooltip
                    formatter={(value: ValueType | undefined, name: NameType | undefined) => {
                      const isRevenue = name === 'revenue';
                      const label = isRevenue ? 'Revenue' : 'Orders';
                      const numValue = typeof value === 'number' ? value : Number(value || 0);
                      const displayValue = isRevenue ? formatPrice(numValue) : numValue;
                      return [displayValue, label];
                    }}
                  />
                  <Area yAxisId="left" type="monotone" dataKey="revenue" stroke="#1A56DB" fill="url(#revenueFill)" strokeWidth={2.5} />
                  <Area yAxisId="right" type="monotone" dataKey="orders" stroke="#F59E0B" fill="url(#ordersFill)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-full items-center justify-center text-sm text-foreground/40">
                No trend data available for this period.
              </div>
            )}
          </div>
        </AdminMotionCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.25fr,1fr]">
        <AdminMotionCard className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Order status snapshot</h3>
          <p className="text-sm text-foreground/60">Operational queue requiring attention.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {(metrics?.byStatus ?? []).length > 0 ? (
              metrics?.byStatus.map((row) => (
                <div key={row.status} className="rounded-2xl border border-border/70 bg-card/70 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-foreground/45">{row.status}</p>
                  <p className="mt-1 text-2xl font-semibold text-foreground">{row.count}</p>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-sm text-foreground/40 border border-dashed rounded-2xl">
                No orders found in the database.
              </div>
            )}
          </div>
        </AdminMotionCard>

        <AdminMotionCard className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Operator shortcuts</h3>
          <p className="text-sm text-foreground/60">Frequently used high-impact admin actions.</p>
          <div className="mt-4 space-y-2">
            {adminShortcuts.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} href={item.href} className="group flex items-center justify-between rounded-2xl border border-border/70 bg-card px-4 py-3 hover:border-primary/35 hover:bg-primary/5">
                  <div className="flex items-center gap-3">
                    <span className="rounded-xl bg-muted p-2 text-primary">
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className="font-medium text-foreground">{item.label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-foreground/45 transition group-hover:text-primary" />
                </Link>
              );
            })}
          </div>
        </AdminMotionCard>
      </div>
    </div>
  );
}
