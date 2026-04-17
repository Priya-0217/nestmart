import { Metadata } from 'next';
import { PackageCheck, ReceiptText, Star } from 'lucide-react';
import { AccountSidebar } from '@/components/account/account-sidebar';
import { OrdersTable } from '@/components/account/orders-table';
import { ProfileCard } from '@/components/account/profile-card';
import { StatCard } from '@/components/account/stat-card';
import { WishlistPanel } from '@/components/account/wishlist-panel';
import { WishlistStatCard } from '@/components/account/wishlist-stat-card';
import { SectionHeading } from '@/components/ui/section-heading';
import { orders, products, profile } from '@/data/catalog';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Manage your profile, orders, and wishlist from your NestMart account dashboard.'
};

export default function AccountPage() {
  return (
    <div className="space-y-4 sm:space-y-5">
      <SectionHeading title="Account Dashboard" subtitle="Track orders, update profile details, and manage your wishlist." />

      <div className="grid gap-4 lg:grid-cols-[220px,minmax(0,1fr)] lg:gap-5">
        <AccountSidebar />
        <div className="space-y-4 sm:space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard label="Total Orders" value={String(orders.length)} icon={<ReceiptText className="h-4 w-4 text-primary" />} />
            <WishlistStatCard />
            <StatCard label="Delivered" value={String(orders.filter((order) => order.status === 'Delivered').length)} icon={<PackageCheck className="h-4 w-4 text-primary" />} />
            <StatCard label="Reward Tier" value="Gold" icon={<Star className="h-4 w-4 text-primary" />} />
          </div>

          <section id="profile" className="scroll-mt-24">
            <ProfileCard profile={profile} />
          </section>

          <section id="orders" className="scroll-mt-24">
            <OrdersTable orders={orders} />
          </section>

          <section id="wishlist" className="scroll-mt-24">
            <WishlistPanel products={products} />
          </section>

          <section id="settings" className="surface scroll-mt-24 p-5 sm:p-6">
            <h2 className="text-lg font-semibold">Settings</h2>
            <p className="mt-2 text-sm text-foreground/70">Notification and security controls are coming soon. For now, you can update your profile details above.</p>
          </section>
        </div>
      </div>
    </div>
  );
}
