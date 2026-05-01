import { Metadata } from 'next';
import { AdminPageContent } from '@/features/admin/components/admin-page-content';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Monitor orders, inventory, and storefront operations from the NestMart admin dashboard.'
};

export default function AdminPage() {
  return <AdminPageContent />;
}
