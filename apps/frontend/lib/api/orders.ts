import { api } from "@/routes/api";
import { Order, ShippingData, PaymentData } from "@/types";

export interface CreateOrderDto {
  shippingAddress: ShippingData;
  billingAddress: ShippingData;
  paymentMethod: PaymentData;
}

export interface OrderResponse {
  id: string;
  orderNumber: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  subtotal: number;
  tax: number;
  shipping: number;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    productImage: string;
    quantity: number;
    price: number;
    total: number;
  }>;
  shippingAddress: ShippingData;
  billingAddress: ShippingData;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: OrderResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export const ordersApi = {
  createOrder: async (data: CreateOrderDto): Promise<OrderResponse> => {
    const response = await api.post("/orders", data);
    return response.data;
  },

  getOrders: async (
    page: number = 1,
    limit: number = 10
  ): Promise<OrdersResponse> => {
    const response = await api.get(`/orders?page=${page}&limit=${limit}`);
    return response.data;
  },

  getOrder: async (id: string): Promise<OrderResponse> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};
