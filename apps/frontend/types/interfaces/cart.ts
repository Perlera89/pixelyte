import { Product } from "@/types";

export interface CartItemProduct {
  id: string;
  name: string;
  slug: string;
  image: string | null;
  brand: string | null;
}

export interface CartItemVariant {
  id: string;
  title: string;
  sku: string;
  inventoryQuantity: number;
  inventoryPolicy: string;
}

export interface CartItem {
  id?: string; // API cart item ID
  variantId?: string;
  product: CartItemProduct | Product; // Puede ser la versión simplificada del backend o la completa del frontend
  variant?: CartItemVariant;
  quantity: number;
  price?: number; // Individual item price
  total?: number; // Item total (price * quantity)
  properties?: any;
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
