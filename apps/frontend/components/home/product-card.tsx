"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Product } from "@/lib/stores/cart-store"
import { useCartStore } from "@/lib/stores/cart-store"
import { useWishlistStore } from "@/lib/stores/wishlist-store"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: Product
  featured?: boolean
}

export function ProductCard({ product, featured = false }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.addItem)
  const { addItem: addToWishlist, removeItem: removeFromWishlist, isInWishlist } = useWishlistStore()

  const isWishlisted = isInWishlist(product.id)
  const discountedPrice = product.discount ? product.price * (1 - product.discount / 100) : product.price

  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(product.id)
    } else {
      addToWishlist(product)
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    addToCart(product)
  }

  return (
    <Card
      className={cn(
        "group hover:shadow-lg transition-all duration-300 border-0 bg-card overflow-hidden",
        featured && "ring-1 ring-primary/20",
      )}
    >
      <div className="relative">
        <Link href={`/producto/${product.id}`}>
          <div className="aspect-square relative overflow-hidden">
            <Image
              src={product.image || "/placeholder.svg"}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {product.discount && (
              <Badge variant="destructive" className="absolute top-3 left-3 text-xs font-medium">
                -{product.discount}%
              </Badge>
            )}
            {featured && (
              <Badge className="absolute top-3 left-3 bg-primary text-primary-foreground text-xs font-medium mt-8">
                Destacado
              </Badge>
            )}
          </div>
        </Link>

        <Button
          variant="ghost"
          size="sm"
          className={cn(
            "absolute top-3 right-3 h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-all duration-200 bg-background/90 backdrop-blur-sm hover:bg-background",
            isWishlisted && "opacity-100 text-red-500 hover:text-red-600",
          )}
          onClick={handleWishlistToggle}
        >
          <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
        </Button>
      </div>

      <div className="p-3 space-y-2">
        <Link href={`/producto/${product.id}`}>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{product.brand}</span>
              <div className="flex items-center gap-1">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-muted-foreground font-medium">{product.rating}</span>
              </div>
            </div>

            <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {product.discount ? (
                  <>
                    <span className="font-bold text-lg">${discountedPrice.toFixed(2)}</span>
                    <span className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</span>
                  </>
                ) : (
                  <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                )}
              </div>

              <Badge
                variant={product.stock > 10 ? "secondary" : product.stock > 0 ? "outline" : "destructive"}
                className="text-xs font-medium"
              >
                {product.stock > 0 ? `Stock: ${product.stock}` : "Agotado"}
              </Badge>
            </div>
          </div>
        </Link>

        <Button className="w-full mt-2" onClick={handleAddToCart} disabled={product.stock === 0} size="sm">
          <ShoppingCart className="h-4 w-4 mr-2" />
          {product.stock === 0 ? "Agotado" : "Agregar al carrito"}
        </Button>
      </div>
    </Card>
  )
}
