import {
  Boxes,
  LayoutDashboard,
  Layers,
  PackageSearch,
  ReceiptText,
  ShieldCheck,
  Star,
  Tag,
  Users,
  Megaphone,
  ShoppingBag
} from 'lucide-react';

export const adminNavItems = [
  { href: '/admin/dashboard', label: 'Overview', icon: LayoutDashboard, permission: 'dashboard:view' },
  { href: '/admin/products', label: 'Products', icon: Boxes, permission: 'products:write' },
  { href: '/admin/categories', label: 'Categories', icon: Layers, permission: 'categories:write' },
  { href: '/admin/orders', label: 'Orders', icon: ReceiptText, permission: 'orders:write' },
  { href: '/admin/customers', label: 'Customers', icon: Users, permission: 'customers:write' },
  { href: '/admin/coupons', label: 'Coupons', icon: Tag, permission: 'coupons:write' },
  { href: '/admin/inventory-alerts', label: 'Inventory Alerts', icon: PackageSearch, permission: 'inventory:view' },
  { href: '/admin/cms', label: 'CMS & Banners', icon: Megaphone, permission: 'cms:write' },
  { href: '/admin/reviews', label: 'Review Moderation', icon: Star, permission: 'reviews:moderate' },
  { href: '/admin/settings', label: 'Settings', icon: ShieldCheck, permission: 'dashboard:view' }
] as const;

export const invoiceSeed = {
  company: {
    name: 'NestMart Pvt. Ltd.',
    address: 'Level 6, MG Road, Bengaluru, Karnataka 560001',
    taxId: 'GSTIN 29ABCDE1234F1Z5'
  },
  supportEmail: 'support@nestmart.com'
};

export const adminShortcuts = [
  { label: 'Create Product', href: '/admin/products', icon: ShoppingBag },
  { label: 'Review Queue', href: '/admin/reviews', icon: Star }
] as const;

export type BannerRow = {
  id: string;
  title: string;
  image?: string;
  placement: 'hero' | 'sidebar' | 'footer' | 'promo' | 'collection';
  status: 'published' | 'draft';
};

export const bannerRows: BannerRow[] = [];
