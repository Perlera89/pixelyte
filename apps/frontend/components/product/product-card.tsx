"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserRole, type Product } from "@/types";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  featured?: boolean;
  viewMode?: "grid" | "list";
}

export function ProductCard({
  product,
  featured = false,
  viewMode = "grid",
}: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem);
  const {
    addItem: addToWishlist,
    removeItem: removeFromWishlist,
    isInWishlist,
  } = useWishlistStore();
  const { user } = useAuthStore();

  const isWishlisted = isInWishlist(product.id);
  const isAdmin = user?.role === UserRole.ADMIN;

  // Handle product pricing
  const basePrice = parseFloat(product.basePrice || "0");
  const comparePrice = parseFloat(product.compareAtPrice || "0");
  const hasDiscount = comparePrice > basePrice && comparePrice > 0;
  const discountPercentage =
    hasDiscount && comparePrice > 0
      ? Math.round(((comparePrice - basePrice) / comparePrice) * 100)
      : 0;

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id);
    } else {
      addToWishlist(product);
    }
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addToCart(product);
  };

  if (viewMode === "list") {
    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-card overflow-hidden">
        <div className="flex">
          {/* Image */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <Link href={`/product/${product.id}`}>
              <Image
                src={product.productImages?.[0]?.url || "/placeholder.svg"}
                alt={product.productImages?.[0]?.altText || product.name}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
              {hasDiscount && (
                <Badge
                  variant="destructive"
                  className="absolute top-3 left-3 text-xs font-medium"
                >
                  -{discountPercentage}%
                </Badge>
              )}
              {featured && (
                <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium mt-8">
                  Destacado
                </Badge>
              )}
            </Link>
          </div>

          {/* Content */}
          <div className="flex-1 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground font-medium uppercase tracking-wide">
                  {product.brand?.name || "Sin marca"}
                </span>
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span className="text-sm text-muted-foreground font-medium">
                    4.5
                  </span>
                </div>
              </div>

              <Link href={`/product/${product.id}`}>
                <h3 className="font-semibold text-lg leading-tight mb-2 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
              </Link>

              <p className="text-muted-foreground text-sm line-clamp-2 mb-4">
                {product.shortDescription}
              </p>

              <div className="flex items-center gap-2 mb-4">
                <Badge
                  variant={product.isActive ? "secondary" : "destructive"}
                  className="text-xs font-medium"
                >
                  {product.isActive ? "Disponible" : "No disponible"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {product.category?.name}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {hasDiscount ? (
                  <>
                    <span className="font-bold text-xl">
                      ${basePrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${comparePrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-xl">
                    ${basePrice.toFixed(2)}
                  </span>
                )}
              </div>

              {!isAdmin && (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "h-10 w-10 p-0",
                      isWishlisted && "text-red-500 hover:text-red-600"
                    )}
                    onClick={handleWishlistToggle}
                  >
                    <Heart
                      className={cn("h-5 w-5", isWishlisted && "fill-current")}
                    />
                  </Button>
                  <Button
                    onClick={handleAddToCart}
                    disabled={!product.isActive}
                    size="sm"
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    {!product.isActive ? "No disponible" : "Agregar"}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 border-0 bg-card overflow-hidden pt-0 pb-4",
        featured && "ring-1 ring-primary/20"
      )}
    >
      <div className="relative">
        <Link href={`/product/${product.id}`}>
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={product.productImages?.[0]?.url || "/placeholder.svg"}
              alt={product.productImages?.[0]?.altText || product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {hasDiscount && (
              <Badge
                variant="destructive"
                className="absolute top-3 left-3 text-xs font-medium"
              >
                -{discountPercentage}%
              </Badge>
            )}
            {featured && (
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium mt-8">
                Destacado
              </Badge>
            )}
          </div>
        </Link>

        {/* Botón de favoritos - Solo mostrar si NO es admin */}
        {!isAdmin && (
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "absolute top-3 right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/90 backdrop-blur-sm hover:bg-background",
              isWishlisted && "opacity-100 text-red-500 hover:text-red-600"
            )}
            onClick={handleWishlistToggle}
          >
            <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
          </Button>
        )}
      </div>

      <div className="p-3 space-y-2">
        <Link href={`/product/${product.id}`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                {product.brand?.name || "Sin marca"}
              </span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground font-medium">
                  4.5
                </span>
              </div>
            </div>

            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {hasDiscount ? (
                  <>
                    <span className="font-bold text-lg">
                      ${basePrice.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted-foreground line-through">
                      ${comparePrice.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="font-bold text-lg">
                    ${basePrice.toFixed(2)}
                  </span>
                )}
              </div>

              <Badge
                variant={product.isActive ? "secondary" : "destructive"}
                className="text-xs font-medium"
              >
                {product.isActive ? "Disponible" : "No disponible"}
              </Badge>
            </div>
          </div>
        </Link>

        {/* Botón de agregar al carrito - Solo mostrar si NO es admin */}
        {!isAdmin && (
          <Button
            className="w-full mt-2"
            onClick={handleAddToCart}
            disabled={!product.isActive}
            size="sm"
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            {!product.isActive ? "No disponible" : "Agregar al carrito"}
          </Button>
        )}
      </div>
    </Card>
  );
}
