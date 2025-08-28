import { api } from "@/routes/api";
import { Brand } from "@/types";

export interface BrandsResponse {
  data: Brand[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateBrandDto {
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  isActive?: boolean;
}

export const brandsApi = {
  getAllBrands: async (
    page = 1,
    limit = 50,
    searchQuery?: string
  ): Promise<BrandsResponse> => {
    const params: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };

    if (searchQuery) {
      params.searchQuery = searchQuery;
    }

    const response = await api.get(`/products/get-all-brands`, {
      params,
    });
    return response.data;
  },

  getBrand: async (id: string): Promise<Brand> => {
    const response = await api.get(`/products/find-brand/${id}`);
    return response.data;
  },

  addBrand: async (data: CreateBrandDto): Promise<Brand> => {
    const response = await api.post('/products/add-brand', data);
    return response.data;
  },
};
