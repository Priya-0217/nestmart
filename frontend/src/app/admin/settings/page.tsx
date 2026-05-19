'use client';

import { useEffect, useState } from 'react';
import { Save } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { settingsApi } from '@/lib/api';
import { useToastStore } from '@/store/toast-store';
import { AdminMotionCard, AdminPageHeader } from '../components/admin-ui';

export default function SettingsPage() {
  const pushToast = useToastStore((state) => state.push);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [settings, setSettings] = useState({
    storeName: 'NestMart',
    supportEmail: 'support@nestmart.example.com',
    currency: 'inr',
    timezone: 'UTC+5:30',
    maintenanceMode: false,
    lowStockThreshold: 10,
    refundWindow: 30,
    description: 'Your trusted online marketplace for quality products and exceptional service.'
  });

  const [payments, setPayments] = useState({
    stripe: true,
    razorpay: true,
    paypal: false,
    cod: true
  });

  const [shipping, setShipping] = useState({
    standard: true,
    express: true,
    overnight: false,
    pickup: true
  });

  useEffect(() => {
    settingsApi.get()
      .then((data) => {
        if (Object.keys(data).length > 0) {
          // Map backend flat strings back to state objects
          setSettings(prev => ({
            ...prev,
            storeName: data.storeName ?? prev.storeName,
            supportEmail: data.supportEmail ?? prev.supportEmail,
            currency: data.currency ?? prev.currency,
            timezone: data.timezone ?? prev.timezone,
            maintenanceMode: data.maintenanceMode === 'true',
            lowStockThreshold: Number(data.lowStockThreshold ?? prev.lowStockThreshold),
            refundWindow: Number(data.refundWindow ?? prev.refundWindow),
            description: data.description ?? prev.description,
          }));
          setPayments({
            stripe: data.payment_stripe === 'true',
            razorpay: data.payment_razorpay === 'true',
            paypal: data.payment_paypal === 'true',
            cod: data.payment_cod === 'true',
          });
          setShipping({
            standard: data.shipping_standard === 'true',
            express: data.shipping_express === 'true',
            overnight: data.shipping_overnight === 'true',
            pickup: data.shipping_pickup === 'true',
          });
        }
      })
      .catch(err => console.error('Failed to fetch settings', err))
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload: Record<string, string> = {
        storeName: settings.storeName,
        supportEmail: settings.supportEmail,
        currency: settings.currency,
        timezone: settings.timezone,
        maintenanceMode: String(settings.maintenanceMode),
        lowStockThreshold: String(settings.lowStockThreshold),
        refundWindow: String(settings.refundWindow),
        description: settings.description,
        payment_stripe: String(payments.stripe),
        payment_razorpay: String(payments.razorpay),
        payment_paypal: String(payments.paypal),
        payment_cod: String(payments.cod),
        shipping_standard: String(shipping.standard),
        shipping_express: String(shipping.express),
        shipping_overnight: String(shipping.overnight),
        shipping_pickup: String(shipping.pickup),
      };

      await settingsApi.update(payload);
      pushToast('Settings saved successfully!', 'success');
    } catch (error) {
      console.error('Failed to save settings:', error);
      pushToast('Failed to save settings.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setLoading(true);
    settingsApi.get()
      .then((data) => {
        if (Object.keys(data).length > 0) {
          setSettings({
            storeName: data.storeName ?? 'NestMart',
            supportEmail: data.supportEmail ?? 'support@nestmart.example.com',
            currency: data.currency ?? 'inr',
            timezone: data.timezone ?? 'UTC+5:30',
            maintenanceMode: data.maintenanceMode === 'true',
            lowStockThreshold: Number(data.lowStockThreshold ?? 10),
            refundWindow: Number(data.refundWindow ?? 30),
            description: data.description ?? 'Your trusted online marketplace for quality products and exceptional service.',
          });
          setPayments({
            stripe: data.payment_stripe === 'true',
            razorpay: data.payment_razorpay === 'true',
            paypal: data.payment_paypal === 'true',
            cod: data.payment_cod === 'true',
          });
          setShipping({
            standard: data.shipping_standard === 'true',
            express: data.shipping_express === 'true',
            overnight: data.shipping_overnight === 'true',
            pickup: data.shipping_pickup === 'true',
          });
        }
      })
      .finally(() => setLoading(false));
  };

  if (loading) return <div className="p-10 text-center">Loading settings...</div>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Admin Settings" subtitle="Configure store-wide settings, payment methods, and operational preferences." />

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminMotionCard className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">General Settings</h3>

          <div className="mt-4 space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Store Name</p>
              <Input
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Support Email</p>
              <Input
                type="email"
                value={settings.supportEmail}
                onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
              />
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Currency</p>
              <Select value={settings.currency} onChange={(e) => setSettings({ ...settings, currency: e.target.value })}>
                <option value="inr">Indian Rupee (INR)</option>
                <option value="usd">US Dollar (USD)</option>
                <option value="eur">Euro (EUR)</option>
                <option value="gbp">British Pound (GBP)</option>
              </Select>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Timezone</p>
              <Select value={settings.timezone} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}>
                <option value="UTC+5:30">UTC+5:30 (India)</option>
                <option value="UTC+0">UTC (GMT)</option>
                <option value="UTC-5">UTC-5 (Eastern)</option>
                <option value="UTC+8">UTC+8 (Singapore)</option>
              </Select>
            </div>
          </div>
        </AdminMotionCard>

        <AdminMotionCard className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Operational Settings</h3>

          <div className="mt-4 space-y-4">
            <Checkbox
              checked={settings.maintenanceMode}
              onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })}
              label="Enable Maintenance Mode"
              description="Disable all customer access to the storefront temporarily."
            />

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Low Stock Alert Threshold</p>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={settings.lowStockThreshold}
                  onChange={(e) => setSettings({ ...settings, lowStockThreshold: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-foreground/60">units</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Refund Window</p>
              <div className="mt-2 flex items-center gap-2">
                <Input
                  type="number"
                  min="1"
                  value={settings.refundWindow}
                  onChange={(e) => setSettings({ ...settings, refundWindow: Number(e.target.value) })}
                  className="flex-1"
                />
                <span className="text-sm text-foreground/60">days</span>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-foreground">Store Description</p>
              <Textarea
                value={settings.description}
                onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                rows={3}
              />
            </div>
          </div>
        </AdminMotionCard>

        <AdminMotionCard className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Payment Methods</h3>

          <div className="mt-4 space-y-3">
            <Checkbox
              checked={payments.stripe}
              onChange={(e) => setPayments({ ...payments, stripe: e.target.checked })}
              label="Stripe"
              description="Accept credit/debit cards and Apple/Google Pay."
            />
            <Checkbox
              checked={payments.razorpay}
              onChange={(e) => setPayments({ ...payments, razorpay: e.target.checked })}
              label="Razorpay"
              description="Accept payments via UPI, NetBanking, and Cards in India."
            />
            <Checkbox
              checked={payments.paypal}
              onChange={(e) => setPayments({ ...payments, paypal: e.target.checked })}
              label="PayPal"
              description="Accept international payments via PayPal."
            />
            <Checkbox
              checked={payments.cod}
              onChange={(e) => setPayments({ ...payments, cod: e.target.checked })}
              label="Cash on Delivery"
              description="Allow customers to pay when they receive the order."
            />
          </div>
        </AdminMotionCard>

        <AdminMotionCard className="p-5 sm:p-6">
          <h3 className="text-lg font-semibold text-foreground">Shipping Options</h3>

          <div className="mt-4 space-y-3">
            <Checkbox
              checked={shipping.standard}
              onChange={(e) => setShipping({ ...shipping, standard: e.target.checked })}
              label="Standard Shipping"
              description="Delivery in 3-5 business days."
            />
            <Checkbox
              checked={shipping.express}
              onChange={(e) => setShipping({ ...shipping, express: e.target.checked })}
              label="Express Shipping"
              description="Delivery in 1-2 business days."
            />
            <Checkbox
              checked={shipping.overnight}
              onChange={(e) => setShipping({ ...shipping, overnight: e.target.checked })}
              label="Overnight Delivery"
              description="Guaranteed delivery by the next morning."
            />
            <Checkbox
              checked={shipping.pickup}
              onChange={(e) => setShipping({ ...shipping, pickup: e.target.checked })}
              label="In-store Pickup"
              description="Customers can collect orders from your physical store."
            />
          </div>
        </AdminMotionCard>
      </div>

      <AdminMotionCard className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Save Changes</h3>
            <p className="text-sm text-foreground/60">All changes are saved to the backend when you click Save Settings.</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <Button variant="outline" onClick={handleReset} disabled={saving}>
              Reset
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className={`mr-2 h-4 w-4 ${saving ? 'animate-spin' : ''}`} />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        </div>
      </AdminMotionCard>
    </div>
  );
}