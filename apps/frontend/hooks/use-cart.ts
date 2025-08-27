import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  cartApi,
  AddToCartDto,
  UpdateCartItemDto,
  SyncCartDto,
} from "@/lib/api/cart";
import { useErrorHandler } from "@/lib/api/error-handler";
import { toast } from "sonner";

export const useCart = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: cartApi.getCart,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: cartApi.addItem,
    onMutate: async (newItem: AddToCartDto) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["cart"] });

      // Snapshot the previous value
      const previousCart = queryClient.getQueryData(["cart"]);

      // Optimistically update to the new value
      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old;

        // Find if item already exists
        const existingItemIndex = old.items.findIndex(
          (item: any) => item.product.id === newItem.productId
        );

        if (existingItemIndex >= 0) {
          // Update existing item quantity
          const updatedItems = [...old.items];
          updatedItems[existingItemIndex] = {
            ...updatedItems[existingItemIndex],
            quantity:
              updatedItems[existingItemIndex].quantity + newItem.quantity,
          };

          return {
            ...old,
            items: updatedItems,
            itemCount: old.itemCount + newItem.quantity,
          };
        } else {
          // Add new item (we'd need product data for this, so skip optimistic update for new items)
          return old;
        }
      });

      return { previousCart };
    },
    onError: (error, newItem, context) => {
      // Revert the optimistic update
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      handleError(error);
    },
    onSuccess: () => {
      toast.success("Producto agregado al carrito");
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: UpdateCartItemDto;
    }) => cartApi.updateItem(itemId, data),
    onMutate: async ({ itemId, data }) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old;

        const updatedItems = old.items.map((item: any) =>
          item.id === itemId ? { ...item, quantity: data.quantity } : item
        );

        const newItemCount = updatedItems.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        );

        return {
          ...old,
          items: updatedItems,
          itemCount: newItemCount,
        };
      });

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      handleError(error);
    },
    onSuccess: () => {
      toast.success("Carrito actualizado");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useRemoveFromCart = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: cartApi.removeItem,
    onMutate: async (itemId: string) => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old;

        const updatedItems = old.items.filter(
          (item: any) => item.id !== itemId
        );
        const newItemCount = updatedItems.reduce(
          (sum: number, item: any) => sum + item.quantity,
          0
        );

        return {
          ...old,
          items: updatedItems,
          itemCount: newItemCount,
        };
      });

      return { previousCart };
    },
    onError: (error, itemId, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      handleError(error);
    },
    onSuccess: () => {
      toast.success("Producto eliminado del carrito");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: cartApi.clearCart,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["cart"] });
      const previousCart = queryClient.getQueryData(["cart"]);

      queryClient.setQueryData(["cart"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: [],
          itemCount: 0,
          subtotal: 0,
          total: 0,
        };
      });

      return { previousCart };
    },
    onError: (error, variables, context) => {
      if (context?.previousCart) {
        queryClient.setQueryData(["cart"], context.previousCart);
      }
      handleError(error);
    },
    onSuccess: () => {
      toast.success("Carrito vaciado");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["cart"] });
    },
  });
};

export const useSyncCart = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: cartApi.syncCart,
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["cart"], data);
      toast.success("Carrito sincronizado");
    },
  });
};
