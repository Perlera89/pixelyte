import { api } from "@/routes/api";
import { CartItem } from "@/types";

export interface CartResponse {
  id: string;
  items: CartItem[];
  subtotal: number;
  total: number;
  itemCount: number;
}

export interface AddToCartDto {
  variantId: string;
  quantity: number;
}

export interface UpdateCartItemDto {
  quantity: number;
}

export interface SyncCartDto {
  items: Array<{
    variantId: string;
    quantity: number;
  }>;
}

export const cartApi = {
  getCart: async (): Promise<CartResponse> => {
    const response = await api.get("/cart");
    return response.data;
  },

  addItem: async (data: AddToCartDto): Promise<void> => {
    await api.post("/cart/items", data);
  },

  updateItem: async (
    itemId: string,
    data: UpdateCartItemDto
  ): Promise<void> => {
    await api.put(`/cart/items/${itemId}`, data);
  },

  removeItem: async (itemId: string): Promise<void> => {
    await api.delete(`/cart/items/${itemId}`);
  },

  clearCart: async (): Promise<void> => {
    await api.delete("/cart");
  },

  syncCart: async (data: SyncCartDto): Promise<CartResponse> => {
    const response = await api.post("/cart/sync", data);
    return response.data;
  },
};
