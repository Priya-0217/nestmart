import type { Metadata } from 'next';
import { AdminShell } from './components/admin-shell';

export const metadata: Metadata = {
  title: 'Admin',
  description: 'Modern admin dashboard for NestMart with analytics, catalog, orders, customers, and site management.'
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminShell>{children}</AdminShell>;
}