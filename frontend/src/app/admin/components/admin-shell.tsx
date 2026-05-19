'use client';

import Link from 'next/link';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { ChevronDown, LogOut, Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';
import { adminNavItems } from './admin-data';
import { canAccess, isAdminPanelRole, normalizeAdminRole } from './admin-rbac';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type AdminShellProps = {
  children: ReactNode;
};

export function AdminShell({ children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session, status } = useSession();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const role = normalizeAdminRole(session?.user?.role);
  const isAdminUser = isAdminPanelRole(session?.user?.role);

  const navItems = useMemo(
    () => adminNavItems.filter((item) => canAccess(item.permission, role)),
    [role]
  );

  useEffect(() => {
    setMobileOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      if (loggingOut) {
        router.replace('/');
        return;
      }
      router.replace('/admin/login');
      return;
    }

    if (status === 'authenticated' && !isAdminUser) {
      router.replace('/');
    }
  }, [isAdminUser, loggingOut, router, status]);

  useEffect(() => {
    if (status !== 'authenticated' || !isAdminUser || !navItems.length) return;

    const canOpenCurrent = navItems.some((item) => pathname?.startsWith(item.href));
    if (!canOpenCurrent && pathname?.startsWith('/admin')) {
      router.replace('/admin/dashboard');
    }
  }, [isAdminUser, navItems, pathname, router, status]);

  if (status === 'loading') return null;
  if (status === 'authenticated' && !isAdminUser) return null;

  return (
    <div className="relative min-h-dvh overflow-hidden bg-[radial-gradient(circle_at_10%_0%,rgba(26,86,219,0.14),transparent_36%),radial-gradient(circle_at_90%_100%,rgba(245,158,11,0.12),transparent_36%),linear-gradient(180deg,rgba(248,250,252,1)_0%,rgba(241,245,249,1)_100%)] dark:bg-[radial-gradient(circle_at_10%_0%,rgba(70,130,255,0.16),transparent_36%),radial-gradient(circle_at_90%_100%,rgba(255,184,77,0.1),transparent_36%),linear-gradient(180deg,rgba(10,10,14,1)_0%,rgba(14,17,24,1)_100%)]">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(26,86,219,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(26,86,219,0.05)_1px,transparent_1px)] bg-[size:72px_72px] opacity-40 dark:opacity-20" />

      <div className="relative z-10 flex min-h-dvh">
        <aside
          className={cn(
            'fixed inset-y-0 left-0 z-[160] flex w-80 flex-col border-r border-border/70 bg-card/95 backdrop-blur-xl transition-all duration-300 dark:bg-[rgb(var(--color-card)/0.72)] lg:sticky lg:top-0 lg:h-dvh',
            collapsed ? 'lg:w-24' : 'lg:w-80',
            mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          )}
        >
          <div className="flex items-center justify-between border-b border-border px-4 py-4">
            <Link href="/admin/dashboard" className={cn('flex items-center gap-3', collapsed && 'lg:justify-center')}>
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-white shadow-lg shadow-primary/20">NM</span>
              {!collapsed ? (
                <span>
                  <span className="block text-[11px] font-semibold uppercase tracking-[0.24em] text-foreground/45">NestMart</span>
                  <span className="block text-lg font-semibold text-foreground">Admin Console</span>
                </span>
              ) : null}
            </Link>
            <Button variant="ghost" size="sm" className="h-9 w-9 rounded-full p-0 lg:hidden" onClick={() => setMobileOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>

          <nav className="flex-1 space-y-1 overflow-auto px-3 py-4">
            {navItems.map((item) => {
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
                  <span
                    className={cn(
                      'flex h-9 w-9 items-center justify-center rounded-xl bg-card text-foreground/65 ring-1 ring-border/70 transition group-hover:bg-primary/10 group-hover:text-primary',
                      active && 'bg-primary text-white ring-primary/20'
                    )}
                  >
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
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/45">Signed in as</p>
              <p className="mt-2 text-sm font-semibold capitalize text-foreground">{role ?? 'admin'}</p>
              <p className="mt-1 text-xs text-foreground/60">Role-based controls are active.</p>
            </div>
          </div>
        </aside>

        {mobileOpen ? (
          <button
            type="button"
            aria-label="Close sidebar"
            className="fixed inset-0 z-[150] bg-slate-950/45 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        ) : null}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-[140] border-b border-border/70 bg-card/80 backdrop-blur-xl dark:bg-[rgb(var(--color-card)/0.6)]">
            <div className="flex min-h-20 items-center gap-3 px-4 sm:px-6 lg:px-8">
              <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0 lg:hidden" onClick={() => setMobileOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>

              <div className="hidden items-center gap-2 lg:flex">
                <Button variant="ghost" size="sm" className="h-10 w-10 rounded-full p-0" onClick={() => setCollapsed((state) => !state)}>
                  {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
                </Button>
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-foreground/40">Admin Workspace</p>
                  <h1 className="text-lg font-semibold text-foreground">NestMart Operations</h1>
                </div>
              </div>

              <div className="ml-auto flex items-center gap-2 sm:gap-3">
                <Badge tone="default" className="hidden rounded-full px-3 py-1 text-[11px] capitalize sm:inline-flex">
                  {role ?? 'admin'} access
                </Badge>

                <div className="relative">
                  <Button variant="outline" size="sm" className="h-10 rounded-full px-3" onClick={() => setProfileOpen((state) => !state)}>
                    <span className="mr-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                      {session?.user?.name?.[0] ?? 'A'}
                    </span>
                    <span className="hidden sm:inline">{session?.user?.name ?? 'Admin User'}</span>
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>

                  {profileOpen ? (
                    <div className="absolute right-0 top-full z-[170] mt-2 w-64 rounded-3xl border border-border bg-card p-2 shadow-2xl">
                      <div className="px-3 py-2">
                        <p className="text-sm font-semibold text-foreground">{session?.user?.name ?? 'Admin User'}</p>
                        <p className="text-xs text-foreground/55">{session?.user?.email ?? 'admin@nestmart.com'}</p>
                      </div>
                      <div className="my-2 h-px bg-border" />
                      <button
                        type="button"
                        className="flex w-full items-center gap-2 rounded-2xl px-3 py-2.5 text-left text-sm text-red-500 hover:bg-red-50"
                        onClick={async () => {
                          setLoggingOut(true);
                          await signOut({ redirect: false });
                          router.replace('/');
                        }}
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
