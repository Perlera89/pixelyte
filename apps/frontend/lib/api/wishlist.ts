import { api } from "@/routes/api";
import { Product } from "@/types";

export interface WishlistResponse {
  id: string;
  items: Product[];
}

export interface AddToWishlistDto {
  productId: string;
}

export interface SyncWishlistDto {
  productIds: string[];
}

export const wishlistApi = {
  getWishlist: async (): Promise<WishlistResponse> => {
    const response = await api.get("/wishlist");
    return response.data;
  },

  addItem: async (data: AddToWishlistDto): Promise<void> => {
    await api.post("/wishlist/items", data);
  },

  removeItem: async (productId: string): Promise<void> => {
    await api.delete(`/wishlist/items/${productId}`);
  },

  clearWishlist: async (): Promise<void> => {
    await api.delete("/wishlist");
  },

  syncWishlist: async (data: SyncWishlistDto): Promise<WishlistResponse> => {
    const response = await api.post("/wishlist/sync", data);
    return response.data;
  },
};
