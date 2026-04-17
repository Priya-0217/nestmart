import Link from 'next/link';
import { UserRound, Heart, Package, Settings } from 'lucide-react';

const links = [
  { href: '/account', label: 'Profile', icon: UserRound },
  { href: '/account', label: 'Orders', icon: Package },
  { href: '/account', label: 'Wishlist', icon: Heart },
  { href: '/account', label: 'Settings', icon: Settings }
];

export function AccountSidebar() {
  return (
    <aside className="surface h-fit p-3">
      <ul className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 lg:block lg:space-y-1 lg:overflow-visible">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <li key={link.label}>
              <Link
                href={link.href}
                className="focus-ring flex min-w-max items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm font-medium text-foreground/75 transition-all duration-300 ease-in-out hover:bg-muted hover:text-foreground lg:min-w-0 lg:border-transparent"
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
