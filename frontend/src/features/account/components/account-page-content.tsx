'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { PackageCheck, ReceiptText, Star } from 'lucide-react';
import { AccountSidebar } from '@/features/account/components/account-sidebar';
import { OrdersTable } from '@/features/account/components/orders-table';
import { ProfileCard } from '@/features/account/components/profile-card';
import { StatCard } from '@/features/account/components/stat-card';
import { WishlistPanel, type WishlistProduct } from '@/features/account/components/wishlist-panel';
import { WishlistStatCard } from '@/features/account/components/wishlist-stat-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { EmptyState } from '@/components/ui/empty-state';
import { Button } from '@/components/ui/button';
import { FormField } from '@/components/ui/form-field';
import { Input } from '@/components/ui/input';
import { ordersApi, usersApi, type Address, type Order as ApiOrder } from '@/lib/api';
import type { Order, OrderStatus, Profile } from '@/lib/types';
import { useSession } from 'next-auth/react';
import { useWishlistStore } from '@/store/wishlist-store';

type LoadState = {
  profile: Profile | null;
  orders: Order[];
  wishlist: WishlistProduct[];
  addresses: Address[];
  primaryAddress1Id: string | null;
  primaryAddress2Id: string | null;
  loading: boolean;
  error: string | null;
};

