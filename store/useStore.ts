import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types/product";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  qty: number;
  size: string;
  color: string;
};

type StoreState = {
  cart: CartItem[];
  isCartOpen: boolean;

  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  addToCart: (p: Product, opts: { size: string; color: string; image?: string }) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, qty: number) => void;
  clearCart: () => void;
};

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      cart: [],
      isCartOpen: false,

      toggleCart: () => set({ isCartOpen: !get().isCartOpen }),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      addToCart: (p, opts) => {
        const size = (opts.size || "").trim();
        const color = (opts.color || "").trim();
        if (!size || !color) return;

        const image =
          opts.image ||
          p.variants?.find((v) => v.colorName === color)?.images?.[0] ||
          p.variants?.[0]?.images?.[0] ||
          p.images?.[0] ||
          "";

        const cart = [...get().cart];
        const idx = cart.findIndex(
          (i) => i.productId === p.id && i.size === size && i.color === color
        );

        if (idx >= 0) {
          cart[idx] = { ...cart[idx], qty: cart[idx].qty + 1 };
        } else {
          cart.push({
            productId: p.id,
            name: p.name,
            price: p.price,
            image,
            qty: 1,
            size,
            color,
          });
        }

        set({ cart, isCartOpen: true });
      },

      removeFromCart: (productId, size, color) => {
        const cart = get().cart.filter(
          (i) => !(i.productId === productId && i.size === size && i.color === color)
        );
        set({ cart });
      },

      updateQty: (productId, size, color, qty) => {
        const q = Math.max(1, Math.floor(qty || 1));
        const cart = get().cart.map((i) =>
          i.productId === productId && i.size === size && i.color === color
            ? { ...i, qty: q }
            : i
        );
        set({ cart });
      },

      clearCart: () => set({ cart: [] }),
    }),
    { name: "cactus-bear-cart" }
  )
);
