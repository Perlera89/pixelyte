"use client";

import Image from "next/image";
import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { useCartStore } from "@/lib/stores/cart-store";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, getTotalPrice } =
    useCartStore();

  const subtotal = getTotalPrice();
  const shipping = subtotal > 100 ? 0 : 15.99;
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <ShoppingBag className="h-20 w-20 text-muted-foreground mb-6" />
            <h1 className="text-2xl font-bold text-foreground mb-3">
              Tu carrito está vacío
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md">
              Parece que no has agregado ningún producto a tu carrito. ¡Explora
              nuestro catálogo y encuentra productos increíbles!
            </p>
            <Button size="lg" asChild>
              <Link href="/">Seguir Comprando</Link>
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
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground font-sans mb-2">
            Carrito de Compras
          </h1>
          <p className="text-muted-foreground">
            {items.length} producto{items.length !== 1 ? "s" : ""} en tu carrito
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Productos</CardTitle>
                <Button variant="outline" size="sm" onClick={clearCart}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Vaciar Carrito
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                {items.map((item) => {
                  const discountedPrice = item.product.discount
                    ? item.product.price * (1 - item.product.discount / 100)
                    : item.product.price;

                  return (
                    <div
                      key={item.product.id}
                      className="flex items-center space-x-4 p-4 border rounded-lg"
                    >
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <Image
                          src={item.product.image || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <Link href={`/producto/${item.product.id}`}>
                          <h3 className="font-semibold text-foreground hover:text-accent transition-colors line-clamp-1">
                            {item.product.name}
                          </h3>
                        </Link>
                        <p className="text-sm text-muted-foreground">
                          {item.product.brand}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          {item.product.discount ? (
                            <>
                              <span className="font-semibold text-foreground">
                                ${discountedPrice.toFixed(2)}
                              </span>
                              <span className="text-sm text-muted-foreground line-through">
                                ${item.product.price.toFixed(2)}
                              </span>
                            </>
                          ) : (
                            <span className="font-semibold text-foreground">
                              ${item.product.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateQuantity(item.product.id, item.quantity + 1)
                          }
                          disabled={item.quantity >= item.product.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-foreground">
                          ${(discountedPrice * item.quantity).toFixed(2)}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItem(item.product.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Resumen del Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Envío</span>
                  <span
                    className={cn(
                      "font-semibold",
                      shipping === 0 && "text-green-600"
                    )}
                  >
                    {shipping === 0 ? "Gratis" : `$${shipping.toFixed(2)}`}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Impuestos</span>
                  <span className="font-semibold">${tax.toFixed(2)}</span>
                </div>

                <Separator />

                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold">${total.toFixed(2)}</span>
                </div>

                {shipping > 0 && (
                  <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                    💡 Envío gratis en pedidos superiores a $100
                  </div>
                )}

                <Button size="lg" className="w-full" asChild>
                  <Link href="/checkout">Proceder al Checkout</Link>
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="w-full bg-transparent"
                  asChild
                >
                  <Link href="/">Seguir Comprando</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card>
              <CardContent className="p-4">
                <div className="text-center space-y-2">
                  <div className="text-sm font-semibold text-foreground">
                    Compra Segura
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Tus datos están protegidos con encriptación SSL de 256 bits
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
