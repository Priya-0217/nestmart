import {
  BarChart3,
  BadgeDollarSign,
  Boxes,
  ChartColumnIncreasing,
  LayoutDashboard,
  Megaphone,
  PackageSearch,
  ReceiptText,
  Settings,
  ShieldCheck,
  Star,
  Tag,
  Users
} from 'lucide-react';
import { products as catalogProducts } from '@/data/catalog';
import { formatPrice } from '@/lib/utils';

export const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Boxes },
  { href: '/admin/orders', label: 'Orders', icon: ReceiptText },
  { href: '/admin/settings', label: 'Settings', icon: Settings }
];

export const dashboardKpis = [
  { label: 'Total Revenue', value: '₹18.4L', delta: '+12.4%', icon: BadgeDollarSign },
  { label: 'Orders', value: '3,421', delta: '+8.1%', icon: ReceiptText },
  { label: 'Customers', value: '1,248', delta: '+5.6%', icon: Users },
  { label: 'Conversion Rate', value: '3.8%', delta: '+0.9%', icon: ShieldCheck }
] as const;

export const salesTrend = [
  { label: 'Jan', revenue: 124000, orders: 142 },
  { label: 'Feb', revenue: 151000, orders: 168 },
  { label: 'Mar', revenue: 178000, orders: 182 },
  { label: 'Apr', revenue: 164000, orders: 171 },
  { label: 'May', revenue: 201000, orders: 196 },
  { label: 'Jun', revenue: 216000, orders: 214 },
  { label: 'Jul', revenue: 239000, orders: 228 }
];

export const orderDistribution = [
  { label: 'Pending', value: 126 },
  { label: 'Processing', value: 192 },
  { label: 'Shipped', value: 224 },
  { label: 'Delivered', value: 318 }
];

export const recentOrders = [
  { id: '#NM-1042', customer: 'Aarav Mehta', amount: 12490, status: 'Delivered', date: 'May 02, 2026' },
  { id: '#NM-1041', customer: 'Anika Sharma', amount: 8390, status: 'Processing', date: 'May 02, 2026' },
  { id: '#NM-1040', customer: 'Rohan Kapoor', amount: 16820, status: 'Shipped', date: 'May 01, 2026' },
  { id: '#NM-1039', customer: 'Maya Nair', amount: 5290, status: 'Pending', date: 'May 01, 2026' },
  { id: '#NM-1038', customer: 'Ishaan Verma', amount: 22100, status: 'Delivered', date: 'Apr 30, 2026' }
];

export const lowStockAlerts = [
  { name: 'Aurora Linen Sofa', sku: 'SOFA-OLV-L', stock: 4, category: 'Living Room' },
  { name: 'Nordic Pendant Lamp', sku: 'LAMP-SND-OS', stock: 6, category: 'Lighting' },
  { name: 'Terra Handloom Rug', sku: 'RUG-TERRA-5', stock: 8, category: 'Decor' },
  { name: 'Horizon Work Desk', sku: 'DESK-HZN-M', stock: 5, category: 'Office' }
];

export const productRows = catalogProducts.slice(0, 8).map((product, index) => ({
  id: product.id,
  name: product.name,
  slug: product.slug,
  price: product.price,
  compareAtPrice: product.compareAtPrice,
  stock: product.stock,
  category: product.category,
  status: product.stock > 30 ? 'Active' : product.stock > 15 ? 'Low stock' : 'Draft',
  image: product.images[0],
  sku: `NM-${String(index + 101).padStart(4, '0')}`
}));

export const categoryRows = [
  { id: 'cat-living', name: 'Living Room', slug: 'living-room', status: 'Published', children: ['Sofas', 'Coffee Tables', 'Accent Chairs'] },
  { id: 'cat-bed', name: 'Bedroom', slug: 'bedroom', status: 'Published', children: ['Beds', 'Nightstands', 'Storage'] },
  { id: 'cat-decor', name: 'Decor', slug: 'decor', status: 'Published', children: ['Rugs', 'Mirrors', 'Wall Art'] }
];

