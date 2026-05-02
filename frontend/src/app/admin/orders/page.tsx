'use client';

import { useEffect, useState } from 'react';
import { RefreshCw, CheckCircle2, Truck, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { formatPrice, cn } from '@/lib/utils';
import { Select } from '@/components/ui/select';
import { orderRows as mockOrders } from '../components/admin-data';

type Order = {
  _id: string;
  customer: string;
  total: number;
  status: 'pending' | 'shipped' | 'delivered';
  createdAt: string;
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/orders');
      const data = await res.json();
      
      if (data && data.length > 0) {
        setOrders(data);
        setIsMock(false);
      } else {
        // Fallback to mock data
        setOrders(mockOrders.map(o => ({
          _id: o.id,
          customer: o.customer,
          total: o.amount,
          status: o.status.toLowerCase() as any,
          createdAt: o.date
        })));
        setIsMock(true);
      }
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Fallback on error
      setOrders(mockOrders.map(o => ({
        _id: o.id,
        customer: o.customer,
        total: o.amount,
        status: o.status.toLowerCase() as any,
        createdAt: o.date
      })));
      setIsMock(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (res.ok) {
        setOrders(orders.map(order => 
          order._id === id ? { ...order, status: newStatus as any } : order
        ));
      }
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered': return <CheckCircle2 className="h-4 w-4 mr-1.5" />;
      case 'shipped': return <Truck className="h-4 w-4 mr-1.5" />;
      default: return <Clock className="h-4 w-4 mr-1.5" />;
    }
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'delivered': return 'success';
      case 'shipped': return 'warning';
      default: return 'muted';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-3xl font-semibold tracking-tight text-foreground">Orders Management</h2>
          {isMock && (
            <Badge tone="warning" className="rounded-full px-3 py-0.5 text-[10px] uppercase tracking-wider">
              Demo Data
            </Badge>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={fetchOrders} disabled={loading} className="rounded-full">
          <RefreshCw className={cn('mr-2 h-4 w-4', loading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden p-0 border-none shadow-sm">
        <div className="overflow-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-foreground/70 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-semibold">Order ID</th>
                <th className="px-6 py-4 font-semibold">Customer</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-right">Amount</th>
                <th className="px-6 py-4 font-semibold text-center">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-foreground/40 italic">
                    Loading orders...
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-foreground/40 italic">
                    No orders found.
                  </td>
                </tr>
              ) : (
                orders.map((order) => (
                  <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-foreground/60">{order._id}</td>
                    <td className="px-6 py-4 font-medium text-foreground">{order.customer}</td>
                    <td className="px-6 py-4 text-foreground/60">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-foreground">
                      {formatPrice(order.total)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <Badge tone={getStatusTone(order.status)} className="capitalize inline-flex items-center">
                        {getStatusIcon(order.status)}
                        {order.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Select 
                        value={order.status} 
                        onChange={(e) => handleUpdateStatus(order._id, e.target.value)}
                        disabled={updatingId === order._id}
                        className="w-32 ml-auto"
                      >
                        <option value="pending">Pending</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                      </Select>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}