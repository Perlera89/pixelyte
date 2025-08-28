import { api } from "@/routes/api";
import { Category } from "@/types";

export interface CategoriesResponse {
  data: Category[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export const categoriesApi = {
  getAllCategories: async (
    page = 1,
    limit = 50,
    searchQuery?: string
  ): Promise<CategoriesResponse> => {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (searchQuery) {
      params.searchQuery = searchQuery;
    }

    const response = await api.get(`/products/get-all-categories`, {
      params,
    });
    return response.data;
  },

  getCategory: async (id: string): Promise<Category> => {
    const response = await api.get(`/products/find-category/${id}`);
    return response.data;
  },
};
