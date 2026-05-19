import { Metadata } from 'next';
import { AccountPageContent } from '@/features/account/components/account-page-content';

export const metadata: Metadata = {
  title: 'Account',
  description: 'Manage your profile, orders, and wishlist from your NestMart account dashboard.'
};

export default function AccountPage() {
  return <AccountPageContent />;
}
