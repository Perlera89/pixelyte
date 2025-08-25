import type { Product } from "@/lib/stores/cart-store"

export const products: Product[] = [
  // Smartphones
  {
    id: "1",
    name: "iPhone 15 Pro",
    price: 1199.99,
    image: "/iphone-15-pro.png",
    description: "El iPhone más avanzado con chip A17 Pro, cámara de 48MP y diseño en titanio.",
    category: "smartphones",
    brand: "Apple",
    stock: 15,
    rating: 4.8,
    featured: true,
  },
  {
    id: "2",
    name: "Samsung Galaxy S24 Ultra",
    price: 1299.99,
    image: "/samsung-galaxy-s24-ultra.png",
    description: "Smartphone premium con S Pen integrado, cámara de 200MP y pantalla Dynamic AMOLED.",
    category: "smartphones",
    brand: "Samsung",
    stock: 12,
    rating: 4.7,
    featured: true,
  },
  {
    id: "3",
    name: "Google Pixel 8 Pro",
    price: 999.99,
    image: "/google-pixel-8-pro.png",
    description: "Fotografía computacional avanzada con IA y Android puro.",
    category: "smartphones",
    brand: "Google",
    stock: 8,
    rating: 4.6,
    discount: 10,
  },

  // Laptops
  {
    id: "4",
    name: 'MacBook Pro 16"',
    price: 2499.99,
    image: "/macbook-pro-16-inch.png",
    description: "Laptop profesional con chip M3 Pro, pantalla Liquid Retina XDR y hasta 22 horas de batería.",
    category: "laptops",
    brand: "Apple",
    stock: 6,
    rating: 4.9,
    featured: true,
  },
  {
    id: "5",
    name: "Dell XPS 15",
    price: 1899.99,
    image: "/placeholder-891dh.png",
    description: "Laptop premium con procesador Intel Core i7, pantalla OLED 4K y diseño ultradelgado.",
    category: "laptops",
    brand: "Dell",
    stock: 10,
    rating: 4.5,
  },
  {
    id: "6",
    name: "ASUS ROG Strix G15",
    price: 1599.99,
    image: "/placeholder-4qghq.png",
    description: "Laptop gaming con AMD Ryzen 9, NVIDIA RTX 4070 y pantalla 165Hz.",
    category: "laptops",
    brand: "ASUS",
    stock: 7,
    rating: 4.4,
    discount: 15,
  },

  // Tablets
  {
    id: "7",
    name: 'iPad Pro 12.9"',
    price: 1099.99,
    image: "/ipad-pro-12-9-inch.png",
    description: "Tablet profesional con chip M2, pantalla Liquid Retina XDR y soporte para Apple Pencil.",
    category: "tablets",
    brand: "Apple",
    stock: 14,
    rating: 4.8,
    featured: true,
  },
  {
    id: "8",
    name: "Samsung Galaxy Tab S9+",
    price: 899.99,
    image: "/samsung-galaxy-tab-s9-plus.png",
    description: "Tablet Android premium con S Pen incluido y pantalla Super AMOLED.",
    category: "tablets",
    brand: "Samsung",
    stock: 9,
    rating: 4.6,
  },

  // Audio
  {
    id: "9",
    name: "AirPods Pro (2ª gen)",
    price: 249.99,
    image: "/placeholder-qmwat.png",
    description: "Auriculares inalámbricos con cancelación activa de ruido y audio espacial.",
    category: "audio",
    brand: "Apple",
    stock: 25,
    rating: 4.7,
    featured: true,
  },
  {
    id: "10",
    name: "Sony WH-1000XM5",
    price: 399.99,
    image: "/sony-wh-1000xm5.png",
    description: "Auriculares over-ear con la mejor cancelación de ruido del mercado.",
    category: "audio",
    brand: "Sony",
    stock: 18,
    rating: 4.8,
  },
  {
    id: "11",
    name: "Bose QuietComfort Earbuds",
    price: 279.99,
    image: "/placeholder-m3js9.png",
    description: "Auriculares inalámbricos con cancelación de ruido premium.",
    category: "audio",
    brand: "Bose",
    stock: 12,
    rating: 4.5,
    discount: 20,
  },

  // Gaming
  {
    id: "12",
    name: "PlayStation 5",
    price: 499.99,
    image: "/playstation-5-console.png",
    description: "Consola de videojuegos de nueva generación con SSD ultrarrápido y gráficos 4K.",
    category: "gaming",
    brand: "Sony",
    stock: 5,
    rating: 4.9,
    featured: true,
  },
  {
    id: "13",
    name: "Xbox Series X",
    price: 499.99,
    image: "/placeholder-6tbew.png",
    description: "La consola Xbox más potente con 4K nativo y 120fps.",
    category: "gaming",
    brand: "Microsoft",
    stock: 8,
    rating: 4.8,
  },
  {
    id: "14",
    name: "Nintendo Switch OLED",
    price: 349.99,
    image: "/placeholder-8e0ov.png",
    description: "Consola híbrida con pantalla OLED de 7 pulgadas y colores vibrantes.",
    category: "gaming",
    brand: "Nintendo",
    stock: 20,
    rating: 4.6,
  },

  // Accesorios
  {
    id: "15",
    name: "Apple Watch Series 9",
    price: 399.99,
    image: "/apple-watch-series-9.png",
    description: "Smartwatch con chip S9, pantalla Always-On y monitoreo avanzado de salud.",
    category: "accesorios",
    brand: "Apple",
    stock: 16,
    rating: 4.7,
  },
  {
    id: "16",
    name: "Anker PowerBank 20000mAh",
    price: 49.99,
    image: "/placeholder-bp0dz.png",
    description: "Batería portátil de alta capacidad con carga rápida USB-C.",
    category: "accesorios",
    brand: "Anker",
    stock: 30,
    rating: 4.4,
    discount: 25,
  },
]

export const categories = [
  {
    id: "smartphones",
    name: "Smartphones",
    description: "Los últimos smartphones con tecnología de punta",
    image: "/modern-smartphone-category.png",
  },
  {
    id: "laptops",
    name: "Laptops",
    description: "Laptops para trabajo, gaming y uso personal",
    image: "/modern-laptop-category.png",
  },
  {
    id: "tablets",
    name: "Tablets",
    description: "Tablets para productividad y entretenimiento",
    image: "/modern-tablet-category.png",
  },
  {
    id: "audio",
    name: "Audio",
    description: "Auriculares y dispositivos de audio premium",
    image: "/placeholder-2pcnm.png",
  },
  {
    id: "gaming",
    name: "Gaming",
    description: "Consolas y accesorios para gamers",
    image: "/gaming-console-category.png",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    description: "Accesorios y complementos tecnológicos",
    image: "/tech-accessories-category.png",
  },
]

// Helper functions
export function getProductById(id: string): Product | undefined {
  return products.find((product) => product.id === id)
}

export function getProductsByCategory(category: string): Product[] {
  return products.filter((product) => product.category === category)
}

export function getFeaturedProducts(): Product[] {
  return products.filter((product) => product.featured)
}

export function searchProducts(query: string): Product[] {
  const lowercaseQuery = query.toLowerCase()
  return products.filter(
    (product) =>
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description.toLowerCase().includes(lowercaseQuery) ||
      product.brand.toLowerCase().includes(lowercaseQuery),
  )
}
