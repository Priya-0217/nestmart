'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, RefreshCw, Truck } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatPrice } from '@/lib/utils';
import { adminOrdersApi, type Order as ApiOrder } from '@/lib/api';
import { AdminMotionCard, AdminPageHeader, AdminToolbar } from '../components/admin-ui';

type Order = {
  _id: string;
  customer: string;
  total: number;
  status: string;
  createdAt: string;
  paymentStatus?: string;
};

const statusOptions = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed', 'return_requested', 'returned'];
const PAGE_SIZE = 10;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await adminOrdersApi.list(1, 100);
      const mapped = data.items.map((order: ApiOrder) => ({
        _id: order._id,
        customer: order.shippingAddress.fullName,
        total: order.total,
        status: order.status,
        paymentStatus: order.paymentStatus,
        createdAt: order.placedAt ?? order.createdAt ?? new Date().toISOString()
      }));
      setOrders(mapped);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return orders.filter((order) => {
      const passStatus = statusFilter === 'all' || order.status === statusFilter;
      const passSearch = !query || order.customer.toLowerCase().includes(query) || order._id.toLowerCase().includes(query);
      return passStatus && passSearch;
    });
  }, [orders, search, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter]);

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      await adminOrdersApi.updateStatus(id, { status: newStatus });
      setOrders((prev) => prev.map((order) => (order._id === id ? { ...order, status: newStatus } : order)));
    } catch (error) {
      console.error('Failed to update order status:', error);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle2 className="mr-1.5 h-4 w-4" />;
      case 'shipped':
        return <Truck className="mr-1.5 h-4 w-4" />;
      default:
        return <Clock className="mr-1.5 h-4 w-4" />;
    }
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'success';
      case 'shipped':
      case 'processing':
        return 'warning';
      default:
        return 'muted';
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Order Operations"
        subtitle="Control order statuses, monitor processing queues, and open printable invoice pages."
        actions={[
          {
            key: 'refresh',
            node: (
              <Button variant="outline" onClick={fetchOrders} disabled={loading} className="rounded-full">
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
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="min-w-[160px]">
            <option value="all">All statuses</option>
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status.replace('_', ' ')}
              </option>
            ))}
          </Select>
        }
      />

      <AdminMotionCard className="overflow-hidden p-0">
        <div className="overflow-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead className="border-b border-border bg-muted/35 text-foreground/65">
              <tr>
                <th className="px-5 py-4 font-medium">Order ID</th>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Date</th>
                <th className="px-5 py-4 font-medium">Payment</th>
                <th className="px-5 py-4 text-right font-medium">Amount</th>
                <th className="px-5 py-4 text-center font-medium">Status</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-foreground/45">Loading orders...</td>
                </tr>
              ) : pageRows.length ? (
                pageRows.map((order) => (
                  <tr key={order._id} className="border-t border-border/60 hover:bg-muted/20">
                    <td className="px-5 py-4 font-mono text-xs text-foreground/60">{order._id}</td>
                    <td className="px-5 py-4 font-medium text-foreground">{order.customer}</td>
                    <td className="px-5 py-4 text-foreground/60">{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4 text-foreground/60 capitalize">{order.paymentStatus ?? 'pending'}</td>
                    <td className="px-5 py-4 text-right font-semibold text-foreground">{formatPrice(order.total)}</td>
                    <td className="px-5 py-4 text-center">
                      <Badge tone={getStatusTone(order.status)} className="inline-flex items-center capitalize">
                        {getStatusIcon(order.status)}
                        {order.status.replace('_', ' ')}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Select
                          value={order.status}
                          onChange={(event) => handleUpdateStatus(order._id, event.target.value)}
                          disabled={updatingId === order._id}
                          className="w-[150px]"
                        >
                          {statusOptions.map((status) => (
                            <option key={status} value={status}>
                              {status.replace('_', ' ')}
                            </option>
                          ))}
                        </Select>
                        <Link href={`/admin/orders/${order._id}`}>
                          <Button variant="outline" size="sm">Invoice</Button>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-foreground/45">No orders match this filter.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-border/60 px-5 py-4 text-sm">
          <p className="text-foreground/60">
            Showing {Math.min(filtered.length, (page - 1) * PAGE_SIZE + 1)} to {Math.min(filtered.length, page * PAGE_SIZE)} of {filtered.length}
          </p>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
              Prev
            </Button>
            <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((value) => value + 1)}>
              Next
            </Button>
          </div>
        </div>
      </AdminMotionCard>
    </div>
  );
}
