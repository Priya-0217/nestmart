'use client';

import { useEffect, useState } from 'react';
import { BadgeDollarSign, Boxes, ReceiptText, RefreshCw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { productRows as mockProducts, orderRows as mockOrders } from '../components/admin-data';

type Metrics = {
  products: number;
  orders: number;
  revenue: number;
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMetrics = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/metrics');
      const data = await res.json();
      
      // If backend returns empty metrics, we'll calculate them from our mock data
      if (!data || (data.products === 0 && data.orders === 0)) {
        setMetrics({
          products: mockProducts.length,
          orders: mockOrders.length,
          revenue: mockOrders.reduce((sum, order) => sum + order.amount, 0)
        });
      } else {
        setMetrics(data);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
      // Fallback on error
      setMetrics({
        products: mockProducts.length,
        orders: mockOrders.length,
        revenue: mockOrders.reduce((sum, order) => sum + order.amount, 0)
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  const stats = [
    { label: 'Total Products', value: metrics?.products ?? 0, icon: Boxes, color: 'text-blue-600', bg: 'bg-blue-100' },
    { label: 'Total Orders', value: metrics?.orders ?? 0, icon: ReceiptText, color: 'text-orange-600', bg: 'bg-orange-100' },
    { label: 'Total Revenue', value: formatPrice(metrics?.revenue ?? 0), icon: BadgeDollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Dashboard Overview</h2>
          {metrics?.products === mockProducts.length && (
            <Badge tone="warning" className="rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider">
              Demo Data
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchMetrics} 
            disabled={loading}
            className="rounded-full"
          >
            <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-6 transition-all hover:shadow-md">
              <div className="flex items-center gap-4">
                <div className={cn('rounded-2xl p-3', stat.bg, stat.color)}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground/60">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground">
                    {loading ? '...' : stat.value}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="p-8 text-center bg-muted/30 border-dashed">
        <h3 className="text-lg font-medium text-foreground">Welcome to the Admin Panel</h3>
        <p className="mt-2 text-sm text-foreground/60 max-w-md mx-auto">
          Use the sidebar to manage your products and orders. This dashboard provides a quick snapshot of your business performance.
        </p>
      </Card>
    </div>
  );
}