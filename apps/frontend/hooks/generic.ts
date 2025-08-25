import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export function useFetchData<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  enabled: boolean = true,
  staleTime: number = 1000 * 60 * 5
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime,
  });
}

export function useFindData<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  enabled: boolean = true,
  staleTime: number = 1000 * 60 * 15
) {
  return useQuery({
    queryKey,
    queryFn,
    enabled,
    staleTime,
  });
}

export function useSaveData<T, R = any>(
  mutationFn: (data: T) => Promise<R>,
  queryKey: string[],
  successMessage: string,
  errorMessage: string,
  navigation?: string
) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn,
    onSuccess: (data: R) => {
      queryClient.invalidateQueries({ queryKey });
      queryClient.refetchQueries({ queryKey });
      toast.success(successMessage);

      if (navigation) {
        router.push(navigation);
      } else {
        router.refresh();
      }

      return data;
    },
    onError: (error: unknown) => {
      toast.error(errorMessage);
    },
  });
}

export function useDeleteData<T>(
  mutationFn: (data: T) => Promise<void>,
  queryKey: string[],
  successMessage: string,
  errorMessage: string
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success(successMessage);
    },
    onError: (error: unknown) => {
      toast.error(errorMessage);
    },
  });
}

export function useInfinityData<T>(
  queryKey: string[],
  queryFn: (pageParams: { pageParam: number }) => Promise<T>,
  initialPageParam: number = 1,
  enabled: boolean = true
) {
  return useInfiniteQuery({
    queryKey,
    queryFn,
    initialPageParam,
    enabled,
    getNextPageParam: (lastPage, pages) => {
      const nextPage =
        Array.isArray(lastPage) && lastPage.length > 0
          ? pages.length + 1
          : undefined;
      return nextPage;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}
