'use client';

import { useEffect, type ReactNode } from 'react';
import { SessionProvider, useSession } from 'next-auth/react';
import { useCartStore } from '@/store/cart-store';

function CartSyncProvider({ children }: { children: ReactNode }) {
  const { status } = useSession();
  const syncWithBackend = useCartStore((state) => state.syncWithBackend);

  useEffect(() => {
    if (status === 'authenticated') {
      syncWithBackend();
    }
  }, [status, syncWithBackend]);

  return <>{children}</>;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <CartSyncProvider>{children}</CartSyncProvider>
    </SessionProvider>
  );
}
