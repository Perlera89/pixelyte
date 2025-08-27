"use client";

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Trash2, Star } from "lucide-react";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const addToCart = useCartStore((state) => state.addItem);

  const handleAddToCart = (product: any) => {
    addToCart(product);
    removeItem(product.id);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <Heart className="h-20 w-20 text-muted-foreground mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Tu lista de deseos está vacía
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              Guarda tus productos favoritos aquí para encontrarlos fácilmente
              más tarde. ¡Explora nuestro catálogo y agrega productos que te
              gusten!
            </p>
            <Button size="lg" asChild>
              <Link href="/">Explorar Productos</Link>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground font-sans mb-2">
              Lista de Deseos
            </h1>
            <p className="text-muted-foreground">
              {items.length} producto{items.length !== 1 ? "s" : ""} guardado
              {items.length !== 1 ? "s" : ""}
            </p>
          </div>
          {items.length > 0 && (
            <Button variant="outline" onClick={clearWishlist}>
              <Trash2 className="h-4 w-4 mr-2" />
              Limpiar Lista
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {items.map((product) => {
            const discountedPrice = product.discount
              ? product.price * (1 - product.discount / 100)
              : product.price;

            return (
              <Card
                key={product.id}
                className="group hover:shadow-lg transition-all duration-300"
              >
                <CardContent className="p-0">
                  <div className="relative">
                    <Link href={`/product/${product.id}`}>
                      <div className="aspect-square relative overflow-hidden rounded-t-lg">
                        <Image
                          src={product.image || "/placeholder.svg"}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {product.discount && (
                          <Badge className="absolute top-2 left-2 bg-destructive text-destructive-foreground">
                            -{product.discount}%
                          </Badge>
                        )}
                      </div>
                    </Link>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500"
                      onClick={() => removeItem(product.id)}
                    >
                      <Heart className="h-4 w-4 fill-current" />
                    </Button>
                  </div>

                  <div className="p-4">
                    <Link href={`/product/${product.id}`}>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">
                            {product.brand}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs text-muted-foreground">
                              {product.rating}
                            </span>
                          </div>
                        </div>

                        <h3 className="font-semibold text-card-foreground group-hover:text-accent transition-colors line-clamp-2">
                          {product.name}
                        </h3>

                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {product.discount ? (
                              <>
                                <span className="font-bold text-lg text-card-foreground">
                                  ${discountedPrice.toFixed(2)}
                                </span>
                                <span className="text-sm text-muted-foreground line-through">
                                  ${product.price.toFixed(2)}
                                </span>
                              </>
                            ) : (
                              <span className="font-bold text-lg text-card-foreground">
                                ${product.price.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <span
                            className={cn(
                              "text-xs px-2 py-1 rounded-full",
                              product.stock > 10
                                ? "bg-green-100 text-green-800"
                                : product.stock > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            )}
                          >
                            {product.stock > 0
                              ? `${product.stock} disponibles`
                              : "Agotado"}
                          </span>
                        </div>
                      </div>
                    </Link>

                    <div className="flex space-x-2 mt-4">
                      <Button
                        className="flex-1"
                        onClick={() => handleAddToCart(product)}
                        disabled={product.stock === 0}
                        size="sm"
                      >
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {product.stock === 0 ? "Agotado" : "Agregar"}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeItem(product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline" asChild>
            <Link href="/">Seguir Explorando</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
