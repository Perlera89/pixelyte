import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { Product, CartState } from "@/types"

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product: Product) => {
        const items = get().items
        const existingItem = items.find((item) => item.product.id === product.id)

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item,
            ),
          })
        } else {
          set({ items: [...items, { product, quantity: 1 }] })
        }
      },

      removeItem: (productId: string) => {
        set({ items: get().items.filter((item) => item.product.id !== productId) })
      },

      updateQuantity: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId)
          return
        }

        set({
          items: get().items.map((item) => (item.product.id === productId ? { ...item, quantity } : item)),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = item.product.discount
            ? item.product.price * (1 - item.product.discount / 100)
            : item.product.price
          return total + price * item.quantity
        }, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)
