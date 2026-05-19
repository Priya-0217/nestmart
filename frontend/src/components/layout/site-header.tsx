'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { Menu, Search, ShoppingBag, UserRound, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/cart-store';
import { categoriesApi, productsApi, type CategoryTreeItem, type ProductSummary } from '@/lib/api';
import { Container } from '@/components/layout/container';
import { NavLink } from '@/components/layout/nav-link';
import { MobileDrawer } from '@/components/layout/mobile-drawer';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ProductImage } from '@/components/ui/product-image';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/skiper-ui/skiper4';

const baseLinks = [
  { href: '/', label: 'Home' },
  { href: '/products', label: 'Shop' },
  { href: '/checkout', label: 'Checkout' }
];

const adminLink = { href: '/admin', label: 'Admin' };
const RECENT_SEARCHES_KEY = 'nestmart-recent-searches';

function highlightQuery(text: string, query: string) {
  const trimmed = query.trim();
  if (!trimmed) return text;
  const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${escaped})`, 'ig');
  const chunks = text.split(regex);

  return chunks.map((chunk, index) =>
    chunk.toLowerCase() === trimmed.toLowerCase() ? (
      <mark key={`${chunk}-${index}`} className="rounded bg-secondary/25 px-0.5 text-foreground">
        {chunk}
      </mark>
    ) : (
      <span key={`${chunk}-${index}`}>{chunk}</span>
    )
  );
}

function flattenCategories(categories: CategoryTreeItem[]): CategoryTreeItem[] {
  const out: CategoryTreeItem[] = [];
  const walk = (nodes: CategoryTreeItem[]) => {
    nodes.forEach((node) => {
      out.push(node);
      if (node.children?.length) walk(node.children);
    });
  };
  walk(categories);
  return out;
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchResults, setSearchResults] = useState<ProductSummary[]>([]);
  const [categoryMatches, setCategoryMatches] = useState<CategoryTreeItem[]>([]);
  const [allCategories, setAllCategories] = useState<CategoryTreeItem[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const cartCount = useCartStore((state) => state.items.reduce((sum, item) => sum + item.quantity, 0));

  const navLinks = useMemo(() => {
    const role = session?.user?.role;
    if (status === 'loading') return baseLinks;
    if (role === 'admin' || role === 'manager' || role === 'support') return [...baseLinks, adminLink];
    return baseLinks;
  }, [session?.user?.role, status]);

  const results = useMemo(() => searchResults.slice(0, 6), [searchResults]);

  useEffect(() => {
    setMounted(true);
    const saved = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as string[];
        setRecentSearches(parsed.filter(Boolean).slice(0, 5));
      } catch {
        setRecentSearches([]);
      }
    }
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

  useEffect(() => {
    categoriesApi
      .tree()
      .then(({ items }) => setAllCategories(flattenCategories(items)))
      .catch(() => setAllCategories([]));
  }, []);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setSearchResults([]);
      setCategoryMatches([]);
      return;
    }

    const timeout = setTimeout(async () => {
      try {
        const { items } = await productsApi.list({ q: trimmed, limit: 6 });
        setSearchResults(items);
        const matchedCats = allCategories.filter((category) => category.name.toLowerCase().includes(trimmed.toLowerCase())).slice(0, 4);
        setCategoryMatches(matchedCats);
      } catch {
        setSearchResults([]);
        setCategoryMatches([]);
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [allCategories, query]);

  const handleSearchSubmit = () => {
    const trimmed = query.trim();
    if (!trimmed) {
      return;
    }

    const nextRecent = [trimmed, ...recentSearches.filter((item) => item.toLowerCase() !== trimmed.toLowerCase())].slice(0, 5);
    setRecentSearches(nextRecent);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(nextRecent));

    router.push(`/search?q=${encodeURIComponent(trimmed)}`);
    setSearchOpen(false);
  };

  return (
    <header className="fixed inset-x-0 top-0 z-[130] border-b border-border bg-card/90 backdrop-blur-md will-change-[transform] dark:bg-card/50 dark:backdrop-blur-xl dark:border-white/[0.07] dark:shadow-[0_1px_0_rgba(255,255,255,0.05),0_4px_24px_rgba(0,0,0,0.35)]">
      <Container className="flex h-20 items-center gap-3 md:h-24 md:gap-6">
        <Link href="/" className="inline-flex shrink-0 items-center justify-center transition-opacity duration-200 hover:opacity-85 active:opacity-75 focus-visible:outline-offset-2 focus-visible:outline-2 focus-visible:outline-secondary rounded-full" aria-label="NestMart Home">
          <Logo className="h-20 w-20 md:h-24 md:w-24" />
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
            <div className="absolute left-0 top-full z-40 mt-2 w-full rounded-2xl border border-border bg-card/95 p-2 shadow-lg backdrop-blur dark:bg-card/70 dark:backdrop-blur-xl dark:border-white/[0.07] dark:shadow-[0_8px_32px_rgba(0,0,0,0.45)]">
              <div className="max-h-80 space-y-2 overflow-auto">
                {results.length > 0 ? (
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-foreground/50">Products</p>
                    <ul>
                      {results.map((product) => (
                        <li key={product._id}>
                          <button
                            type="button"
                            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left text-sm transition hover:bg-muted"
                            onClick={() => {
                              router.push(`/products/${product.slug}`);
                              setSearchOpen(false);
                              setQuery('');
                            }}
                          >
                            <ProductImage src={product.images?.[0] ?? '/product-placeholder.svg'} alt={product.title} category={product.brand} width={32} height={32} className="h-8 w-8 rounded-md object-cover" />
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium text-foreground">{highlightQuery(product.title, query)}</p>
                              <Badge tone="muted" className="mt-1">
                                {product.brand}
                              </Badge>
                            </div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}

                {categoryMatches.length > 0 ? (
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-foreground/50">Categories</p>
                    <div className="flex flex-wrap gap-1.5 px-2 pb-2">
                      {categoryMatches.map((category) => (
                        <button
                          key={category._id}
                          type="button"
                          className="focus-ring rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted"
                          onClick={() => {
                            router.push(`/products?category=${encodeURIComponent(category._id)}`);
                            setSearchOpen(false);
                            setQuery('');
                          }}
                        >
                          {highlightQuery(category.name, query)}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {recentSearches.length > 0 ? (
                  <div>
                    <p className="px-2 py-1 text-xs font-semibold uppercase tracking-wider text-foreground/50">Recent searches</p>
                    <div className="flex flex-wrap gap-1.5 px-2 pb-1">
                      {recentSearches.map((recent) => (
                        <button
                          key={recent}
                          type="button"
                          className="focus-ring rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium hover:bg-muted"
                          onClick={() => {
                            setQuery(recent);
                            router.push(`/search?q=${encodeURIComponent(recent)}`);
                            setSearchOpen(false);
                          }}
                        >
                          {recent}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}

                {results.length === 0 && categoryMatches.length === 0 ? (
                  <div className="px-3 py-2 text-sm text-foreground/60">No matches for "{query}".</div>
                ) : null}
              </div>

              <button
                type="button"
                className="mt-2 w-full rounded-xl border border-border bg-muted/40 px-3 py-2 text-left text-sm font-semibold text-foreground/85 hover:bg-muted"
                onClick={handleSearchSubmit}
              >
                See all results for "{query.trim()}"
              </button>
            </div>
          ) : null}
        </div>

        <nav className="hidden items-center md:flex">
          {navLinks.map((link) => (
            <NavLink key={link.href} href={link.href} label={link.label} />
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle className="h-9 w-9 p-2 hidden md:inline-flex" />
          
          {status === 'authenticated' ? (
            <div className="flex items-center gap-1">
              <Link href="/account" className="icon-button focus-ring inline-flex rounded-full p-2 hover:bg-muted" aria-label="Account">
                <UserRound className="h-5 w-5 text-foreground/80" />
              </Link>
              <button 
                onClick={() => signOut({ callbackUrl: '/' })}
                className="icon-button focus-ring inline-flex rounded-full p-2 hover:bg-red-500/10 hover:text-red-500 text-foreground/80 transition-colors" 
                aria-label="Logout"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <Link href="/auth/login" className="icon-button focus-ring inline-flex rounded-full p-2 hover:bg-muted" aria-label="Login">
              <UserRound className="h-5 w-5 text-foreground/80" />
            </Link>
          )}

          <motion.div whileTap={{ scale: 0.96 }}>
            <Link href="/cart" className="icon-button focus-ring relative inline-flex rounded-full border border-border bg-card p-2 hover:bg-muted dark:bg-card/60 dark:backdrop-blur-md dark:border-white/[0.08]" aria-label="Cart">
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
      <MobileDrawer open={menuOpen} onClose={() => setMenuOpen(false)} links={navLinks} />
    </header>
  );
}
