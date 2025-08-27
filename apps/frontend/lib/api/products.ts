import { api } from "@/routes/api";
import { Product } from "@/types";

export interface ProductFilters {
  category?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  rating?: number;
  sortBy?: "price" | "name" | "rating" | "featured";
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
  search?: string;
}

export interface ProductsResponse {
  data: Product[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  filters?: {
    categories: Array<{ id: string; name: string; slug: string }>;
    brands: Array<{ id: string; name: string; slug: string }>;
    priceRange: { min: number; max: number };
  };
}

export const productsApi = {
  getProducts: async (
    filters: ProductFilters = {}
  ): Promise<ProductsResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `/products/get-all-products?${params.toString()}`
    );
    return response.data;
  },

  getFeaturedProducts: async (): Promise<Product[]> => {
    const response = await api.get("/products/featured");
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  getRelatedProducts: async (id: string): Promise<Product[]> => {
    const response = await api.get(`/products/${id}/related`);
    return response.data;
  },

  searchProducts: async (
    query: string,
    filters: Omit<ProductFilters, "search"> = {}
  ): Promise<ProductsResponse> => {
    const params = new URLSearchParams({ q: query });

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `/products/search-simple?${params.toString()}`
    );
    return response.data;
  },

  getProductsByCategory: async (
    categorySlug: string,
    filters: Omit<ProductFilters, "category"> = {}
  ): Promise<ProductsResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `/products/category/${categorySlug}?${params.toString()}`
    );
    return response.data;
  },

  getProductsByBrand: async (
    brandSlug: string,
    filters: Omit<ProductFilters, "brand"> = {}
  ): Promise<ProductsResponse> => {
    const params = new URLSearchParams();

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        params.append(key, value.toString());
      }
    });

    const response = await api.get(
      `/products/brand/${brandSlug}?${params.toString()}`
    );
    return response.data;
  },
};
