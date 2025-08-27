import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Product } from "@/types";
import {
  wishlistApi,
  AddToWishlistDto,
  SyncWishlistDto,
} from "@/lib/api/wishlist";
import { ApiErrorHandler } from "@/lib/api/error-handler";
import { offlineQueue } from "@/lib/utils/offline-queue";
import { toast } from "sonner";

interface WishlistState {
  // Data
  items: Product[];

  // Loading states
  isLoading: boolean;
  isAddingItem: boolean;
  isRemovingItem: boolean;
  isSyncing: boolean;

  // Error state
  error: string | null;

  // Actions
  addItem: (product: Product) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  clearWishlist: () => Promise<void>;
  syncWithServer: () => Promise<void>;
  fetchWishlist: () => Promise<void>;

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
      isSyncing: false,
      error: null,

      // API Actions
      addItem: async (product: Product) => {
        // Check if already in wishlist
        if (get().isInWishlist(product.id)) {
          toast.info("El producto ya está en tu lista de deseos");
          return;
        }

        set({ isAddingItem: true, error: null });

        try {
          const addToWishlistDto: AddToWishlistDto = {
            productId: product.id,
          };

          await wishlistApi.addItem(addToWishlistDto);
          await get().fetchWishlist(); // Refresh wishlist data
          toast.success("Producto agregado a la lista de deseos");
        } catch (error) {
          const apiError = ApiErrorHandler.handleError(error);
          set({ error: apiError.message });

          // Fallback to local storage if API fails
          get().addItemLocally(product);

          // Queue operation for when connection is restored
          offlineQueue.enqueue({
            type: "wishlist",
            action: "add",
            data: { productId: product.id },
          });

          toast.error(
            "Sin conexión. Producto guardado localmente y se sincronizará automáticamente."
          );
        } finally {
          set({ isAddingItem: false });
        }
      },

      removeItem: async (productId: string) => {
        set({ isRemovingItem: true, error: null });

        try {
          await wishlistApi.removeItem(productId);
          await get().fetchWishlist(); // Refresh wishlist data
          toast.success("Producto eliminado de la lista de deseos");
        } catch (error) {
          const apiError = ApiErrorHandler.handleError(error);
          set({ error: apiError.message });

          // Fallback to local removal
          get().removeItemLocally(productId);

          // Queue operation for when connection is restored
          offlineQueue.enqueue({
            type: "wishlist",
            action: "remove",
            data: { productId },
          });

          toast.error(
            "Sin conexión. Cambio guardado localmente y se sincronizará automáticamente."
          );
        } finally {
          set({ isRemovingItem: false });
        }
      },

      clearWishlist: async () => {
        set({ isLoading: true, error: null });

        try {
          await wishlistApi.clearWishlist();
          set({ items: [] });
          toast.success("Lista de deseos vaciada");
        } catch (error) {
          const apiError = ApiErrorHandler.handleError(error);
          set({ error: apiError.message });

          // Fallback to local clear
          get().clearWishlistLocally();
          toast.error("Error al vaciar lista, vaciada localmente");
        } finally {
          set({ isLoading: false });
        }
      },

      fetchWishlist: async () => {
        set({ isLoading: true, error: null });

        try {
          const wishlistData = await wishlistApi.getWishlist();
          set({ items: wishlistData.items });
        } catch (error) {
          const apiError = ApiErrorHandler.handleError(error);
          set({ error: apiError.message });

          // Don't show toast for fetch errors, just log
          console.error("Failed to fetch wishlist:", apiError.message);
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
            await get().fetchWishlist();
            return;
          }

          const syncData: SyncWishlistDto = {
            productIds: localItems.map((item) => item.id),
          };

          const wishlistData = await wishlistApi.syncWishlist(syncData);

          // Detectar items nuevos agregados desde el servidor
          const localIds = new Set(localItems.map((item) => item.id));
          const serverIds = new Set(
            wishlistData.items.map((item: any) => item.id)
          );

          const newFromServer = wishlistData.items.filter(
            (item: any) => !localIds.has(item.id)
          );
          const removedFromLocal = localItems.filter(
            (item) => !serverIds.has(item.id)
          );

          // Actualizar estado con datos del servidor
          set({ items: wishlistData.items });

          // Notificar sobre cambios
          let message = "Lista de deseos sincronizada";
          if (newFromServer.length > 0) {
            message += `. ${newFromServer.length} items agregados desde otro dispositivo`;
          }
          if (removedFromLocal.length > 0) {
            message += `. ${removedFromLocal.length} items ya no disponibles`;
          }

          toast.success(message);
        } catch (error) {
          const apiError = ApiErrorHandler.handleError(error);
          set({ error: apiError.message });

          // En caso de error, mantener datos locales
          console.error(
            "Wishlist sync failed, keeping local data:",
            apiError.message
          );
          toast.error(
            "Error al sincronizar lista de deseos, manteniendo datos locales"
          );
        } finally {
          set({ isSyncing: false });
        }
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
