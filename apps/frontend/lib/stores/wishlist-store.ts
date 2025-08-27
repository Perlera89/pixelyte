import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";
import { toast } from "sonner";

interface WishlistState {
  // Data
  items: Product[];

  // Loading states
  isLoading: boolean;
  isAddingItem: boolean;
  isRemovingItem: boolean;

  // Error state
  error: string | null;

  // Actions
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  clearWishlist: () => void;

  // Local actions (for offline support)
  addItemLocally: (product: Product) => void;
  removeItemLocally: (productId: string) => void;
  clearWishlistLocally: () => void;

  // Utility
  isInWishlist: (productId: string) => boolean;
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      isLoading: false,
      isAddingItem: false,
      isRemovingItem: false,
      error: null,

      // Local Actions
      addItem: (product: Product) => {
        // Check if already in wishlist
        if (get().isInWishlist(product.id)) {
          toast.info("El producto ya está en tu lista de deseos");
          return;
        }

        get().addItemLocally(product);
        toast.success("Producto agregado a la lista de deseos");
      },

      removeItem: (productId: string) => {
        get().removeItemLocally(productId);
        toast.success("Producto eliminado de la lista de deseos");
      },

      clearWishlist: () => {
        get().clearWishlistLocally();
        toast.success("Lista de deseos vaciada");
      },

      // Local actions (for offline support)
      addItemLocally: (product: Product) => {
        const items = get().items;
        const exists = items.find((item) => item.id === product.id);

        if (!exists) {
          set({ items: [...items, product] });
        }
      },

      removeItemLocally: (productId: string) => {
        set({ items: get().items.filter((item) => item.id !== productId) });
      },

      clearWishlistLocally: () => {
        set({ items: [] });
      },

      // Utility
      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId);
      },

      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "wishlist-storage",
      partialize: (state) => ({
        items: state.items,
      }),
    }
  )
);
