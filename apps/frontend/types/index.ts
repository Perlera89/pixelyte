export type { User, AuthState } from "./interfaces/auth";
export { UserRole } from "./enums/user";

export type { Product } from "./interfaces/product";
export type { CartItem, CartState } from "./interfaces/cart";
export type { Brand } from "./interfaces/brand";
export type { Category } from "./interfaces/category";
export type { WishlistState } from "./interfaces/wishlist";

// Order interfaces and enums
export type {
  Order,
  OrderItem,
  ShippingData,
  PaymentData,
} from "./interfaces/order";
export { OrderStatus } from "./enums/order";

export { CheckoutStep } from "./enums/checkout";

export { SortOption } from "./enums/sort";

export type {
  ChartConfig,
  ProductGridProps,
  ProductCardProps,
  AdminHeaderProps,
} from "./interfaces/ui";

export type CheckoutStepType =
  | "checkoutStep1"
  | "checkoutStep2"
  | "checkoutStep3";
export type SortOptionType = "ascending" | "descending";
export type OrderStatusType = "pending" | "shipped" | "delivered";
export type UserRoleType = "admin" | "user" | "guest";
