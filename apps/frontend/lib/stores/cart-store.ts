import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product, CartItem } from "@/types";
import { cartApi, AddToCartDto, SyncCartDto } from "@/lib/api/cart";
import { ApiErrorHandler } from "@/lib/api/error-handler";
import { offlineQueue } from "@/lib/utils/offline-queue";
import { toast } from "sonner";

interface CartState {
  // Data
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;

  // Loading states
  isLoading: boolean;
  isAddingItem: boolean;
  isUpdatingItem: boolean;
  isRemovingItem: boolean;
  isSyncing: boolean;

  // Error state
  error: string | null;

  // Actions
  addItem: (product: Product, quantity?: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  fetchCart: () => Promise<void>;

  // Local actions (for offline support)
  addItemLocally: (product: Product, quantity?: number) => void;
  removeItemLocally: (productId: string) => void;
  updateQuantityLocally: (productId: string, quantity: number) => void;
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
      itemCount: 0,
      isLoading: false,
      isAddingItem: false,
      isUpdatingItem: false,
      isRemovingItem: false,
      isSyncing: false,
      error: null,

      // API Actions
      addItem: async (product: Product, quantity: number = 1) => {
        set({ isAddingItem: true, error: null });

        try {
          const addToCartDto: AddToCartDto = {
            productId: product.id,
            quantity,
          };

          await cartApi.addItem(addToCartDto);
          await get().fetchCart(); // Refresh cart data
          toast.success("Producto agregado al carrito");
        } catch (error) {
          const apiError = ApiErrorHandler.handleError(error);
          set({ error: apiError.message });

          // Fallback to local storage if API fails
          get().addItemLocally(product, quantity);

          // Queue operation for when connection is restored
          offlineQueue.enqueue({
            type: "cart",
            action: "add",
            data: { productId: product.id, quantity },
          });

          toast.error(
            "Sin conexión. Producto guardado localmente y se sincronizará automáticamente."
          );
        } finally {
          set({ isAddingItem: false });
        }
      },

      removeItem: async (itemId: string) => {
        set({ isRemovingItem: true, error: null });

        try {
          await cartApi.removeItem(itemId);
          await get().fetchCart(); // Refresh cart data
          toast.success("Producto eliminado del carrito");
        } catch (error) {
          const apiError = ApiErrorHandler.handleError(error);
          set({ error: apiError.message });

          // Fallback to local removal
          get().removeItemLocally(itemId);

          // Queue operation for when connection is restored
          offlineQueue.enqueue({
            type: "cart",
            action: "remove",
            data: { itemId },
          });

          toast.error(
            "Sin conexión. Cambio guardado localmente y se sincronizará automáticamente."
          );
        } finally {
          set({ isRemovingItem: false });
        }
      },

      updateQuantity: async (itemId: string, quantity: number) => {
        if (quantity <= 0) {
          await get().removeItem(itemId);
          return;
        }

        set({ isUpdatingItem: true, error: null });

        try {
          await cartApi.updateItem(itemId, { quantity });
          await get().fetchCart(); // Refresh cart data
          toast.success("Cantidad actualizada");
        } catch (error) {
          const apiError = ApiErrorHandler.handleError(error);
          set({ error: apiError.message });

          // Fallback to local update
          get().updateQuantityLocally(itemId, quantity);

          // Queue operation for when connection is restored
          offlineQueue.enqueue({
            type: "cart",
            action: "update",
            data: { itemId, quantity },
          });

          toast.error(
            "Sin conexión. Cambio guardado localmente y se sincronizará automáticamente."
          );
        } finally {
          set({ isUpdatingItem: false });
        }
      },

      clearCart: async () => {
        set({ isLoading: true, error: null });

        try {
          await cartApi.clearCart();
          set({ items: [], subtotal: 0, total: 0, itemCount: 0 });
          toast.success("Carrito vaciado");
        } catch (error) {
          const apiError = ApiErrorHandler.handleError(error);
          set({ error: apiError.message });

          // Fallback to local clear
          get().clearCartLocally();
          toast.error("Error al vaciar carrito, vaciado localmente");
        } finally {
          set({ isLoading: false });
        }
      },

      fetchCart: async () => {
        set({ isLoading: true, error: null });

        try {
          const cartData = await cartApi.getCart();
          set({
            items: cartData.items,
            subtotal: cartData.subtotal,
            total: cartData.total,
            itemCount: cartData.itemCount,
          });
        } catch (error) {
          const apiError = ApiErrorHandler.handleError(error);
          set({ error: apiError.message });

          // Don't show toast for fetch errors, just log
          console.error("Failed to fetch cart:", apiError.message);
        } finally {
          set({ isLoading: false });
        }
      },

      syncWithServer: async () => {
        set({ isSyncing: true, error: null });

        try {
          const localItems = get().items;

          // Si no hay items locales, solo obtener del servidor
          if (localItems.length === 0) {
            await get().fetchCart();
            return;
          }

          const syncData: SyncCartDto = {
            items: localItems.map((item) => ({
              productId: item.product.id,
              quantity: item.quantity,
            })),
          };

          const cartData = await cartApi.syncCart(syncData);

          // Detectar cambios en cantidades (conflictos resueltos por el servidor)
          const conflicts: Array<{
            productId: string;
            localQuantity: number;
            serverQuantity: number;
          }> = [];

          localItems.forEach((localItem) => {
            const serverItem = cartData.items.find(
              (item: any) => item.product.id === localItem.product.id
            );

            if (serverItem && serverItem.quantity !== localItem.quantity) {
              conflicts.push({
                productId: localItem.product.id,
                localQuantity: localItem.quantity,
                serverQuantity: serverItem.quantity,
              });
            }
          });

          // Actualizar estado con datos del servidor
          set({
            items: cartData.items,
            subtotal: cartData.subtotal,
            total: cartData.total,
            itemCount: cartData.itemCount,
          });

          // Notificar sobre conflictos resueltos
          if (conflicts.length > 0) {
            console.log("Cart sync conflicts resolved:", conflicts);
            toast.success(
              `Carrito sincronizado. ${conflicts.length} conflictos resueltos automáticamente.`
            );
          } else {
            toast.success("Carrito sincronizado con el servidor");
          }
        } catch (error) {
          const apiError = ApiErrorHandler.handleError(error);
          set({ error: apiError.message });

          // En caso de error, mantener datos locales
          console.error(
            "Cart sync failed, keeping local data:",
            apiError.message
          );
          toast.error(
            "Error al sincronizar carrito, manteniendo datos locales"
          );
        } finally {
          set({ isSyncing: false });
        }
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
        const newItems = get().items;
        const newItemCount = newItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        const newTotal = get().getTotalPrice();
        set({ itemCount: newItemCount, total: newTotal, subtotal: newTotal });
      },

      removeItemLocally: (productId: string) => {
        const newItems = get().items.filter(
          (item) => item.product.id !== productId
        );
        const newItemCount = newItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        set({ items: newItems, itemCount: newItemCount });

        const newTotal = get().getTotalPrice();
        set({ total: newTotal, subtotal: newTotal });
      },

      updateQuantityLocally: (productId: string, quantity: number) => {
        if (quantity <= 0) {
          get().removeItemLocally(productId);
          return;
        }

        const newItems = get().items.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        );
        const newItemCount = newItems.reduce(
          (total, item) => total + item.quantity,
          0
        );
        set({ items: newItems, itemCount: newItemCount });

        const newTotal = get().getTotalPrice();
        set({ total: newTotal, subtotal: newTotal });
      },

      clearCartLocally: () => {
        set({ items: [], subtotal: 0, total: 0, itemCount: 0 });
      },

      // Computed values
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalPrice: () => {
        return get().items.reduce((total, item) => {
          const price = parseFloat(item.product.basePrice);
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
        itemCount: state.itemCount,
      }),
    }
  )
);
