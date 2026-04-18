'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Menu, Search, ShoppingBag, UserRound } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { products } from '@/data/catalog';
import { Container } from '@/components/layout/container';
import { NavLink } from '@/components/layout/nav-link';
import { MobileDrawer } from '@/components/layout/mobile-drawer';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProductImage } from '@/components/ui/product-image';

const mainLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/account', label: 'Account' },
  { href: '/checkout', label: 'Checkout' }
];

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return [];
    }

    return products
      .filter((product) => {
        const haystack = `${product.name} ${product.category} ${product.tag} ${product.brand}`.toLowerCase();
        return haystack.includes(trimmed);
      })
      .slice(0, 6);
  }, [query]);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setQuery('');
    setSearchOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (!searchRef.current || !event.target) {
        return;
      }

      if (!searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, []);

  const handleSearchSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    router.push(`/products?search=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[130] border-b border-border bg-card/90 backdrop-blur">
      <Container className="flex h-16 items-center gap-3">
        <Link href="/" className="min-w-fit">
          <span className="flex items-center gap-2">
            <Image src="/nestmart-logo.png" alt="NestMart logo" width={36} height={36} className="h-9 w-9" priority />
            <span className="font-display text-xl font-bold text-foreground">
              Nest<span className="text-primary">Mart</span>
            </span>
          </span>
        </Link>

        <div ref={searchRef} className="relative hidden flex-1 md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <Input
            aria-label="Search products"
            placeholder="Search products, brands, categories..."
            className="h-10 rounded-full pl-9"
            value={query}
            onFocus={() => {
              if (query.trim()) {
                setSearchOpen(true);
              }
            }}
            onChange={(event) => {
              const nextValue = event.target.value;
              setQuery(nextValue);
              setSearchOpen(Boolean(nextValue.trim()));
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSearchSubmit();
              }
              if (event.key === 'Escape') {
                setSearchOpen(false);
              }
            }}
          />
          {searchOpen && query.trim() ? (
            <div className="absolute left-0 top-full z-40 mt-2 w-full rounded-2xl border border-border bg-white/95 p-2 shadow-lg backdrop-blur">
              {results.length > 0 ? (
                <ul className="max-h-72 overflow-auto">
                  {results.map((product) => (
                    <li key={product.id}>
                      <button
                        type="button"
                        className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-muted"
                        onClick={() => {
                          router.push(`/products/${product.slug}`);
                          setSearchOpen(false);
                          setQuery('');
                        }}
                      >
                        <ProductImage src={product.images[0]} alt={product.name} width={32} height={32} className="h-8 w-8 rounded-md object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-foreground">{product.name}</p>
                          <Badge tone="muted" className="mt-1">
                            {product.category}
                          </Badge>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-3 py-2 text-sm text-foreground/60">No matches for "{query}".</div>
              )}
            </div>
          ) : null}
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
          {!menuOpen && (
            <button
              className="icon-button focus-ring relative z-[131] inline-flex rounded-full p-2 hover:bg-muted md:hidden"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}
        </div>
      </Container>
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} links={mainLinks} />
    </header>
  );
}
