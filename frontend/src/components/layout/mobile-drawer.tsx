'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type MobileDrawerProps = {
  open: boolean;
  onClose: () => void;
  links: Array<{ href: string; label: string }>;
};

export function MobileDrawer({ open, onClose, links }: MobileDrawerProps) {
  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    const previousTouchAction = document.body.style.touchAction;
    document.body.style.overflow = 'hidden';
    document.body.style.touchAction = 'none';

    return () => {
      document.body.style.overflow = previousOverflow;
      document.body.style.touchAction = previousTouchAction;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.aside
            initial={false}
            className="fixed inset-0 z-[100] flex h-dvh w-screen flex-col gap-6 bg-white p-6 md:hidden"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <Link href="/" className="min-w-fit" onClick={onClose}>
                <span className="flex items-center gap-2">
                  <Image src="/nestmart-logo.png" alt="NestMart logo" width={36} height={36} className="h-9 w-9" priority />
                  <span className="font-display text-2xl font-bold text-foreground">
                    Nest<span className="text-primary">Mart</span>
                  </span>
                </span>
              </Link>
              <button className="icon-button focus-ring rounded-full p-1.5 hover:bg-muted" onClick={onClose} aria-label="Close menu">
                <X className="h-5 w-5" />
              </button>
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
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-foreground">Quick actions</p>
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
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
