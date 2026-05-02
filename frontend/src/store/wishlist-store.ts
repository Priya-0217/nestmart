import { create } from 'zustand';
import { PersistStorage, persist } from 'zustand/middleware';

type WishlistState = {
  productIds: string[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
};

const storage: PersistStorage<WishlistState> = {
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

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      productIds: [],
      addItem: (productId) =>
        set((state) => ({
          productIds: state.productIds.includes(productId)
            ? state.productIds
            : [...state.productIds, productId]
        })),
      removeItem: (productId) =>
        set((state) => ({
          productIds: state.productIds.filter((id) => id !== productId)
        })),
      toggleItem: (productId) => {
        const { productIds } = get();
        if (productIds.includes(productId)) {
          set({ productIds: productIds.filter((id) => id !== productId) });
        } else {
          set({ productIds: [...productIds, productId] });
        }
      }
    }),
    {
      name: 'nestmart-wishlist',
      storage
    }
  )
);

export const selectWishlistCount = (state: WishlistState) => state.productIds.length;
