"use client";

import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { Product } from "@/types";

const mockProduct: Product = {
  id: "test-product-1",
  name: "Producto de Prueba",
  slug: "producto-prueba",
  shortDescription: "Descripción corta",
  description: "Descripción completa",
  basePrice: "99.99",
  compareAtPrice: "129.99",
  isActive: true,
  status: "ACTIVE",
  createdAt: new Date(),
  updatedAt: new Date(),
  categoryId: "test-category",
  brandId: "test-brand",
  productImages: [
    {
      id: "test-image",
      url: "/placeholder.svg",
      altText: "Producto de prueba",
      productId: "test-product-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ],
  brand: {
    id: "test-brand",
    name: "Marca de Prueba",
    slug: "marca-prueba",
    description: "Descripción de la marca",
    logoUrl: null,
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  category: {
    id: "test-category",
    name: "Categoría de Prueba",
    slug: "categoria-prueba",
    description: "Descripción de la categoría",
    imageUrl: null,
    isActive: true,
    parentId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
};

export function TestButtons() {
  const { addItem: addToCart, clearCart } = useCartStore();
  const { addItem: addToWishlist, clearWishlist } = useWishlistStore();

  return (
    <div className="fixed bottom-20 right-4 bg-background border rounded-lg p-4 shadow-lg">
      <h3 className="font-bold mb-2">Pruebas</h3>
      <div className="space-y-2">
        <Button size="sm" onClick={() => addToCart(mockProduct)}>
          Agregar al Carrito
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => addToWishlist(mockProduct)}
        >
          Agregar a Wishlist
        </Button>
        <Button size="sm" variant="destructive" onClick={clearCart}>
          Limpiar Carrito
        </Button>
        <Button size="sm" variant="destructive" onClick={clearWishlist}>
          Limpiar Wishlist
        </Button>
      </div>
    </div>
  );
}
