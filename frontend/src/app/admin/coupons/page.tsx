'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { couponsApi, type CouponType } from '@/lib/api';
import { formatPrice } from '@/lib/utils';
import { AdminModal } from '../components/admin-modal';
import { AdminMotionCard, AdminPageHeader, AdminToolbar } from '../components/admin-ui';

type CouponKind = 'percent' | 'fixed' | 'bogo';

export default function CouponsPage() {
  const [open, setOpen] = useState(false);
  const [coupons, setCoupons] = useState<(CouponType & { uiType?: CouponKind })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    type: 'percent' as CouponKind,
    value: 10,
    minOrderAmount: 0,
    maxDiscount: 0,
    expiresAt: ''
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    try {
      const data = await couponsApi.list();
      setCoupons(data.items.map((coupon) => ({ ...coupon, uiType: coupon.type === 'shipping' ? 'bogo' : coupon.type })));
    } catch (error) {
      console.error('Failed to load coupons:', error);
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return coupons.filter((coupon) => {
      if (!query) return true;
      return coupon.code.toLowerCase().includes(query) || coupon.type.toLowerCase().includes(query);
    });
  }, [coupons, search]);

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const apiType = formData.type === 'bogo' ? 'shipping' : formData.type;
      const payload = {
        code: formData.code,
        type: apiType,
        value: formData.value,
        minOrderAmount: formData.minOrderAmount,
        maxDiscount: formData.maxDiscount,
        expiresAt: formData.expiresAt
      };

      if (editingId) {
        const updated = await couponsApi.update(editingId, payload);
        setCoupons((prev) => prev.map((item) => (item._id === editingId ? { ...updated, uiType: formData.type } : item)));
      } else {
        const created = await couponsApi.create(payload);
        setCoupons((prev) => [{ ...created, uiType: formData.type }, ...prev]);
      }
      setOpen(false);
      setFormData({ code: '', type: 'percent', value: 10, minOrderAmount: 0, maxDiscount: 0, expiresAt: '' });
      setEditingId(null);
    } catch (error) {
      console.error('Failed to save coupon:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (coupon: CouponType & { uiType?: CouponKind }) => {
    setFormData({
      code: coupon.code,
      type: coupon.uiType ?? (coupon.type === 'shipping' ? 'bogo' : coupon.type),
      value: coupon.value,
      minOrderAmount: coupon.minOrderAmount,
      maxDiscount: coupon.maxDiscount || 0,
      expiresAt: coupon.expiresAt.split('T')[0]
    });
    setEditingId(coupon._id);
    setOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    try {
      await couponsApi.remove(id);
      setCoupons((prev) => prev.filter((item) => item._id !== id));
    } catch (error) {
      console.error('Failed to delete coupon:', error);
    }
  };

  const discountLabel = (coupon: CouponType & { uiType?: CouponKind }) => {
    const type = coupon.uiType ?? (coupon.type === 'shipping' ? 'bogo' : coupon.type);
    if (type === 'percent') return `${coupon.value}%`;
    if (type === 'fixed') return formatPrice(coupon.value);
    return `Buy 1 Get 1 (${coupon.code})`;
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Coupon & Discount Engine"
        subtitle="Manage fixed, percentage, and BOGO discount campaigns with expiry and order threshold controls."
        actions={[
          {
            key: 'add',
            node: (
              <Button className="rounded-full" onClick={() => setOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Coupon
              </Button>
            )
          }
        ]}
      />

      <AdminToolbar search={search} onSearch={setSearch} />

      {loading ? (
        <AdminMotionCard className="p-6 text-sm text-foreground/60">Loading coupons...</AdminMotionCard>
      ) : (
        <AdminMotionCard className="overflow-hidden p-0">
          <div className="overflow-auto">
            <table className="w-full min-w-[860px] text-left text-sm">
              <thead className="border-b border-border bg-muted/35 text-foreground/65">
                <tr>
                  <th className="px-5 py-4 font-medium">Code</th>
                  <th className="px-5 py-4 font-medium">Type</th>
                  <th className="px-5 py-4 font-medium">Discount</th>
                  <th className="px-5 py-4 font-medium">Min Order</th>
                  <th className="px-5 py-4 font-medium">Expiry</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((coupon) => {
                  const type = coupon.uiType ?? (coupon.type === 'shipping' ? 'bogo' : coupon.type);
                  return (
                    <tr key={coupon._id} className="border-t border-border/60 hover:bg-muted/20">
                      <td className="px-5 py-4 font-semibold text-foreground">{coupon.code}</td>
                      <td className="px-5 py-4 capitalize text-foreground/70">{type}</td>
                      <td className="px-5 py-4 text-foreground/70">{discountLabel(coupon)}</td>
                      <td className="px-5 py-4 text-foreground/70">{formatPrice(coupon.minOrderAmount)}</td>
                      <td className="px-5 py-4 text-foreground/70">{new Date(coupon.expiresAt).toLocaleDateString()}</td>
                      <td className="px-5 py-4">
                        <Badge tone={coupon.isActive ? 'success' : 'warning'}>{coupon.isActive ? 'Active' : 'Inactive'}</Badge>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(coupon)}>Edit</Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(coupon._id)} className="text-red-500">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {!filtered.length ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-10 text-center text-foreground/45">No coupons match the current search.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </AdminMotionCard>
      )}

      <AdminModal
        open={open}
        title={editingId ? 'Edit Coupon' : 'Create Coupon'}
        description="Define campaign behavior, guardrails, and validity period."
        onClose={() => {
          setOpen(false);
          setEditingId(null);
        }}
        footer={
          <div className="flex w-full justify-end gap-2">
            <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>Cancel</Button>
            <Button onClick={handleSave} disabled={submitting}>{submitting ? 'Saving...' : 'Save coupon'}</Button>
          </div>
        }
      >
        <div className="grid gap-4 py-2 md:grid-cols-2">
          <label className="text-sm font-medium">
            Coupon code
            <Input value={formData.code} onChange={(event) => setFormData({ ...formData, code: event.target.value.toUpperCase() })} className="mt-1" />
          </label>

          <label className="text-sm font-medium">
            Discount type
            <Select value={formData.type} onChange={(event) => setFormData({ ...formData, type: event.target.value as CouponKind })} className="mt-1">
              <option value="percent">Percentage</option>
              <option value="fixed">Fixed</option>
              <option value="bogo">BOGO</option>
            </Select>
          </label>

          <label className="text-sm font-medium">
            Discount value
            <Input type="number" value={formData.value} onChange={(event) => setFormData({ ...formData, value: Number(event.target.value) })} className="mt-1" />
          </label>

          <label className="text-sm font-medium">
            Minimum order amount
            <Input type="number" value={formData.minOrderAmount} onChange={(event) => setFormData({ ...formData, minOrderAmount: Number(event.target.value) })} className="mt-1" />
          </label>

          <label className="text-sm font-medium">
            Max discount cap
            <Input type="number" value={formData.maxDiscount} onChange={(event) => setFormData({ ...formData, maxDiscount: Number(event.target.value) })} className="mt-1" />
          </label>

          <label className="text-sm font-medium">
            Expiry date
            <Input type="date" value={formData.expiresAt} onChange={(event) => setFormData({ ...formData, expiresAt: event.target.value })} className="mt-1" />
          </label>
        </div>
      </AdminModal>
    </div>
  );
}
