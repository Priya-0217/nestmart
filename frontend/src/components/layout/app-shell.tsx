import { ReactNode } from 'react';
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
  return (
    <>
      <SiteHeader />
      <ToastViewport />
      <main className="min-h-[calc(100vh-4rem)] py-6 sm:py-8">
        <PageTransition>{fullWidth ? children : <Container>{children}</Container>}</PageTransition>
      </main>
      <SiteFooter />
    </>
  );
}
