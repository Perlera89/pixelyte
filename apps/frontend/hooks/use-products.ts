import {
  useQuery,
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { productsApi, ProductFilters } from "@/lib/api/products";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/interfaces/product";
import { toast } from "sonner";

export const useProducts = (filters: ProductFilters = {}) => {
  return useQuery({
    queryKey: ["products", filters],
    queryFn: () => productsApi.getProducts(filters),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useAllProducts = (page = 1, limit = 10, searchQuery?: string) => {
  return useQuery({
    queryKey: ["products", "all", page, limit, searchQuery],
    queryFn: () => productsApi.getAllProducts(page, limit, searchQuery),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useFeaturedProducts = (limit = 12) => {
  return useQuery({
    queryKey: ["products", "featured", limit],
    queryFn: () => productsApi.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ["products", id],
    queryFn: () => productsApi.getProduct(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useRelatedProducts = (id: string, limit = 8) => {
  return useQuery({
    queryKey: ["products", id, "related", limit],
    queryFn: () => productsApi.getRelatedProducts(id, limit),
    enabled: !!id,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
};

export const useSearchProducts = (query: string, page = 1, limit = 12) => {
  return useQuery({
    queryKey: ["products", "search", query, page, limit],
    queryFn: () => productsApi.searchProducts(query, page, limit),
    enabled: !!query && query.length > 2,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  });
};

export const useProductsByCategory = (
  categorySlug: string,
  page = 1,
  limit = 12
) => {
  return useQuery({
    queryKey: ["products", "category", categorySlug, page, limit],
    queryFn: () => productsApi.getProductsByCategory(categorySlug, page, limit),
    enabled: !!categorySlug,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
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
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useInfiniteProducts = (filters: ProductFilters = {}) => {
  return useInfiniteQuery({
    queryKey: ["products", "infinite", filters],
    queryFn: ({ pageParam = 1 }) =>
      productsApi.getProducts({ ...filters, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) =>
      lastPage.hasNextPage ? lastPage.page + 1 : undefined,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Mutation hooks for creating, updating, and deleting products
export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: CreateProductRequest) =>
      productsApi.createProduct(productData),
    onSuccess: (data) => {
      // Invalidate and refetch products queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(data.message || "Producto creado exitosamente");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al crear el producto";
      toast.error(errorMessage);
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData: UpdateProductRequest) =>
      productsApi.updateProduct(productData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch products queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      // Update the specific product in cache
      queryClient.invalidateQueries({ queryKey: ["products", variables.id] });
      toast.success(data.message || "Producto actualizado exitosamente");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al actualizar el producto";
      toast.error(errorMessage);
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => productsApi.deleteProduct(id),
    onSuccess: (data) => {
      // Invalidate and refetch products queries
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success(data.message || "Producto eliminado exitosamente");
    },
    onError: (error: any) => {
      const errorMessage =
        error?.response?.data?.message || "Error al eliminar el producto";
      toast.error(errorMessage);
    },
  });
};
