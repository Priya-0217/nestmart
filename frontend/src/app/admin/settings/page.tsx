'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { SectionHeading } from '@/components/ui/section-heading';
import { paymentOptions, shippingOptions } from '../components/admin-data';

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <section className="surface p-6 sm:p-7">
        <SectionHeading title="Settings" subtitle="General storefront settings and feature toggles for operations teams." />
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">General settings</h3>
          <div className="mt-4 grid gap-4">
            <Input placeholder="Store name" defaultValue="NestMart" />
            <Input placeholder="Support email" defaultValue="support@nestmart.example.com" />
            <Select defaultValue="inr">
              <option value="inr">Indian Rupee (INR)</option>
              <option value="usd">US Dollar (USD)</option>
            </Select>
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Payment methods</h3>
          <div className="mt-4 space-y-4">
            {paymentOptions.map((option) => <Checkbox key={option.label} label={option.label} description={option.description} defaultChecked />)}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Shipping options</h3>
          <div className="mt-4 space-y-4">
            {shippingOptions.map((option) => <Checkbox key={option.label} label={option.label} description={option.description} defaultChecked />)}
          </div>
        </Card>

        <Card className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Save changes</h3>
          <p className="mt-2 text-sm text-foreground/60">All controls are client-side only and ready for backend wiring later.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline">Reset</Button>
            <Button>Save settings</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}