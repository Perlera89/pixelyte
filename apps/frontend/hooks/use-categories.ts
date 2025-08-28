import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api/categories";

export const useCategories = (page = 1, limit = 50, searchQuery?: string) => {
  return useQuery({
    queryKey: ["categories", page, limit, searchQuery],
    queryFn: () => categoriesApi.getAllCategories(page, limit, searchQuery),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useCategory = (id: string) => {
  return useQuery({
    queryKey: ["categories", id],
    queryFn: () => categoriesApi.getCategory(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
