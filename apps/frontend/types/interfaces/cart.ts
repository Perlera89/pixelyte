import { Product } from "@/types";

export interface CartItem {
  id?: string; // API cart item ID
  product: Product;
  quantity: number;
  price?: number; // Individual item price
  total?: number; // Item total (price * quantity)
}

export interface CartState {
  items: CartItem[];
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
}
