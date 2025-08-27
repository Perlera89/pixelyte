import { useEffect } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";

/**
 * Hook to handle data synchronization when authentication state changes
 */
export const useAuthSync = () => {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const { fetchCart, syncWithServer: syncCart } = useCartStore();
  const { fetchWishlist, syncWithServer: syncWishlist } = useWishlistStore();

  useEffect(() => {
    // Only run after hydration is complete
    if (!isHydrated) return;

    if (isAuthenticated) {
      // User is authenticated, fetch server data and sync local data
      const syncData = async () => {
        try {
          // Fetch current server state
          await Promise.all([fetchCart(), fetchWishlist()]);

          // Then sync any local changes
          await Promise.all([syncCart(), syncWishlist()]);
        } catch (error) {
          console.error("Failed to sync data after authentication:", error);
        }
      };

      syncData();
    }
  }, [
    isAuthenticated,
    isHydrated,
    fetchCart,
    fetchWishlist,
    syncCart,
    syncWishlist,
  ]);

  return {
    isAuthenticated,
    isHydrated,
  };
};
