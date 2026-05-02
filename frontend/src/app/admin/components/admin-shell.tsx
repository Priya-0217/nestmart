'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { Bell, ChevronDown, Menu, PanelLeftClose, PanelLeftOpen, Search, X, LogOut } from 'lucide-react';
import { adminNavItems } from './admin-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { signOut } from 'next-auth/react';

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  const activeLabel = useMemo(() => adminNavItems.find((item) => pathname?.startsWith(item.href))?.label ?? 'Dashboard', [pathname]);

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(26,86,219,0.12),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.08),_transparent_24%),linear-gradient(180deg,_rgba(248,250,252,1)_0%,_rgba(241,245,249,1)_100%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(70,130,255,0.14),_transparent_28%),radial-gradient(circle_at_bottom_right,_rgba(255,184,77,0.08),_transparent_24%),linear-gradient(180deg,_rgba(10,10,14,1)_0%,_rgba(15,17,24,1)_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.35)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.35)_1px,transparent_1px)] bg-[size:72px_72px] opacity-[0.04] dark:opacity-[0.06]" />

      <div className="relative z-10 flex min-h-dvh">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-[150] flex w-80 flex-col border-r border-border/70 bg-card/95 backdrop-blur-xl transition-all duration-300 dark:bg-[rgb(var(--color-card)/0.72)] lg:sticky lg:top-0 lg:h-dvh',
            collapsed ? 'lg:w-24' : 'lg:w-80',
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-4">
            <Link href="/admin/dashboard" className={cn('flex items-center gap-3', collapsed && 'lg:justify-center')}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/25">NM</span>
              {!collapsed ? (
                <span>
                  <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-foreground/50">NestMart</span>
                  <span className="block text-lg font-semibold text-foreground">Admin</span>
                </span>
              ) : null}
            </Link>

            <div className="flex items-center gap-2 lg:hidden">
              <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0" onClick={() => setMobileOpen(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="border-b border-border px-4 py-4">
            {/* Search bar removed */}
          </div>

          <nav className="flex-1 space-y-1 overflow-auto px-3 py-4">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const active = pathname?.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-medium transition-all duration-200 hover:bg-muted hover:text-foreground',
                    active ? 'bg-primary/10 text-primary shadow-sm' : 'text-foreground/70',
                    collapsed && 'lg:justify-center lg:px-2'
                  )}
                >
                  <span className={cn('flex h-9 w-9 items-center justify-center rounded-xl bg-card text-foreground/65 ring-1 ring-border/70 transition group-hover:bg-primary/10 group-hover:text-primary', active && 'bg-primary text-white ring-primary/20')}>
                    <Icon className="h-4 w-4" />
                  </span>
                  {!collapsed ? <span className="flex-1">{item.label}</span> : null}
                  {!collapsed && active ? <span className="h-2 w-2 rounded-full bg-primary" /> : null}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-border p-4">
            <div className={cn('rounded-3xl border border-border bg-muted/45 p-4', collapsed && 'lg:text-center')}>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-foreground/45">Quick glance</p>
              <p className="mt-2 text-lg font-semibold text-foreground">{activeLabel}</p>
              <p className="mt-1 text-sm text-foreground/60">Static UI only, ready for backend integration.</p>
            </div>
          </div>
        </aside>

        {mobileOpen ? <button type="button" aria-label="Close sidebar" className="fixed inset-0 z-[140] bg-slate-950/45 lg:hidden" onClick={() => setMobileOpen(false)} /> : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-[120] border-b border-border/70 bg-card/70 backdrop-blur-xl dark:bg-[rgb(var(--color-card)/0.6)]">
            <div className="flex min-h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
              <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0 lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden items-center gap-2 lg:flex">
                <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0" onClick={() => setCollapsed((state) => !state)}>
                  {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                </Button>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Admin workspace</p>
                  <h1 className="text-lg font-semibold text-foreground">NestMart operations</h1>
                </div>
              </div>

              <div className="hidden min-w-0 flex-1 xl:block">
                {/* Search bar removed */}
              </div>

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <div className="relative">
                  <Button variant="outline" size="sm" className="h-10 rounded-full px-3" onClick={() => setProfileOpen((state) => !state)}>
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">AD</span>
                    <span className="hidden sm:inline">Admin</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>

                  {profileOpen ? (
                    <div className="absolute right-0 top-full z-[160] mt-2 w-56 rounded-3xl border border-border bg-card p-2 shadow-2xl">
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold text-foreground">Aman Gupta</p>
                        <p className="text-xs text-foreground/55">admin@nestmart.com</p>
                      </div>
                      <div className="my-2 h-px bg-border" />
                      <button 
                        type="button" 
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm text-red-500 hover:bg-red-50" 
                        onClick={() => signOut({ callbackUrl: '/auth/login' })}
                      >
                        <LogOut className="h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
            <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-6">{children}</div>
          </main>
        </div>
      </div>
    </div>
  );
}