import { useQuery } from "@tanstack/react-query";
import { brandsApi } from "@/lib/api/brands";

export const useBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: brandsApi.getAllBrands,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};
