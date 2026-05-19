'use client';

import { CartItem } from '@/lib/types';
import { cartApi, type CartTotals } from '@/lib/api';
import { clamp } from '@/lib/utils';
import { create } from 'zustand';
import { PersistStorage, persist } from 'zustand/middleware';

type CartState = {
  items: CartItem[];
  totals: CartTotals | null;
  addItem: (productId: string, variantId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string, variantId: string) => Promise<void>;
  updateQuantity: (productId: string, variantId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  syncWithBackend: () => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => Promise<void>;
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
    (set, get) => ({
      items: [],
      totals: null,
      addItem: async (productId, variantId, quantity = 1) => {
        const currentItems = get().items;
        // Optimistic update
        set((state) => ({
          items: upsertItem(state.items, { productId, variantId, quantity: clamp(quantity, 1, 99) })
        }));

        try {
          const { cart, totals } = await cartApi.addItem(productId, quantity);
          set({
            items: cart.items.map((item) => ({
              productId: item.productId,
              variantId: 'default',
              quantity: item.quantity
            })),
            totals
          });
        } catch {
          // Revert on error
          set({ items: currentItems });
        }
      },
      removeItem: async (productId, variantId) => {
        const currentItems = get().items;
        // Optimistic update
        set((state) => ({
          items: state.items.filter((item) => !(item.productId === productId && item.variantId === variantId))
        }));

        try {
          const { cart, totals } = await cartApi.removeItem(productId);
          set({
            items: cart.items.map((item) => ({
              productId: item.productId,
              variantId: 'default',
              quantity: item.quantity
            })),
            totals
          });
        } catch {
          // Revert on error
          set({ items: currentItems });
        }
      },
      updateQuantity: async (productId, variantId, quantity) => {
        const currentItems = get().items;
        // Optimistic update
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((item) => !(item.productId === productId && item.variantId === variantId))
              : state.items.map((item) =>
                  item.productId === productId && item.variantId === variantId
                    ? { ...item, quantity: clamp(quantity, 1, 99) }
                    : item
                )
        }));

        try {
          const { cart, totals } = await cartApi.updateItem(productId, quantity);
          set({
            items: cart.items.map((item) => ({
              productId: item.productId,
              variantId: 'default',
              quantity: item.quantity
            })),
            totals
          });
        } catch {
          // Revert on error
          set({ items: currentItems });
        }
      },
      clearCart: () => set({ items: [], totals: null }),
      syncWithBackend: async () => {
        try {
          const { cart, totals } = await cartApi.get();
          set({
            items: cart.items.map((item) => ({
              productId: item.productId,
              variantId: 'default',
              quantity: item.quantity
            })),
            totals
          });
        } catch {
          // Not logged in or error
        }
      },
      applyCoupon: async (code: string) => {
        const { cart, totals } = await cartApi.applyCoupon(code);
        set({
          items: cart.items.map((item) => ({
            productId: item.productId,
            variantId: 'default',
            quantity: item.quantity
          })),
          totals
        });
      },
      removeCoupon: async () => {
        const { cart, totals } = await cartApi.removeCoupon();
        set({
          items: cart.items.map((item) => ({
            productId: item.productId,
            variantId: 'default',
            quantity: item.quantity
          })),
          totals
        });
      }
    }),
    {
      name: 'nestmart-cart-store',
      storage
    }
  )
);

export const selectCartCount = (state: CartState) => state.items.reduce((sum, item) => sum + item.quantity, 0);