export const orderRows = [
  { id: 'NM-1042', customer: 'Aarav Mehta', amount: 12490, status: 'Delivered', date: '2026-05-02' },
  { id: 'NM-1041', customer: 'Anika Sharma', amount: 8390, status: 'Processing', date: '2026-05-02' },
  { id: 'NM-1040', customer: 'Rohan Kapoor', amount: 16820, status: 'Shipped', date: '2026-05-01' },
  { id: 'NM-1039', customer: 'Maya Nair', amount: 5290, status: 'Pending', date: '2026-05-01' },
  { id: 'NM-1038', customer: 'Ishaan Verma', amount: 22100, status: 'Delivered', date: '2026-04-30' },
  { id: 'NM-1037', customer: 'Sara Khan', amount: 9120, status: 'Delivered', date: '2026-04-30' }
];

export const customerRows = [
  { id: 'cust-1', name: 'Aarav Mehta', email: 'aarav@example.com', orders: 12, status: 'VIP', spend: 83200 },
  { id: 'cust-2', name: 'Anika Sharma', email: 'anika@example.com', orders: 8, status: 'Active', spend: 43100 },
  { id: 'cust-3', name: 'Rohan Kapoor', email: 'rohan@example.com', orders: 5, status: 'New', spend: 17400 },
  { id: 'cust-4', name: 'Maya Nair', email: 'maya@example.com', orders: 14, status: 'VIP', spend: 99500 },
  { id: 'cust-5', name: 'Ishaan Verma', email: 'ishaan@example.com', orders: 3, status: 'Active', spend: 12800 }
];

export const couponRows = [
  { code: 'NEST10', type: 'Percentage', discount: '10%', expiry: '2026-06-30', status: 'Active' },
  { code: 'WELCOME500', type: 'Flat', discount: '₹500', expiry: '2026-12-31', status: 'Active' },
  { code: 'FREESHIP', type: 'Shipping', discount: 'Free Shipping', expiry: '2026-05-15', status: 'Expiring' }
];

export const reviewRows = [
  { id: 'rev-1', product: 'Aurora Linen Sofa', author: 'Aarav Mehta', rating: 5, text: 'Great quality and delivery was smooth.', status: 'Pending' },
  { id: 'rev-2', product: 'Nordic Pendant Lamp', author: 'Anika Sharma', rating: 4, text: 'Looks elegant over the dining table.', status: 'Approved' },
  { id: 'rev-3', product: 'Terra Handloom Rug', author: 'Maya Nair', rating: 5, text: 'Colors are warm and the weave feels premium.', status: 'Pending' }
];

export const bannerRows = [
  { id: 'bnr-1', title: 'Summer Living Room Refresh', placement: 'Homepage Hero', status: 'Live' },
  { id: 'bnr-2', title: 'Kitchen Organization Week', placement: 'Promo Strip', status: 'Draft' },
  { id: 'bnr-3', title: 'Bedroom Essentials', placement: 'Category Banner', status: 'Live' }
];

export const reportRevenue = [
  { label: 'Week 1', revenue: 189000, organic: 92000, paid: 57000, direct: 40000 },
  { label: 'Week 2', revenue: 214000, organic: 103000, paid: 66000, direct: 45000 },
  { label: 'Week 3', revenue: 236000, organic: 114000, paid: 72000, direct: 50000 },
  { label: 'Week 4', revenue: 258000, organic: 126000, paid: 79000, direct: 53000 }
];

export const salesBreakdown = [
  { label: 'Furniture', value: 48 },
  { label: 'Decor', value: 18 },
  { label: 'Lighting', value: 14 },
  { label: 'Storage', value: 10 },
  { label: 'Accessories', value: 10 }
];

export const paymentOptions = [
  { label: 'Credit Card', description: 'Accept Visa, Mastercard, and Amex' },
  { label: 'UPI', description: 'Enable QR and intent-based payment flows' },
  { label: 'Wallets', description: 'Support Paytm, PhonePe, and similar wallets' }
];

export const shippingOptions = [
  { label: 'Standard shipping', description: '3 to 5 business days' },
  { label: 'Express shipping', description: 'Next business day delivery' },
  { label: 'Local pickup', description: 'Allow store pickup for selected cities' }
];

export function formatMoney(value: number) {
  return formatPrice(value);
}