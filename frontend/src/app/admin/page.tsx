import type { Metadata } from 'next';
import { AdminDashboard } from '@/features/admin/components/admin-dashboard';

export const metadata: Metadata = {
  title: 'Admin Panel',
  description: 'Manage NestMart orders, inventory, users, and store performance.'
};

export default function AdminPage() {
  return <AdminDashboard />;
}
