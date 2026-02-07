// ./store/useStore.ts
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "@/types/product";

export type CartItem = {
  productId: string;
  name: string;
  price: number;
  image: string;
  size: string;
  color: string;
  qty: number;
};

type AddToCartOpts = { size: string; color: string };

type StoreState = {
  // UI
  isCartOpen: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // cart
  cart: CartItem[];
  addToCart: (product: Product, opts: AddToCartOpts) => void;
  removeFromCart: (productId: string, size: string, color: string) => void;
  updateQty: (productId: string, size: string, color: string, nextQty: number) => void;
  clearCart: () => void;
};

function safeImage(product: Product, color: string) {
  const v =
    product.variants?.find((x) => x.colorName === color) ||
    product.variants?.[0];

  return v?.images?.[0] || product.images?.[0] || "";
}

export const useStore = create<StoreState>()(
  persist(
    (set, get) => ({
      // UI
      isCartOpen: false,
      toggleCart: () => set((s) => ({ isCartOpen: !s.isCartOpen })),
      openCart: () => set({ isCartOpen: true }),
      closeCart: () => set({ isCartOpen: false }),

      // cart
      cart: [],

      addToCart: (product, opts) => {
        const { size, color } = opts;
        if (!product?.id) return;

        // block locked products from cart
        if (product.locked) return;

        const key = `${product.id}__${size}__${color}`;
        const img = safeImage(product, color);

        const existing = get().cart.find(
          (i) => `${i.productId}__${i.size}__${i.color}` === key
        );

        if (existing) {
          set({
            cart: get().cart.map((i) =>
              `${i.productId}__${i.size}__${i.color}` === key
                ? { ...i, qty: i.qty + 1 }
                : i
            ),
          });
        } else {
          const item: CartItem = {
            productId: product.id,
            name: product.name,
            price: product.price,
            image: img,
            size,
            color,
            qty: 1,
          };
          set({ cart: [...get().cart, item] });
        }

        // open drawer after adding
        set({ isCartOpen: true });
      },

      removeFromCart: (productId, size, color) => {
        set({
          cart: get().cart.filter(
            (i) => !(i.productId === productId && i.size === size && i.color === color)
          ),
        });
      },

      updateQty: (productId, size, color, nextQty) => {
        const qty = Math.max(1, Number(nextQty || 1));
        set({
          cart: get().cart.map((i) =>
            i.productId === productId && i.size === size && i.color === color
              ? { ...i, qty }
              : i
          ),
        });
      },

      clearCart: () => set({ cart: [] }),
    }),
    {
      name: "cactusbear_store_v1",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ cart: s.cart }), // only persist cart
    }
  )
);
