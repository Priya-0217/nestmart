'use client';

import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { adminApi, type AdminInventoryAlert } from '@/lib/api';
import { AdminMotionCard, AdminPageHeader, AdminToolbar } from '../components/admin-ui';

type InventoryItem = AdminInventoryAlert & { urgency: 'critical' | 'warning' };

export default function InventoryAlertsPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [threshold, setThreshold] = useState(10);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const data = await adminApi.inventoryAlerts(threshold);
      const mapped = data.items.map((item) => ({
        ...item,
        urgency: item.stock === 0 ? ('critical' as const) : ('warning' as const)
      }));
      setItems(mapped);
    } catch (error) {
      console.error('Failed to fetch inventory alerts:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [threshold]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (!query) return true;
      return item.title.toLowerCase().includes(query) || item.slug.toLowerCase().includes(query);
    });
  }, [items, search]);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Inventory Alerts"
        subtitle="Monitor low-stock and out-of-stock products with real-time visibility and reorder prompts."
        actions={[
          {
            key: 'refresh',
            node: (
              <Button variant="outline" onClick={fetchAlerts} disabled={loading} className="rounded-full">
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )
          }
        ]}
      />

      <AdminToolbar
        search={search}
        onSearch={setSearch}
        right={
          <label className="flex items-center gap-2 text-sm font-medium">
            Alert threshold:
            <input
              type="number"
              min="1"
              value={threshold}
              onChange={(event) => setThreshold(Number(event.target.value))}
              className="h-10 w-20 rounded-xl border border-border bg-card px-2"
            />
            units
          </label>
        }
      />

      <div className="grid gap-4">
        {loading ? (
          <AdminMotionCard className="p-6 text-center text-foreground/60">Loading inventory alerts...</AdminMotionCard>
        ) : filtered.length ? (
          filtered.map((item) => (
            <AdminMotionCard key={item._id} className="border-l-4 border-l-amber-500 p-5 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex gap-3">
                  <span className={`rounded-xl p-2.5 ${item.urgency === 'critical' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'}`}>
                    <AlertTriangle className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
                    <p className="text-sm text-foreground/60">SKU: {item.slug}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <div className="rounded-2xl bg-muted/35 px-3 py-1.5 text-center">
                    <p className="text-xs uppercase tracking-[0.12em] text-foreground/45">Stock</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{item.stock}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/35 px-3 py-1.5 text-center">
                    <p className="text-xs uppercase tracking-[0.12em] text-foreground/45">Price</p>
                    <p className="mt-1 text-xl font-semibold text-foreground">{formatPrice(item.price)}</p>
                  </div>
                  <Badge tone={item.urgency === 'critical' ? 'warning' : 'default'}>{item.urgency === 'critical' ? 'Out of Stock' : 'Low Stock'}</Badge>
                </div>
              </div>
            </AdminMotionCard>
          ))
        ) : (
          <AdminMotionCard className="p-6 text-center text-foreground/60">All inventory levels are healthy. No alerts to show.</AdminMotionCard>
        )}
      </div>
    </div>
  );
}
