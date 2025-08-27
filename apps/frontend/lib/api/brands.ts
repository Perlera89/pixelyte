import { api } from "@/routes/api";
import { Brand } from "@/types";

export interface BrandsResponse {
  data: Brand[];
  success: boolean;
  message?: string;
}

export const brandsApi = {
  getAllBrands: async (): Promise<BrandsResponse> => {
    const response = await api.get("/products/get-all-brands");
    return response.data;
  },
};
