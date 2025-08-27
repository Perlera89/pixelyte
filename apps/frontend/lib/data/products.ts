import { Product, Brand, Category } from "@/types";

// Helper function to create brand objects
const createBrand = (id: string, name: string): Brand => ({
  id,
  name,
  slug: id.toLowerCase(),
  description: `${name} - Tecnología innovadora`,
  logoUrl: `/brands/${id.toLowerCase()}-logo.png`,
  websiteUrl: `https://${id.toLowerCase()}.com`,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Helper function to create category objects
const createCategory = (
  id: string,
  name: string,
  sortOrder: number
): Category => ({
  id,
  parentId: null,
  name,
  slug: id,
  description: `${name} - Los mejores productos`,
  imageUrl: `/categories/${id}.png`,
  icon: id,
  sortOrder,
  isActive: true,
  seoTitle: name,
  seoDescription: `${name} - Los mejores productos`,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

// Brands
const brands = {
  apple: createBrand("apple", "Apple"),
  samsung: createBrand("samsung", "Samsung"),
  google: createBrand("google", "Google"),
  dell: createBrand("dell", "Dell"),
  asus: createBrand("asus", "ASUS"),
  sony: createBrand("sony", "Sony"),
  bose: createBrand("bose", "Bose"),
  microsoft: createBrand("microsoft", "Microsoft"),
  nintendo: createBrand("nintendo", "Nintendo"),
  anker: createBrand("anker", "Anker"),
};

// Categories
const categories = {
  smartphones: createCategory("smartphones", "Smartphones", 1),
  laptops: createCategory("laptops", "Laptops", 2),
  tablets: createCategory("tablets", "Tablets", 3),
  audio: createCategory("audio", "Audio", 4),
  gaming: createCategory("gaming", "Gaming", 5),
  accesorios: createCategory("accesorios", "Accesorios", 6),
};

export const products: Product[] = [
  // Smartphones
  {
    id: "1",
    sku: "IPHONE-15-PRO-001",
    name: "iPhone 15 Pro",
    slug: "iphone-15-pro",
    shortDescription: "El iPhone más avanzado con chip A17 Pro",
    longDescription:
      "El iPhone más avanzado con chip A17 Pro, cámara de 48MP y diseño en titanio.",
    brandId: "apple",
    categoryId: "smartphones",
    basePrice: "1199.99",
    compareAtPrice: "1299.99",
    costPrice: "800.00",
    weight: "187",
    dimensions: JSON.stringify({ length: 159.9, width: 76.7, height: 8.25 }),
    requiresShipping: true,
    isDigital: false,
    isFeatured: true,
    isActive: true,
    status: "ACTIVE" as const,
    seoTitle: "iPhone 15 Pro - Apple",
    seoDescription:
      "El iPhone más avanzado con chip A17 Pro, cámara de 48MP y diseño en titanio.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    brand: brands.apple,
    category: categories.smartphones,
    productImages: [
      {
        id: "img-1",
        productId: "1",
        variantId: null,
        url: "/iphone-15-pro.png",
        altText: "iPhone 15 Pro",
        position: 1,
        isPrimary: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "2",
    sku: "SAMSUNG-S24-ULTRA-001",
    name: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    shortDescription: "Smartphone premium con S Pen integrado",
    longDescription:
      "Smartphone premium con S Pen integrado, cámara de 200MP y pantalla Dynamic AMOLED.",
    brandId: "samsung",
    categoryId: "smartphones",
    basePrice: "1299.99",
    compareAtPrice: "1399.99",
    costPrice: "900.00",
    weight: "232",
    dimensions: JSON.stringify({ length: 162.3, width: 79.0, height: 8.6 }),
    requiresShipping: true,
    isDigital: false,
    isFeatured: true,
    isActive: true,
    status: "ACTIVE" as const,
    seoTitle: "Samsung Galaxy S24 Ultra",
    seoDescription:
      "Smartphone premium con S Pen integrado, cámara de 200MP y pantalla Dynamic AMOLED.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    brand: brands.samsung,
    category: categories.smartphones,
    productImages: [
      {
        id: "img-2",
        productId: "2",
        variantId: null,
        url: "/samsung-galaxy-s24-ultra.png",
        altText: "Samsung Galaxy S24 Ultra",
        position: 1,
        isPrimary: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
  {
    id: "3",
    sku: "PIXEL-8-PRO-001",
    name: "Google Pixel 8 Pro",
    slug: "google-pixel-8-pro",
    shortDescription: "Fotografía computacional avanzada con IA",
    longDescription: "Fotografía computacional avanzada con IA y Android puro.",
    brandId: "google",
    categoryId: "smartphones",
    basePrice: "999.99",
    compareAtPrice: "1099.99",
    costPrice: "700.00",
    weight: "210",
    dimensions: JSON.stringify({ length: 162.6, width: 76.5, height: 8.8 }),
    requiresShipping: true,
    isDigital: false,
    isFeatured: false,
    isActive: true,
    status: "ACTIVE" as const,
    seoTitle: "Google Pixel 8 Pro",
    seoDescription: "Fotografía computacional avanzada con IA y Android puro.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    brand: brands.google,
    category: categories.smartphones,
    productImages: [
      {
        id: "img-3",
        productId: "3",
        variantId: null,
        url: "/google-pixel-8-pro.png",
        altText: "Google Pixel 8 Pro",
        position: 1,
        isPrimary: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },

  // Laptops
  {
    id: "4",
    sku: "MACBOOK-PRO-16-001",
    name: 'MacBook Pro 16"',
    slug: "macbook-pro-16",
    shortDescription: "Laptop profesional con chip M3 Pro",
    longDescription:
      "Laptop profesional con chip M3 Pro, pantalla Liquid Retina XDR y hasta 22 horas de batería.",
    brandId: "apple",
    categoryId: "laptops",
    basePrice: "2499.99",
    compareAtPrice: "2699.99",
    costPrice: "1800.00",
    weight: "2100",
    dimensions: JSON.stringify({ length: 355.7, width: 248.1, height: 16.8 }),
    requiresShipping: true,
    isDigital: false,
    isFeatured: true,
    isActive: true,
    status: "ACTIVE" as const,
    seoTitle: 'MacBook Pro 16" - Apple',
    seoDescription:
      "Laptop profesional con chip M3 Pro, pantalla Liquid Retina XDR y hasta 22 horas de batería.",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    brand: brands.apple,
    category: categories.laptops,
    productImages: [
      {
        id: "img-4",
        productId: "4",
        variantId: null,
        url: "/macbook-pro-16-inch.png",
        altText: 'MacBook Pro 16"',
        position: 1,
        isPrimary: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ],
  },
];

export const categoriesList = Object.values(categories);
export { categories };

// Helper functions
export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id);
}

export function getProductsByCategory(categoryId: string): Product[] {
  return products.filter((product) => product.categoryId === categoryId);
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.isFeatured);
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase();
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.shortDescription.toLowerCase().includes(lowercaseQuery) ||
      product.longDescription.toLowerCase().includes(lowercaseQuery) ||
      product.brand.name.toLowerCase().includes(lowercaseQuery)
  );
}
