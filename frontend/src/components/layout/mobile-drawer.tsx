'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, LogOut, UserRound } from 'lucide-react';
import { useSession, signOut } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Logo } from '@/components/ui/logo';
import { ThemeToggle } from '@/components/ui/skiper-ui/skiper4';

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  links: Array<{ href: string; label: string }>;
};

export function MobileDrawer({ open, onClose, links }: MobileDrawerProps) {
  const { status } = useSession();
  
  useEffect(() => {
    if (!open) {
      return;
    }

    const onResize = () => {
      if (window.innerWidth >= 768) {
        onClose();
      }
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousHtmlOverflow = document.documentElement.style.overflow;
    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      document.documentElement.style.overflow = previousHtmlOverflow;
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
      document.body.style.paddingRight = '';
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            type="button"
            aria-label="Close menu overlay"
            className="fixed inset-0 z-[100] bg-black/45 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: 36, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 36, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 z-[110] flex h-dvh w-full flex-col gap-6 bg-card p-6 md:hidden dark:bg-[rgb(var(--color-card))] dark:border-r dark:border-white/[0.07] dark:shadow-[-8px_0_40px_rgba(0,0,0,0.5)]"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Link href="/" className="min-w-fit" onClick={onClose}>
                <Logo className="h-20 w-20" />
              </Link>
              <div className="flex items-center gap-2">
                <ThemeToggle className="h-9 w-9 p-2" />
                <button className="icon-button focus-ring rounded-full p-1.5 hover:bg-muted" onClick={onClose} aria-label="Close menu">
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">Navigation</p>
              <nav className="space-y-2">
                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn('block rounded-xl border border-border px-3 py-2.5 text-sm font-medium text-foreground hover:bg-muted')}
                    onClick={onClose}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="mt-auto space-y-3 border-t border-border pt-4">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">Account</p>
              <div className="grid grid-cols-1 gap-2">
                {status === 'authenticated' ? (
                  <>
                    <Link href="/account" onClick={onClose} className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 text-sm font-medium hover:bg-muted transition-colors">
                      <UserRound className="h-4 w-4" />
                      My Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        onClose();
                        signOut({ callbackUrl: '/' });
                      }}
                      className="flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link href="/auth/login" onClick={onClose}>
                      <Button variant="outline" className="w-full">
                        Sign in
                      </Button>
                    </Link>
                    <Link href="/cart" onClick={onClose}>
                      <Button className="w-full">Cart</Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
