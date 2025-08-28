import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "@/types";
import { toast } from "sonner";

interface CartState {
  // Data
  items: CartItem[];
  subtotal: number;
  total: number;

  // Loading states
  isLoading: boolean;
  isAddingItem: boolean;
  isUpdatingItem: boolean;
  isRemovingItem: boolean;

  // Error state
  error: string | null;

  // Actions
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;

  // Local actions (for offline support)
  addItemLocally: (product: Product, quantity?: number) => void;
  removeItemLocally: (itemIdOrProductId: string) => void;
  updateQuantityLocally: (itemIdOrProductId: string, quantity: number) => void;
  clearCartLocally: () => void;

  // Computed values
  getTotalItems: () => number;
  getTotalPrice: () => number;

  // Utility
  setError: (error: string | null) => void;
  clearError: () => void;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      // Initial state
      items: [],
      subtotal: 0,
      total: 0,
      isLoading: false,
      isAddingItem: false,
      isUpdatingItem: false,
      isRemovingItem: false,
      error: null,

      // Local Actions
      addItem: (product: Product, quantity: number = 1) => {
        get().addItemLocally(product, quantity);
        toast.success("Producto agregado al carrito");
      },

      removeItem: (itemId: string) => {
        get().removeItemLocally(itemId);
        toast.success("Producto eliminado del carrito");
      },

      updateQuantity: (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(itemId);
          return;
        }

        get().updateQuantityLocally(itemId, quantity);
        toast.success("Cantidad actualizada");
      },

      clearCart: () => {
        get().clearCartLocally();
        toast.success("Carrito vaciado");
      },

      // Local actions (for offline support)
      addItemLocally: (product: Product, quantity: number = 1) => {
        const items = get().items;
        const existingItem = items.find(
          (item) => item.product.id === product.id
        );

        if (existingItem) {
          set({
            items: items.map((item) =>
              item.product.id === product.id
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({ items: [...items, { product, quantity }] });
        }

        // Update computed values
        const newTotal = get().getTotalPrice();
        set({ total: newTotal, subtotal: newTotal });
      },

      removeItemLocally: (itemIdOrProductId: string) => {
        const newItems = get().items.filter(
          (item) =>
            item.id !== itemIdOrProductId &&
            item.product.id !== itemIdOrProductId
        );
        set({ items: newItems });

        const newTotal = get().getTotalPrice();
        set({ total: newTotal, subtotal: newTotal });
      },

      updateQuantityLocally: (itemIdOrProductId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItemLocally(itemIdOrProductId);
          return;
        }

        const newItems = get().items.map((item) =>
          item.id === itemIdOrProductId || item.product.id === itemIdOrProductId
            ? { ...item, quantity }
            : item
        );
        set({ items: newItems });

        const newTotal = get().getTotalPrice();
        set({ total: newTotal, subtotal: newTotal });
      },

      clearCartLocally: () => {
        set({ items: [], subtotal: 0, total: 0 });
      },

      // Computed values
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          // Usar el precio del item si viene del backend, sino usar basePrice del producto
          const price =
            item.price ||
            ("basePrice" in item.product
              ? parseFloat(item.product.basePrice || "0")
              : 0);
          return total + price * item.quantity;
        }, 0);
      },

      // Utility
      setError: (error: string | null) => set({ error }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "cart-storage",
      partialize: (state) => ({
        items: state.items,
        subtotal: state.subtotal,
        total: state.total,
      }),
    }
  )
);
