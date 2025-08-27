import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ordersApi, CreateOrderDto } from "@/lib/api/orders";
import { useErrorHandler } from "@/lib/api/error-handler";
import { toast } from "sonner";

export const useOrders = (page: number = 1, limit: number = 10) => {
  return useQuery({
    queryKey: ["orders", page, limit],
    queryFn: () => ordersApi.getOrders(page, limit),
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useOrder = (id: string) => {
  return useQuery({
    queryKey: ["orders", id],
    queryFn: () => ordersApi.getOrder(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useCreateOrder = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ordersApi.createOrder,
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data) => {
      // Invalidate orders list
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      // Clear cart after successful order
      queryClient.invalidateQueries({ queryKey: ["cart"] });

      toast.success("Orden creada exitosamente", {
        description: `Número de orden: ${data.orderNumber}`,
      });
    },
  });
};
