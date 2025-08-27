import { useQuery } from "@tanstack/react-query";
import { categoriesApi } from "@/lib/api/categories";

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: categoriesApi.getAllCategories,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};
