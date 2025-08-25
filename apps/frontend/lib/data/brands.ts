import type { Brand, Category } from "@/types"

export const brands: Brand[] = [
  { id: "apple", name: "Apple", description: "Tecnología innovadora" },
  { id: "samsung", name: "Samsung", description: "Electrónicos de calidad" },
  { id: "sony", name: "Sony", description: "Audio y entretenimiento" },
  { id: "lg", name: "LG", description: "Electrodomésticos y tecnología" },
  { id: "hp", name: "HP", description: "Computadoras y impresoras" },
  { id: "dell", name: "Dell", description: "Soluciones tecnológicas" },
  { id: "nintendo", name: "Nintendo", description: "Consolas de videojuegos" },
  { id: "microsoft", name: "Microsoft", description: "Software y hardware" },
]

export const categories: Category[] = [
  { id: "smartphones", name: "Smartphones", description: "Teléfonos inteligentes" },
  { id: "laptops", name: "Laptops", description: "Computadoras portátiles" },
  { id: "tablets", name: "Tablets", description: "Tabletas digitales" },
  { id: "audio", name: "Audio", description: "Dispositivos de audio" },
  { id: "gaming", name: "Gaming", description: "Videojuegos y consolas" },
  { id: "accesorios", name: "Accesorios", description: "Accesorios tecnológicos" },
]
