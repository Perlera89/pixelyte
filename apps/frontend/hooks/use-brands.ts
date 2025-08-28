import { useQuery } from "@tanstack/react-query";
import { brandsApi } from "@/lib/api/brands";

export const useBrands = (page = 1, limit = 50, searchQuery?: string) => {
  return useQuery({
    queryKey: ["brands", page, limit, searchQuery],
    queryFn: () => brandsApi.getAllBrands(page, limit, searchQuery),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useBrand = (id: string) => {
  return useQuery({
    queryKey: ["brands", id],
    queryFn: () => brandsApi.getBrand(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
