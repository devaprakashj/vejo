import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variantInfo?: string;
}

interface CartStore {
  isOpen: boolean;
  items: CartItem[];
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      isOpen: false,
      items: [],
      openCart: () => set({ isOpen: true }),
      closeCart: () => set({ isOpen: false }),
      addItem: (item) => set((state) => {
        const existing = state.items.find((i) => i.id === item.id);
        if (existing) {
          return {
            items: state.items.map((i) => 
              i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
            ),
            isOpen: true,
          };
        }
        return { items: [...state.items, item], isOpen: true };
      }),
      removeItem: (id) => set((state) => ({
        items: state.items.filter((i) => i.id !== id)
      })),
      updateQuantity: (id, quantity) => set((state) => ({
        items: state.items.map((i) => i.id === id ? { ...i, quantity } : i)
      })),
      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'vejo-cart-storage',
      // We explicitly exclude `isOpen` from persistence so the cart drawer 
      // doesn't automatically open on reload if it was open before.
      partialize: (state) => ({ items: state.items }),
    }
  )
);

export interface WishlistItem {
  id: string;
  name: string;
  price: number;
  image: string;
}

interface WishlistStore {
  items: WishlistItem[];
  toggleItem: (item: WishlistItem) => void;
  isInWishlist: (id: string) => boolean;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      toggleItem: (item) => set((state) => {
        const exists = state.items.some((i) => i.id === item.id);
        if (exists) {
          return { items: state.items.filter((i) => i.id !== item.id) };
        }
        return { items: [...state.items, item] };
      }),
      isInWishlist: (id) => get().items.some((i) => i.id === id),
    }),
    {
      name: 'vejo-wishlist-storage',
    }
  )
);

interface SearchStore {
  isOpen: boolean;
  openSearch: () => void;
  closeSearch: () => void;
}

export const useSearchStore = create<SearchStore>((set) => ({
  isOpen: false,
  openSearch: () => set({ isOpen: true }),
  closeSearch: () => set({ isOpen: false }),
}));

interface MobileMenuStore {
  isOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
}

export const useMobileMenuStore = create<MobileMenuStore>((set) => ({
  isOpen: false,
  openMenu: () => set({ isOpen: true }),
  closeMenu: () => set({ isOpen: false }),
}));
