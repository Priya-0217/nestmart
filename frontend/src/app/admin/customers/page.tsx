'use client';

import { useEffect, useMemo, useState } from 'react';
import { Flag, RefreshCw, ShieldBan, UserRound } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';
import { adminApi, type AdminUser } from '@/lib/api';
import { AdminModal } from '../components/admin-modal';
import { AdminMotionCard, AdminPageHeader, AdminToolbar } from '../components/admin-ui';

type CustomerItem = {
  id: string;
  name: string;
  email: string;
  orders: number;
  spend: number;
  status: 'Active' | 'VIP' | 'New' | 'Banned';
  flagged: boolean;
  role?: string;
  createdAt?: string;
};

const sampleHistory: Array<{ id: string; date: string; amount: number; status: string }> = [];

function mapAdminUser(user: AdminUser): CustomerItem {
  return {
    id: user.id,
    name: user.name ?? 'Guest User',
    email: user.email,
    orders: 0,
    spend: 0,
    status: user.isActive ? 'Active' : 'Banned',
    flagged: false,
    role: user.role,
    createdAt: user.createdAt
  };
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<CustomerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerItem | null>(null);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await adminApi.users(1, 100);
      const apiRows = data.items.map(mapAdminUser);
      setCustomers(apiRows);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return customers.filter((customer) => {
      if (!query) return true;
      return customer.name.toLowerCase().includes(query) || customer.email.toLowerCase().includes(query);
    });
  }, [customers, search]);

  const updateCustomer = (id: string, updater: (item: CustomerItem) => CustomerItem) => {
    setCustomers((prev) => prev.map((item) => (item.id === id ? updater(item) : item)));
    setSelectedCustomer((prev) => (prev && prev.id === id ? updater(prev) : prev));
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Customer Management"
        subtitle="Inspect customer profiles, check order history, and take moderation actions like ban and flag."
        actions={[
          {
            key: 'refresh',
            node: (
              <Button variant="outline" className="rounded-full" onClick={fetchCustomers} disabled={loading}>
                <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            )
          }
        ]}
      />

      <AdminToolbar search={search} onSearch={setSearch} />

      <AdminMotionCard className="overflow-hidden p-0">
        <div className="overflow-auto">
          <table className="w-full min-w-[920px] text-left text-sm">
            <thead className="border-b border-border bg-muted/35 text-foreground/65">
              <tr>
                <th className="px-5 py-4 font-medium">Customer</th>
                <th className="px-5 py-4 font-medium">Orders</th>
                <th className="px-5 py-4 font-medium">Lifetime Spend</th>
                <th className="px-5 py-4 font-medium">Status</th>
                <th className="px-5 py-4 font-medium">Risk</th>
                <th className="px-5 py-4 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-foreground/45">Loading customers...</td>
                </tr>
              ) : filtered.length ? (
                filtered.map((customer) => (
                  <tr key={customer.id} className="border-t border-border/60 hover:bg-muted/20">
                    <td className="px-5 py-4">
                      <p className="font-semibold text-foreground">{customer.name}</p>
                      <p className="text-xs text-foreground/55">{customer.email}</p>
                    </td>
                    <td className="px-5 py-4 text-foreground/70">{customer.orders}</td>
                    <td className="px-5 py-4 text-foreground/70">{formatPrice(customer.spend)}</td>
                    <td className="px-5 py-4">
                      <Badge tone={customer.status === 'VIP' ? 'success' : customer.status === 'Banned' ? 'warning' : 'default'}>
                        {customer.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <Badge tone={customer.flagged ? 'warning' : 'muted'}>{customer.flagged ? 'Flagged' : 'Healthy'}</Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>Profile</Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-amber-600"
                          onClick={() => updateCustomer(customer.id, (item) => ({ ...item, flagged: !item.flagged }))}
                        >
                          <Flag className="mr-2 h-4 w-4" />
                          {customer.flagged ? 'Unflag' : 'Flag'}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-red-500"
                          onClick={() =>
                            updateCustomer(customer.id, (item) => ({ ...item, status: item.status === 'Banned' ? 'Active' : 'Banned' }))
                          }
                        >
                          <ShieldBan className="mr-2 h-4 w-4" />
                          {customer.status === 'Banned' ? 'Unban' : 'Ban'}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-foreground/45">No customers match this search.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminMotionCard>

      <AdminModal
        open={Boolean(selectedCustomer)}
        title={selectedCustomer ? selectedCustomer.name : 'Customer Profile'}
        description="Profile details, lifecycle status, and recent order history."
        onClose={() => setSelectedCustomer(null)}
        footer={<Button onClick={() => setSelectedCustomer(null)}>Close</Button>}
      >
        {selectedCustomer ? (
          <div className="space-y-4">
            <div className="grid gap-3 md:grid-cols-4">
              <div className="rounded-2xl border border-border bg-muted/25 p-4 md:col-span-1">
                <span className="mb-2 inline-flex rounded-full bg-primary/10 p-2 text-primary">
                  <UserRound className="h-5 w-5" />
                </span>
                <p className="text-sm font-semibold text-foreground">{selectedCustomer.status}</p>
                <p className="text-xs text-foreground/55">{selectedCustomer.email}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/25 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-foreground/45">Orders</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{selectedCustomer.orders}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/25 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-foreground/45">Spend</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{formatPrice(selectedCustomer.spend)}</p>
              </div>
              <div className="rounded-2xl border border-border bg-muted/25 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-foreground/45">Risk</p>
                <p className="mt-1 text-xl font-semibold text-foreground">{selectedCustomer.flagged ? 'Flagged' : 'Normal'}</p>
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <h4 className="text-sm font-semibold text-foreground">Recent Order History</h4>
              <div className="mt-3 space-y-2">
                {sampleHistory.map((order) => (
                  <div key={order.id} className="flex items-center justify-between rounded-xl bg-muted/25 px-3 py-2 text-sm">
                    <div>
                      <p className="font-medium text-foreground">{order.id}</p>
                      <p className="text-xs text-foreground/55">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-foreground">{formatPrice(order.amount)}</p>
                      <p className="text-xs text-foreground/55">{order.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}
