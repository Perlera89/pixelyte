import { api } from "@/routes/api";
import { Product } from "@/types";
import {
  CreateProductRequest,
  UpdateProductRequest,
  CreateProductResponse,
  UpdateProductResponse,
} from "@/types/interfaces/product";

export interface SearchProductsResponse {
  data: Product[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ProductFilters {
  search?: string;
  categoryId?: string;
  category?: string;
  brandId?: string;
  brand?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  onSale?: boolean;
  isFeatured?: boolean;
  rating?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  page?: number;
  limit?: number;
}

export const productsApi = {
  searchProducts: async (
    query: string,
    page = 1,
    limit = 12
  ): Promise<SearchProductsResponse> => {
    const response = await api.get(`/products/search-simple`, {
      params: {
        q: query,
        page,
        limit,
      },
    });
    return response.data;
  },

  searchProductsWithFilters: async (
    filters: ProductFilters
  ): Promise<SearchProductsResponse> => {
    const cleanFilters: Record<string, string> = {};

    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        cleanFilters[key] = value.toString();
      }
    });

    const response = await api.get(`/products/search`, {
      params: cleanFilters,
    });
    return response.data;
  },

  getFeaturedProducts: async (limit = 12): Promise<Product[]> => {
    const response = await api.get(`/products/featured`, {
      params: {
        limit: limit.toString(),
      },
    });
    return response.data;
  },

  getProductsByCategory: async (
    categorySlug: string,
    page = 1,
    limit = 12
  ): Promise<SearchProductsResponse> => {
    const response = await api.get(`/products/category/${categorySlug}`, {
      params: {
        page: page.toString(),
        limit: limit.toString(),
      },
    });
    return response.data;
  },

  getProduct: async (id: string): Promise<Product> => {
    const response = await api.get(`/products/find-product/${id}`);
    return response.data;
  },

  getRelatedProducts: async (id: string, limit = 8): Promise<Product[]> => {
    const response = await api.get(`/products/${id}/related`, {
      params: {
        limit: limit.toString(),
      },
    });
    return response.data;
  },

  getProducts: async (
    filters: ProductFilters
  ): Promise<SearchProductsResponse> => {
    return productsApi.searchProductsWithFilters(filters);
  },

  getProductsByBrand: async (
    brandSlug: string,
    filters: Omit<ProductFilters, "brand"> = {}
  ): Promise<SearchProductsResponse> => {
    return productsApi.searchProductsWithFilters({
      ...filters,
      brand: brandSlug,
    });
  },

  getAllProducts: async (
    page = 1,
    limit = 12,
    searchQuery?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ): Promise<SearchProductsResponse> => {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (searchQuery) {
      params.q = searchQuery;
    }
    if (sortBy) {
      params.sortBy = sortBy;
    }
    if (sortOrder) {
      params.sortOrder = sortOrder;
    }

    const response = await api.get(`/products/get-all-products`, {
      params,
    });
    return response.data;
  },

  createProduct: async (
    productData: CreateProductRequest
  ): Promise<CreateProductResponse> => {
    console.log("productData", productData);
    const response = await api.post(`/products/add-product`, productData);
    return response.data;
  },

  updateProduct: async (
    productData: UpdateProductRequest
  ): Promise<UpdateProductResponse> => {
    const { id, ...updateData } = productData;
    const response = await api.patch(
      `/products/update-product/${id}`,
      updateData
    );
    return response.data;
  },

  deleteProduct: async (
    id: string
  ): Promise<{ success: boolean; message?: string }> => {
    const response = await api.delete(`/products/delete-product/${id}`);
    return response.data;
  },
};

// Legacy exports for backward compatibility
export const productsAPI = productsApi;
