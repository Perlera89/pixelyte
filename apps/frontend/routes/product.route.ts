import { api } from "./api";

export const productApi = {
  getAllProducts: async () => {
    const response = await api.get("/products/get-all-products");
    return response.data;
  },

  findProductById: async (id: string) => {
    const response = await api.get(`/products/find-product/${id}`);
    return response.data;
  },

  findProductsByBrandId: async (brandName: string) => {
    const response = await api.get(
      `/products/find-products-by-brand-id/${brandName}`
    );
    return response.data;
  },

  findProductsByCategoryId: async (categoryName: string) => {
    const response = await api.get(
      `/products/find-products-by-category-id/${categoryName}`
    );
    return response.data;
  },
};
