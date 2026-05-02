'use client';

import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { SiteHeader } from '@/components/layout/site-header';
import { SiteFooter } from '@/components/layout/site-footer';
import { Container } from '@/components/layout/container';
import { PageTransition } from '@/components/motion/page-transition';
import { ToastViewport } from '@/components/ui/toast';

type AppShellProps = {
  children: ReactNode;
  fullWidth?: boolean;
};

export function AppShell({ children, fullWidth }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  if (isAdminRoute) {
    return (
      <>
        <ToastViewport />
        <main className="min-h-dvh">{children}</main>
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <ToastViewport />
      <main className="min-h-[calc(100dvh-4rem)] pb-6 pt-24 sm:pb-8 sm:pt-28 md:pt-32">
        <PageTransition>{fullWidth ? children : <Container>{children}</Container>}</PageTransition>
      </main>
      <SiteFooter />
    </>
  );
}
