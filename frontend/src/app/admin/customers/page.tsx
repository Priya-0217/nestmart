'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SectionHeading } from '@/components/ui/section-heading';
import { customerRows } from '../components/admin-data';
import { AdminModal } from '../components/admin-modal';
import { formatPrice } from '@/lib/utils';

export default function CustomersPage() {
  const [selectedCustomer, setSelectedCustomer] = useState<(typeof customerRows)[number] | null>(null);

  return (
    <div className="space-y-6">
      <section className="surface p-6 sm:p-7">
        <SectionHeading title="Customers" subtitle="A static customer directory with profile preview UI." />
      </section>

      <Card className="overflow-hidden p-0">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-muted/35 text-foreground/55">
            <tr>
              <th className="px-5 py-4 font-medium sm:px-6">Name</th>
              <th className="px-5 py-4 font-medium sm:px-6">Email</th>
              <th className="px-5 py-4 font-medium sm:px-6">Orders</th>
              <th className="px-5 py-4 font-medium sm:px-6">Status</th>
              <th className="px-5 py-4 font-medium sm:px-6">Lifetime Spend</th>
              <th className="px-5 py-4 font-medium sm:px-6">Actions</th>
            </tr>
          </thead>
          <tbody>
            {customerRows.map((customer) => (
              <tr key={customer.id} className="border-t border-border/60">
                <td className="px-5 py-4 font-medium text-foreground sm:px-6">{customer.name}</td>
                <td className="px-5 py-4 text-foreground/70 sm:px-6">{customer.email}</td>
                <td className="px-5 py-4 text-foreground/70 sm:px-6">{customer.orders}</td>
                <td className="px-5 py-4 sm:px-6"><Badge tone={customer.status === 'VIP' ? 'success' : customer.status === 'Active' ? 'default' : 'muted'}>{customer.status}</Badge></td>
                <td className="px-5 py-4 text-foreground/70 sm:px-6">{formatPrice(customer.spend)}</td>
                <td className="px-5 py-4 sm:px-6">
                  <Button variant="outline" size="sm" onClick={() => setSelectedCustomer(customer)}>Profile</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <AdminModal
        open={Boolean(selectedCustomer)}
        title={selectedCustomer ? selectedCustomer.name : 'Customer profile'}
        description="Profile view UI with order summary and customer health metrics."
        onClose={() => setSelectedCustomer(null)}
        footer={<Button onClick={() => setSelectedCustomer(null)}>Close profile</Button>}
      >
        {selectedCustomer ? (
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-4 md:col-span-1">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/45">Status</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{selectedCustomer.status}</p>
              <p className="mt-1 text-sm text-foreground/60">{selectedCustomer.email}</p>
            </Card>
            <Card className="p-4 md:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-foreground/45">Summary</p>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                <Stat label="Orders" value={String(selectedCustomer.orders)} />
                <Stat label="Spend" value={formatPrice(selectedCustomer.spend)} />
                <Stat label="Tier" value={selectedCustomer.status} />
              </div>
            </Card>
          </div>
        ) : null}
      </AdminModal>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted/30 p-3">
      <p className="text-xs uppercase tracking-[0.18em] text-foreground/45">{label}</p>
      <p className="mt-1 text-base font-semibold text-foreground">{value}</p>
    </div>
  );
}