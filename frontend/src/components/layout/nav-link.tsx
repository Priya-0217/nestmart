'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

type NavLinkProps = {
  href: string;
  label: string;
};

export function NavLink({ href, label }: NavLinkProps) {
  const pathname = usePathname();
  const active = href === '/' ? pathname === href : pathname?.startsWith(href);

  return (
    <Link
      href={href}
      className={cn(
        'rounded-full px-3 py-2 text-sm font-medium transition-all duration-300 ease-in-out',
        active ? 'bg-primary/10 text-primary' : 'text-foreground/75 hover:bg-muted hover:text-foreground'
      )}
    >
      {label}
    </Link>
  );
}
