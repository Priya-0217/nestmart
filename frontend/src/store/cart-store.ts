'use client';

import { CartItem } from '@/lib/types';
import { clamp } from '@/lib/utils';
import { create } from 'zustand';
import { PersistStorage, persist } from 'zustand/middleware';

type CartState = {
  items: CartItem[];
  addItem: (productId: string, variantId: string, quantity?: number) => void;
  removeItem: (productId: string, variantId: string) => void;
  updateQuantity: (productId: string, variantId: string, quantity: number) => void;
  clearCart: () => void;
};

function upsertItem(items: CartItem[], payload: CartItem) {
  const index = items.findIndex((item) => item.productId === payload.productId && item.variantId === payload.variantId);
  if (index === -1) {
    return [...items, payload];
  }

  const updated = [...items];
  updated[index] = {
    ...updated[index],
    quantity: clamp(updated[index].quantity + payload.quantity, 1, 99)
  };
  return updated;
}

const storage: PersistStorage<CartState> = {
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
      // Ignore storage write failures (quota/private mode) and continue in-memory.
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

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (productId, variantId, quantity = 1) =>
        set((state) => ({
          items: upsertItem(state.items, { productId, variantId, quantity: clamp(quantity, 1, 99) })
        })),
      removeItem: (productId, variantId) =>
        set((state) => ({
          items: state.items.filter((item) => !(item.productId === productId && item.variantId === variantId))
        })),
      updateQuantity: (productId, variantId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => !(item.productId === productId && item.variantId === variantId))
              : state.items.map((item) =>
                  item.productId === productId && item.variantId === variantId
                    ? { ...item, quantity: clamp(quantity, 1, 99) }
                    : item
                )
        })),
      clearCart: () => set({ items: [] })
    }),
    {
      name: 'nestmart-cart-store',
      storage
    }
  )
);

export const selectCartCount = (state: CartState) => state.items.reduce((sum, item) => sum + item.quantity, 0);
