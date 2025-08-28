"use client";

import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useHydration } from "@/lib/hooks/use-hydration";

export function StoreDebug() {
  const cartItems = useCartStore((state) => state.items);
  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItems = useWishlistStore((state) => state.items);
  const { isAuthenticated, user } = useAuthStore();
  const isHydrated = useHydration();

  if (!isHydrated) {
    return <div>Hidratando...</div>;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-background border rounded-lg p-4 shadow-lg max-w-sm">
      <h3 className="font-bold mb-2">Debug Stores</h3>
      <div className="space-y-1 text-sm">
        <div>
          Carrito: {cartItems.length} items ({totalItems} total)
        </div>
        <div>Wishlist: {wishlistItems.length} items</div>
        <div>Autenticado: {isAuthenticated ? "Sí" : "No"}</div>
        <div>Usuario: {user?.names || "N/A"}</div>
        <div>Hidratado: {isHydrated ? "Sí" : "No"}</div>
      </div>
    </div>
  );
}
