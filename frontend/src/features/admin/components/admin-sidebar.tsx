'use client';

import Link from 'next/link';
import { BarChart3, Boxes, ReceiptText, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const links = [
  { href: '/admin#overview', label: 'Overview', icon: BarChart3 },
  { href: '/admin#orders', label: 'Orders', icon: ReceiptText },
  { href: '/admin#inventory', label: 'Inventory', icon: Boxes },
  { href: '/admin#settings', label: 'Settings', icon: Settings }
];

export function AdminSidebar() {
  return (
    <aside className="surface h-fit p-3">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.label}>
              <Link
                href={link.href}
                className={cn(
                  'focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out hover:bg-muted hover:text-foreground lg:justify-start lg:border-transparent',
                  'text-foreground/75'
                )}
              >
                <Icon className="h-4 w-4" />
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
