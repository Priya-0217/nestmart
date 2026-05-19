'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Printer, Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { formatPrice } from '@/lib/utils';
import { adminOrdersApi, ordersApi, type Order } from '@/lib/api';
import { invoiceSeed } from '../../components/admin-data';
import { AdminMotionCard, AdminPageHeader } from '../../components/admin-ui';

const statusOptions = ['pending', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded', 'failed', 'return_requested', 'returned'];

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState('pending');
  const [trackingNumber, setTrackingNumber] = useState('');

  useEffect(() => {
    if (!orderId) return;
    const load = async () => {
      setLoading(true);
      try {
        const data = await ordersApi.get(orderId);
        setOrder(data);
        setStatus(data.status);
        setTrackingNumber(data.trackingNumber ?? '');
      } catch (error) {
        console.error('Failed to load order:', error);
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [orderId]);

  const saveStatus = async () => {
    if (!orderId) return;
    setSaving(true);
    try {
      const updated = await adminOrdersApi.updateStatus(orderId, { status, trackingNumber });
      setOrder(updated);
    } catch (error) {
      console.error('Failed to update status:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title={`Order ${orderId}`}
        subtitle="Update fulfillment state and print a customer-ready invoice document."
        actions={[
          {
            key: 'print',
            node: (
              <Button variant="outline" onClick={() => window.print()} className="rounded-full">
                <Printer className="mr-2 h-4 w-4" />
                Print Invoice
              </Button>
            )
          },
          {
            key: 'save',
            node: (
              <Button onClick={saveStatus} disabled={saving || loading} className="rounded-full">
                <Save className="mr-2 h-4 w-4" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            )
          }
        ]}
      />

      {loading ? (
        <AdminMotionCard className="p-6 text-sm text-foreground/60">Loading order details...</AdminMotionCard>
      ) : !order ? (
        <AdminMotionCard className="p-6 text-sm text-foreground/60">Order not found.</AdminMotionCard>
      ) : (
        <>
          <AdminMotionCard className="p-5 sm:p-6">
            <div className="grid gap-4 lg:grid-cols-3">
              <label className="text-sm font-medium">
                Fulfillment status
                <Select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-1">
                  {statusOptions.map((item) => (
                    <option key={item} value={item}>{item.replace('_', ' ')}</option>
                  ))}
                </Select>
              </label>
              <label className="text-sm font-medium">
                Tracking number
                <input
                  className="mt-1 h-11 w-full rounded-xl border border-border bg-card px-3"
                  value={trackingNumber}
                  onChange={(event) => setTrackingNumber(event.target.value)}
                  placeholder="AWB123456789"
                />
              </label>
              <div className="rounded-2xl border border-border bg-muted/25 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-foreground/45">Payment</p>
                <p className="mt-1 text-sm font-semibold capitalize text-foreground">{order.paymentMethod} / {order.paymentStatus}</p>
                <Badge tone={order.status === 'delivered' ? 'success' : 'warning'} className="mt-2 capitalize">{order.status.replace('_', ' ')}</Badge>
              </div>
            </div>
          </AdminMotionCard>

          <AdminMotionCard className="p-5 sm:p-6 print:shadow-none print:border-0">
            <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">Invoice</p>
                <h3 className="mt-1 text-xl font-semibold text-foreground">{order.orderNumber}</h3>
                <p className="text-sm text-foreground/60">Issued {new Date(order.placedAt).toLocaleDateString()}</p>
              </div>
              <div className="text-sm text-foreground/70 sm:text-right">
                <p className="font-semibold text-foreground">{invoiceSeed.company.name}</p>
                <p>{invoiceSeed.company.address}</p>
                <p>{invoiceSeed.company.taxId}</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm">
                <p className="font-semibold text-foreground">Bill to</p>
                <p className="mt-2 text-foreground/70">{order.shippingAddress.fullName}</p>
                <p className="text-foreground/70">{order.shippingAddress.line1}</p>
                <p className="text-foreground/70">{order.shippingAddress.city}, {order.shippingAddress.state}</p>
                <p className="text-foreground/70">{order.shippingAddress.country} {order.shippingAddress.postalCode}</p>
                <p className="text-foreground/70">{order.shippingAddress.phone}</p>
              </div>

              <div className="rounded-2xl border border-border bg-muted/20 p-4 text-sm">
                <p className="font-semibold text-foreground">Shipment</p>
                <p className="mt-2 text-foreground/70">Tracking: {trackingNumber || 'Pending assignment'}</p>
                <p className="text-foreground/70">Support: {invoiceSeed.supportEmail}</p>
              </div>
            </div>

            <div className="mt-5 overflow-auto">
              <table className="w-full min-w-[720px] text-sm">
                <thead className="border-b border-border text-left text-foreground/60">
                  <tr>
                    <th className="py-3">Item</th>
                    <th className="py-3">Qty</th>
                    <th className="py-3 text-right">Unit Price</th>
                    <th className="py-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={`${item.productId}-${item.title}`} className="border-b border-border/50">
                      <td className="py-3 text-foreground">{item.title}</td>
                      <td className="py-3 text-foreground/70">{item.quantity}</td>
                      <td className="py-3 text-right text-foreground/70">{formatPrice(item.unitPrice)}</td>
                      <td className="py-3 text-right font-semibold text-foreground">{formatPrice(item.subtotal)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 ml-auto w-full max-w-sm space-y-2 text-sm">
              <div className="flex items-center justify-between text-foreground/70"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex items-center justify-between text-foreground/70"><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>
              <div className="flex items-center justify-between text-foreground/70"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
              <div className="flex items-center justify-between text-foreground/70"><span>Discount</span><span>-{formatPrice(order.discount)}</span></div>
              <div className="flex items-center justify-between border-t border-border pt-2 text-base font-semibold text-foreground"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </AdminMotionCard>
        </>
      )}
    </div>
  );
}
