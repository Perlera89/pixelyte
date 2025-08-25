"use client";

import { useState } from "react";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, ShoppingCart, Star, Minus, Plus } from "lucide-react";
import { getProductById, products } from "@/lib/data/products";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { ProductGrid } from "@/components/home/product-grid";
import { cn } from "@/lib/utils";

interface ProductPageProps {
  params: {
    id: string;
  };
}

export default function ProductPage({ params }: ProductPageProps) {
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState("description");

  const product = getProductById(params.id);
  const addToCart = useCartStore((state) => state.addItem);
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Producto no encontrado
            </h1>
          </div>
        </main>
      </div>
    );
  }

  const isWishlisted = isInWishlist(product.id);
  const discountedPrice = product.discount
    ? product.price * (1 - product.discount / 100)
    : product.price;

  // Get related products (same category, excluding current product)
  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
  };

  const incrementQuantity = () => {
    if (quantity < product.stock) {
      setQuantity(quantity + 1);
    }
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square relative rounded-lg overflow-hidden">
              <Image
                src={product.image || "/placeholder.svg"}
                alt={product.name}
                fill
                className="object-cover"
              />
              {product.discount && (
                <Badge className="absolute top-4 left-4 bg-destructive text-destructive-foreground">
                  -{product.discount}%
                </Badge>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-muted-foreground">{product.brand}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleWishlistToggle}
                >
                  <Heart
                    className={cn(
                      "h-5 w-5",
                      isWishlisted && "fill-current text-red-500"
                    )}
                  />
                </Button>
              </div>
              <h1 className="text-3xl font-bold text-foreground font-sans mb-4">
                {product.name}
              </h1>
              <div className="flex items-center space-x-2 mb-4">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={cn(
                        "h-4 w-4",
                        i < Math.floor(product.rating)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      )}
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">
                  ({product.rating})
                </span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                {product.discount ? (
                  <>
                    <span className="text-3xl font-bold text-foreground">
                      ${discountedPrice.toFixed(2)}
                    </span>
                    <span className="text-xl text-muted-foreground line-through">
                      ${product.price.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-3xl font-bold text-foreground">
                    ${product.price.toFixed(2)}
                  </span>
                )}
              </div>

              <div
                className={cn(
                  "inline-block px-3 py-1 rounded-full text-sm",
                  product.stock > 10
                    ? "bg-green-100 text-green-800"
                    : product.stock > 0
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                )}
              >
                {product.stock > 0 ? `${product.stock} disponibles` : "Agotado"}
              </div>
            </div>

            {product.stock > 0 && (
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="font-semibold">Cantidad:</span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={decrementQuantity}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-12 text-center">{quantity}</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={incrementQuantity}
                      disabled={quantity >= product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Button size="lg" className="w-full" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5 mr-2" />
                  Agregar al Carrito - $
                  {(discountedPrice * quantity).toFixed(2)}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Product Details Tabs */}
        <Card className="mb-12">
          <CardContent className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Descripción</TabsTrigger>
                <TabsTrigger value="specifications">
                  Especificaciones
                </TabsTrigger>
                <TabsTrigger value="reviews">Reseñas</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-6">
                <div className="prose max-w-none">
                  <p className="text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                  <p className="text-muted-foreground leading-relaxed mt-4">
                    Este producto de {product.brand} representa lo último en
                    tecnología y diseño. Perfecto para usuarios que buscan
                    calidad, rendimiento y confiabilidad en un solo dispositivo.
                  </p>
                </div>
              </TabsContent>
              <TabsContent value="specifications" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Marca:</span>
                      <span>{product.brand}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Categoría:</span>
                      <span className="capitalize">{product.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Calificación:</span>
                      <span>{product.rating}/5</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold">Stock:</span>
                      <span>{product.stock} unidades</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Garantía:</span>
                      <span>1 año</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold">Envío:</span>
                      <span>Gratis</span>
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="reviews" className="mt-6">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Las reseñas estarán disponibles próximamente.
                  </p>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <ProductGrid
            products={relatedProducts}
            title="Productos Relacionados"
          />
        )}
      </main>
    </div>
  );
}
