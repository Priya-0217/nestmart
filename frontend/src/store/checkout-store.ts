import { create } from 'zustand';
import { PersistStorage, persist } from 'zustand/middleware';
import { CompletedOrder } from '@/lib/types';

type CheckoutState = {
  lastCompletedOrder: CompletedOrder | null;
  setLastCompletedOrder: (order: CompletedOrder) => void;
  clearLastCompletedOrder: () => void;
};

const storage: PersistStorage<CheckoutState> = {
  getItem: (name) => {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const value = window.localStorage.getItem(name);
      if (!value) {
        return null;
      }
      return JSON.parse(value);
    } catch {
      window.localStorage.removeItem(name);
      return null;
    }
  },
  setItem: (name, value) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.setItem(name, JSON.stringify(value));
    } catch {
      // Ignore storage write failures and continue in-memory.
    }
  },
  removeItem: (name) => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(name);
    } catch {
      // Ignore storage remove failures.
    }
  }
};

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      lastCompletedOrder: null,
      setLastCompletedOrder: (order) => set({ lastCompletedOrder: order }),
      clearLastCompletedOrder: () => set({ lastCompletedOrder: null })
    }),
    {
      name: 'nestmart-checkout-store',
      storage
    }
  )
);
