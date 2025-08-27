import { useQuery, useInfiniteQuery } from "@tanstack/react-query";
import { productsApi, ProductFilters } from "@/lib/api/products";

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsApi.getProducts(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useFeaturedProducts = () => {
  return useQuery({
    queryKey: ["products", "featured"],
    queryFn: productsApi.getFeaturedProducts,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useRelatedProducts = (id: string) => {
  return useQuery({
    queryKey: ["products", id, "related"],
    queryFn: () => productsApi.getRelatedProducts(id),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useSearchProducts = (
  query: string,
  filters: Omit<ProductFilters, "search"> = {}
) => {
  return useQuery({
    queryKey: ["products", "search", query, filters],
    queryFn: () => productsApi.searchProducts(query, filters),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useProductsByCategory = (
  categorySlug: string,
  filters: Omit<ProductFilters, "category"> = {}
) => {
  return useQuery({
    queryKey: ["products", "category", categorySlug, filters],
    queryFn: () => productsApi.getProductsByCategory(categorySlug, filters),
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useProductsByBrand = (
  brandSlug: string,
  filters: Omit<ProductFilters, "brand"> = {}
) => {
  return useQuery({
    queryKey: ["products", "brand", brandSlug, filters],
    queryFn: () => productsApi.getProductsByBrand(brandSlug, filters),
    enabled: !!brandSlug,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useInfiniteProducts = (filters: ProductFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", filters],
    queryFn: ({ pageParam = 1 }) =>
      productsApi.getProducts({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
