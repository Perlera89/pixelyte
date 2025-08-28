export interface Brand {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logoUrl: string;
  websiteUrl: string;
  isActive: boolean;
  productsCount?: number;
  createdAt: string;
  updatedAt: string;
}
