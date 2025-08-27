import { api } from "@/routes/api";
import { Category } from "@/types";

export interface CategoriesResponse {
  data: Category[];
  success: boolean;
  message?: string;
}

export const categoriesApi = {
  getAllCategories: async (): Promise<CategoriesResponse> => {
    const response = await api.get("/products/get-all-categories");
    return response.data;
  },
};
