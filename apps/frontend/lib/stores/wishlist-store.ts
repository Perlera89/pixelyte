import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product, WishlistState } from "@/types"

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        const items = get().items
        const exists = items.find((item) => item.id === product.id)

        if (!exists) {
          set({ items: [...items, product] })
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((item) => item.id !== productId) })
      },

      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.id === productId)
      },

      clearWishlist: () => {
        set({ items: [] })
      },
    }),
    {
      name: "wishlist-storage",
    },
  ),
)
