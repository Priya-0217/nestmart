'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SectionHeading } from '@/components/ui/section-heading';
import { AdminModal } from '../components/admin-modal';
import { couponRows } from '../components/admin-data';

export default function CouponsPage() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <section className="surface p-6 sm:p-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading title="Coupons" subtitle="Promo code management with a simple add/edit modal." />
          <Button className="rounded-full" onClick={() => setOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Add Coupon
          </Button>
        </div>
      </section>

      <Card className="overflow-hidden p-0">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead className="bg-muted/35 text-foreground/55">
            <tr>
              <th className="px-5 py-4 font-medium sm:px-6">Code</th>
              <th className="px-5 py-4 font-medium sm:px-6">Type</th>
              <th className="px-5 py-4 font-medium sm:px-6">Discount</th>
              <th className="px-5 py-4 font-medium sm:px-6">Expiry</th>
              <th className="px-5 py-4 font-medium sm:px-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {couponRows.map((coupon) => (
              <tr key={coupon.code} className="border-t border-border/60">
                <td className="px-5 py-4 font-semibold text-foreground sm:px-6">{coupon.code}</td>
                <td className="px-5 py-4 text-foreground/70 sm:px-6">{coupon.type}</td>
                <td className="px-5 py-4 text-foreground/70 sm:px-6">{coupon.discount}</td>
                <td className="px-5 py-4 text-foreground/70 sm:px-6">{coupon.expiry}</td>
                <td className="px-5 py-4 sm:px-6"><Badge tone={coupon.status === 'Active' ? 'success' : 'warning'}>{coupon.status}</Badge></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>

      <AdminModal
        open={open}
        title="Add / Edit Coupon"
        description="Coupon editor UI for promo code metadata and restrictions."
        onClose={() => setOpen(false)}
        footer={(
          <>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button>Save coupon</Button>
          </>
        )}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Input placeholder="Coupon code" />
          <Select defaultValue="percentage">
            <option value="percentage">Percentage</option>
            <option value="flat">Flat discount</option>
            <option value="shipping">Shipping</option>
          </Select>
          <Input placeholder="Discount value" />
          <Input placeholder="Expiry date" />
        </div>
      </AdminModal>
    </div>
  );
}