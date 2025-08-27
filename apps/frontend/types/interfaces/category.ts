export interface Category {
  id: string;
  parentId: string | null;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  icon: string;
  sortOrder: number;
  isActive: boolean;
  seoTitle: string;
  seoDescription: string;
  createdAt: string;
  updatedAt: string;
  parent?: Category | null;
  children?: Category[];
  _count?: {
    products: number;
  };
}
