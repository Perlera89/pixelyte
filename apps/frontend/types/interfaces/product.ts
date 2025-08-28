import { Brand, Category } from "@/types";

export interface Dimensions {
  length: number;
  width: number;
  height: number;
}

export interface ProductImage {
  id: string;
  productId: string;
  variantId: string | null;
  url: string;
  altText: string;
  position: number;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  slug: string;
  shortDescription: string;
  longDescription: string;
  brandId: string;
  categoryId: string;
  basePrice: string;
  compareAtPrice: string;
  costPrice: string;
  weight: string;
  dimensions: string | Dimensions;
  requiresShipping: boolean;
  isDigital: boolean;
  isFeatured: boolean;
  isActive: boolean;
  status: "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
  brand: Brand;
  category: Category;
  productImages: ProductImage[];
}

export interface ProductResponse {
  data: Product[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface CreateProductRequest {
  sku: string;
  name: string;
  slug: string;
  shortDescription?: string;
  longDescription?: string;
  brandId?: string;
  categoryId: string;
  basePrice: number;
  compareAtPrice?: number;
  costPrice?: number;
  weight?: number;
  dimensions?: string | Dimensions;
  requiresShipping?: boolean;
  isDigital?: boolean;
  isFeatured?: boolean;
  isActive?: boolean;
  status?: "ACTIVE" | "INACTIVE" | "DRAFT" | "ARCHIVED";
  seoTitle?: string;
  seoDescription?: string;
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {
  id: string;
}

export interface CreateProductResponse {
  success: boolean;
  data: Product;
  message?: string;
}

export interface UpdateProductResponse {
  success: boolean;
  data: Product;
  message?: string;
}