type AddressFormState = {
  label: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

const initialAddressForm: AddressFormState = {
  label: '',
  fullName: '',
  phone: '',
  line1: '',
  line2: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'IN'
};

function mapOrderStatus(status: string): OrderStatus {
  switch (status) {
    case 'delivered':
      return 'Delivered';
    case 'shipped':
      return 'Shipped';
    case 'cancelled':
      return 'Cancelled';
    case 'paid':
    case 'pending':
    case 'return_requested':
    case 'refunded':
    case 'failed':
    case 'returned':
    default:
      return 'Processing';
  }
}

function formatAddress(address: {
  line1: string;
  line2?: string | null;
  city: string;
  state: string;
  postalCode: string;
  country?: string | null;
}) {
  const parts = [address.line1, address.line2, `${address.city}, ${address.state} ${address.postalCode}`, address.country]
    .filter(Boolean)
    .join(', ');
  return parts || 'No default address';
}

export function AccountPageContent() {
  const { status } = useSession();
  const setWishlistItems = useWishlistStore((state) => state.setItems);
  const [state, setState] = useState<LoadState>({
    profile: null,
    orders: [],
    wishlist: [],
    addresses: [],
    primaryAddress1Id: null,
    primaryAddress2Id: null,
    loading: true,
    error: null
  });
  const [addressForm, setAddressForm] = useState<AddressFormState>(initialAddressForm);
  const [addressBusy, setAddressBusy] = useState(false);
  const [addressMessage, setAddressMessage] = useState<string | null>(null);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  useEffect(() => {
    if (status !== 'authenticated') return;

    const load = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const [profileRaw, addresses, ordersResult, wishlistResult] = await Promise.all([
          usersApi.me(),
          usersApi.addresses(),
          ordersApi.listMine(1, 20),
          usersApi.wishlist()
        ]);

        const defaultAddress = addresses.items.find((item) => item.isDefault) ?? addresses.items[0];
        const profile: Profile = {
          name: profileRaw.name ?? 'Customer',
          email: profileRaw.email,
          phone: profileRaw.phone ?? 'Not provided',
          membership: profileRaw.role === 'admin' ? 'Admin' : profileRaw.role === 'manager' ? 'Manager' : 'Customer',
          defaultAddress: defaultAddress ? formatAddress(defaultAddress) : 'No default address'
        };

        const orders: Order[] = ordersResult.items.map((order: ApiOrder) => ({
          id: order.orderNumber ?? order._id,
          orderId: order._id,
          date: order.placedAt ?? order.createdAt ?? new Date().toISOString(),
          total: order.total,
          status: mapOrderStatus(order.status),
          itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0)
        }));

        const wishlist: WishlistProduct[] = wishlistResult.items.map((product) => ({
          id: product._id,
          slug: product.slug,
          name: product.title,
          price: product.price,
          compareAtPrice: product.compareAtPrice,
          images: product.images?.length ? product.images : ['/product-placeholder.svg'],
          category: product.brand ?? undefined
        }));

        // Sync local store with backend wishlist
        setWishlistItems(wishlist.map((item) => item.id));

        setState({
          profile,
          orders,
          wishlist,
          addresses: addresses.items,
          primaryAddress1Id: addresses.primaryAddress1Id,
          primaryAddress2Id: addresses.primaryAddress2Id,
          loading: false,
          error: null
        });
      } catch (error) {
        setState((prev) => ({
          ...prev,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load account data'
        }));
      }
    };

    void load();
  }, [status]);

  const deliveredCount = useMemo(() => state.orders.filter((order) => order.status === 'Delivered').length, [state.orders]);

  async function refreshAddresses() {
    const addresses = await usersApi.addresses();
    setState((prev) => ({
      ...prev,
      addresses: addresses.items,
      primaryAddress1Id: addresses.primaryAddress1Id,
      primaryAddress2Id: addresses.primaryAddress2Id,
      profile: prev.profile
        ? {
            ...prev.profile,
            defaultAddress: addresses.items[0]
              ? formatAddress(addresses.items.find((item) => item.isDefault) ?? addresses.items[0]!)
              : 'No default address'
          }
        : prev.profile
    }));
  }

  async function handleSetPrimary(slot: 1 | 2, addressId: string) {
    setAddressBusy(true);
    setAddressMessage(null);
    try {
      await usersApi.setPrimaryAddresses(
        slot === 1
          ? { primaryAddress1Id: addressId, primaryAddress2Id: state.primaryAddress2Id }
          : { primaryAddress1Id: state.primaryAddress1Id, primaryAddress2Id: addressId }
      );
      await refreshAddresses();
      setAddressMessage(`Primary ${slot} address updated.`);
    } catch (error) {
      setAddressMessage(error instanceof Error ? error.message : 'Failed to set primary address');
    } finally {
      setAddressBusy(false);
    }
  }

  async function handleDeleteAddress(addressId: string) {
    setAddressBusy(true);
    setAddressMessage(null);
    try {
      await usersApi.deleteAddress(addressId);
      await refreshAddresses();
      setAddressMessage('Address removed.');
    } catch (error) {
      setAddressMessage(error instanceof Error ? error.message : 'Failed to delete address');
    } finally {
      setAddressBusy(false);
    }
  }

  function handleEditAddress(address: Address) {
    setEditingAddressId(address.id);
    setAddressForm({
      label: address.label ?? '',
      fullName: address.fullName,
      phone: address.phone,
      line1: address.line1,
      line2: address.line2 ?? '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      country: address.country
    });
    setAddressMessage(null);
  }

  function handleCancelEdit() {
    setEditingAddressId(null);
    setAddressForm(initialAddressForm);
    setAddressMessage(null);
  }

  async function handleAddAddress(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!addressForm.fullName.trim() || !addressForm.phone.trim() || !addressForm.line1.trim() || !addressForm.city.trim() || !addressForm.state.trim() || !addressForm.postalCode.trim()) {
      setAddressMessage('Please fill all required address fields.');
      return;
    }
    setAddressBusy(true);
    setAddressMessage(null);
    try {
      if (editingAddressId) {
        await usersApi.updateAddress(editingAddressId, {
          label: addressForm.label || undefined,
          fullName: addressForm.fullName,
          phone: addressForm.phone,
          line1: addressForm.line1,
          line2: addressForm.line2 || undefined,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.postalCode,
          country: addressForm.country
        });
        setEditingAddressId(null);
        setAddressMessage('Address updated.');
      } else {
        await usersApi.createAddress({
          label: addressForm.label || undefined,
          fullName: addressForm.fullName,
          phone: addressForm.phone,
          line1: addressForm.line1,
          line2: addressForm.line2 || undefined,
          city: addressForm.city,
          state: addressForm.state,
          postalCode: addressForm.postalCode,
          country: addressForm.country,
          isDefault: state.addresses.length === 0
        });
        setAddressMessage('Address added.');
      }
      setAddressForm(initialAddressForm);
      await refreshAddresses();
    } catch (error) {
      setAddressMessage(error instanceof Error ? error.message : 'Failed to save address');
    } finally {
      setAddressBusy(false);
    }
  }

  if (status === 'loading' || state.loading) {
    return (
      <div className="space-y-4 sm:space-y-5">
        <SectionHeading title="Account Dashboard" subtitle="Loading your account data..." />
        <div className="surface p-6 text-sm text-foreground/60">Fetching your profile, orders, and wishlist.</div>
      </div>
    );
  }

  if (state.error || !state.profile) {
    return (
      <EmptyState
        title="Unable to load account"
        description={state.error ?? 'Please refresh the page or try again later.'}
        ctaLabel="Go back home"
        ctaHref="/"
      />
    );
  }

  return (
    <div className="relative space-y-5 sm:space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-border bg-card px-6 py-7 shadow-sm sm:px-8">
        <div className="relative z-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-foreground/50">Account Overview</p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">Welcome back, {state.profile?.name ?? 'Customer'}</h1>
          <p className="mt-2 max-w-2xl text-sm text-foreground/65">Manage your personal details, track orders, and keep your delivery addresses up to date.</p>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
            <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 font-semibold text-primary">{state.profile?.membership ?? 'Customer'}</span>
            <span className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-foreground/70">Signed in as {state.profile?.email}</span>
          </div>
        </div>
        <div className="absolute -right-24 -top-24 h-60 w-60 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -left-24 -bottom-24 h-60 w-60 rounded-full bg-secondary/10 blur-3xl" />
      </section>

      <div className="grid gap-5 lg:grid-cols-[240px,minmax(0,1fr)] lg:gap-6">
        <AccountSidebar />
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Orders" value={String(state.orders.length)} icon={<ReceiptText className="h-4 w-4 text-primary" />} />
            <WishlistStatCard count={state.wishlist.length} />
            <StatCard label="Delivered" value={String(deliveredCount)} icon={<PackageCheck className="h-4 w-4 text-primary" />} />
            <StatCard label="Reward Tier" value="Gold" icon={<Star className="h-4 w-4 text-primary" />} />
          </div>

          <section id="profile" className="scroll-mt-28">
            <ProfileCard profile={state.profile} />
          </section>

          <section id="wishlist" className="scroll-mt-28">
            <WishlistPanel products={state.wishlist} />
          </section>

          <section id="orders" className="scroll-mt-28">
            <OrdersTable orders={state.orders} />
          </section>

          <section id="settings" className="surface scroll-mt-28 space-y-5 p-6 sm:p-7">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Address Book</h2>
              <p className="mt-1 text-sm text-foreground/65">Manage multiple saved addresses and assign your two primary delivery addresses.</p>
            </div>

            {addressMessage ? (
              <p className="rounded-xl border border-border bg-muted/40 px-3 py-2 text-sm text-foreground/80">{addressMessage}</p>
            ) : null}

            <div className="space-y-3">
              {state.addresses.length === 0 ? (
                <p className="text-sm text-foreground/60">No saved addresses yet.</p>
              ) : (
                state.addresses.map((address) => (
                  <div key={address.id} className="rounded-2xl border border-border bg-card p-4 shadow-sm">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold">{address.label ?? 'Saved Address'}</p>
                      {address.isDefault ? <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">Default</span> : null}
                      {state.primaryAddress1Id === address.id ? <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-semibold text-foreground">Primary 1</span> : null}
                      {state.primaryAddress2Id === address.id ? <span className="rounded-full bg-secondary/20 px-2 py-0.5 text-xs font-semibold text-foreground">Primary 2</span> : null}
                    </div>
                    <p className="mt-2 text-sm text-foreground/80">
                      {address.fullName} • {address.phone}
                    </p>
                    <p className="text-sm text-foreground/70">
                      {formatAddress(address)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button size="sm" variant="outline" disabled={addressBusy} onClick={() => handleSetPrimary(1, address.id)}>
                        Set Primary 1
                      </Button>
                      <Button size="sm" variant="outline" disabled={addressBusy} onClick={() => handleSetPrimary(2, address.id)}>
                        Set Primary 2
                      </Button>
                      <Button size="sm" variant="outline" disabled={addressBusy} onClick={() => handleEditAddress(address)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" disabled={addressBusy} onClick={() => handleDeleteAddress(address.id)}>
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form className="grid gap-3 rounded-2xl border border-border bg-background/40 p-4" onSubmit={handleAddAddress}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-base font-semibold">{editingAddressId ? 'Edit Address' : 'Add New Address'}</h3>
                {editingAddressId ? (
                  <Button type="button" size="sm" variant="ghost" onClick={handleCancelEdit} disabled={addressBusy}>
                    Cancel edit
                  </Button>
                ) : null}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <FormField id="addressLabel" label="Label">
                  <Input id="addressLabel" placeholder="Home / Work" value={addressForm.label} onChange={(event) => setAddressForm((prev) => ({ ...prev, label: event.target.value }))} />
                </FormField>
                <FormField id="addressFullName" label="Full Name" required>
                  <Input id="addressFullName" value={addressForm.fullName} onChange={(event) => setAddressForm((prev) => ({ ...prev, fullName: event.target.value }))} />
                </FormField>
                <FormField id="addressPhone" label="Phone" required>
                  <Input id="addressPhone" value={addressForm.phone} onChange={(event) => setAddressForm((prev) => ({ ...prev, phone: event.target.value }))} />
                </FormField>
                <FormField id="addressCountry" label="Country" required>
                  <Input id="addressCountry" value={addressForm.country} onChange={(event) => setAddressForm((prev) => ({ ...prev, country: event.target.value }))} />
                </FormField>
              </div>
              <FormField id="addressLine1" label="Address Line 1" required>
                <Input id="addressLine1" value={addressForm.line1} onChange={(event) => setAddressForm((prev) => ({ ...prev, line1: event.target.value }))} />
              </FormField>
              <FormField id="addressLine2" label="Address Line 2">
                <Input id="addressLine2" value={addressForm.line2} onChange={(event) => setAddressForm((prev) => ({ ...prev, line2: event.target.value }))} />
              </FormField>
              <div className="grid gap-3 sm:grid-cols-3">
                <FormField id="addressCity" label="City" required>
                  <Input id="addressCity" value={addressForm.city} onChange={(event) => setAddressForm((prev) => ({ ...prev, city: event.target.value }))} />
                </FormField>
                <FormField id="addressState" label="State" required>
                  <Input id="addressState" value={addressForm.state} onChange={(event) => setAddressForm((prev) => ({ ...prev, state: event.target.value }))} />
                </FormField>
                <FormField id="addressPostal" label="Postal Code" required>
                  <Input id="addressPostal" value={addressForm.postalCode} onChange={(event) => setAddressForm((prev) => ({ ...prev, postalCode: event.target.value }))} />
                </FormField>
              </div>
              <div>
                <Button type="submit" size="sm" disabled={addressBusy}>
                  {addressBusy ? 'Saving...' : editingAddressId ? 'Save Address' : 'Add Address'}
                </Button>
              </div>
            </form>
          </section>
        </div>
      </div>
    </div>
  );
}
