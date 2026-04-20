import Link from 'next/link';
import { UserRound, Heart, Package, Settings } from 'lucide-react';

const links = [
  { href: '/account#profile', label: 'Profile', icon: UserRound },
  { href: '/account#orders', label: 'Orders', icon: Package },
  { href: '/account#wishlist', label: 'Wishlist', icon: Heart },
  { href: '/account#settings', label: 'Settings', icon: Settings }
];

export function AccountSidebar() {
  return (
    <aside className="surface h-fit p-3">
      <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.label}>
              <Link
                href={link.href}
                className="focus-ring flex w-full items-center justify-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm font-medium text-foreground/75 transition-all duration-300 ease-in-out hover:bg-muted hover:text-foreground lg:justify-start lg:border-transparent"
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
