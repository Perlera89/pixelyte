import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  wishlistApi,
  AddToWishlistDto,
  SyncWishlistDto,
} from "@/lib/api/wishlist";
import { useErrorHandler } from "@/lib/api/error-handler";
import { toast } from "sonner";

export const useWishlist = () => {
  return useQuery({
    queryKey: ["wishlist"],
    queryFn: wishlistApi.getWishlist,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      // Don't retry on 401 errors
      if (error?.response?.status === 401) return false;
      return failureCount < 3;
    },
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: wishlistApi.addItem,
    onMutate: async (newItem: AddToWishlistDto) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);

      // We can't do optimistic update without product data
      // So we'll just show loading state

      return { previousWishlist };
    },
    onError: (error, newItem, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      handleError(error);
    },
    onSuccess: () => {
      toast.success("Producto agregado a la lista de deseos");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

export const useRemoveFromWishlist = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: wishlistApi.removeItem,
    onMutate: async (productId: string) => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);

      queryClient.setQueryData(["wishlist"], (old: any) => {
        if (!old) return old;

        return {
          ...old,
          items: old.items.filter((item: any) => item.id !== productId),
        };
      });

      return { previousWishlist };
    },
    onError: (error, productId, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      handleError(error);
    },
    onSuccess: () => {
      toast.success("Producto eliminado de la lista de deseos");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

export const useClearWishlist = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: wishlistApi.clearWishlist,
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: ["wishlist"] });
      const previousWishlist = queryClient.getQueryData(["wishlist"]);

      queryClient.setQueryData(["wishlist"], (old: any) => {
        if (!old) return old;
        return {
          ...old,
          items: [],
        };
      });

      return { previousWishlist };
    },
    onError: (error, variables, context) => {
      if (context?.previousWishlist) {
        queryClient.setQueryData(["wishlist"], context.previousWishlist);
      }
      handleError(error);
    },
    onSuccess: () => {
      toast.success("Lista de deseos vaciada");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["wishlist"] });
    },
  });
};

export const useSyncWishlist = () => {
  const queryClient = useQueryClient();
  const { handleError } = useErrorHandler();

  return useMutation({
    mutationFn: wishlistApi.syncWishlist,
    onError: (error) => {
      handleError(error);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["wishlist"], data);
      toast.success("Lista de deseos sincronizada");
    },
  });
};
