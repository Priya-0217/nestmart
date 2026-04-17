'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, ShoppingBag, UserRound } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { Container } from '@/components/layout/container';
import { NavLink } from '@/components/layout/nav-link';
import { MobileDrawer } from '@/components/layout/mobile-drawer';
import { Input } from '@/components/ui/input';

const mainLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/account', label: 'Account' },
  { href: '/checkout', label: 'Checkout' }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-3">
        <Link href="/" className="min-w-fit">
          <span className="flex items-center gap-2">
            <Image src="/nestmart-logo.png" alt="NestMart logo" width={36} height={36} className="h-9 w-9" priority />
            <span className="font-display text-xl font-bold text-foreground">
              Nest<span className="text-primary">Mart</span>
            </span>
          </span>
        </Link>

        <div className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <Input aria-label="Search products" placeholder="Search products, brands, categories..." className="h-10 rounded-full pl-9" />
        </div>

        <nav className="hidden items-center md:flex">
          {mainLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/auth/login" className="icon-button focus-ring hidden rounded-full p-2 hover:bg-muted md:inline-flex" aria-label="Account">
            <UserRound className="h-5 w-5 text-foreground/80" />
          </Link>
          <motion.div whileTap={{ scale: 0.96 }}>
            <Link href="/cart" className="icon-button focus-ring relative inline-flex rounded-full border border-border bg-white p-2 hover:bg-muted" aria-label="Cart">
              <ShoppingBag className="h-5 w-5 text-foreground/85" />
              {mounted && cartCount > 0 ? (
                <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-secondary px-1 text-[11px] font-bold text-foreground">
                  {cartCount}
                </span>
              ) : null}
            </Link>
          </motion.div>
          <button className="icon-button focus-ring inline-flex rounded-full p-2 hover:bg-muted md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open menu">
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </Container>
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} links={mainLinks} />
    </header>
  );
}
