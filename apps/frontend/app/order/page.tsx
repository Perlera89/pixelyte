"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Navbar } from "@/components/layout/navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronDown,
  ChevronUp,
  Package,
  Truck,
  CheckCircle,
  Clock,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { cn } from "@/lib/utils";

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

interface Order {
  id: string;
  date: string;
  total: number;
  status: "processing" | "shipped" | "delivered";
  items: OrderItem[];
  shippingAddress: string;
  trackingNumber?: string;
}

const mockOrders: Order[] = [
  {
    id: "ORD-12345",
    date: "2024-01-15",
    total: 1299.99,
    status: "delivered",
    items: [
      {
        id: "1",
        name: "iPhone 15 Pro",
        price: 1199.99,
        quantity: 1,
        image: "/iphone-15-pro.png",
      },
      {
        id: "16",
        name: "Anker PowerBank 20000mAh",
        price: 37.49,
        quantity: 1,
        image: "/placeholder-bp0dz.png",
      },
    ],
    shippingAddress: "Av. Reforma 123, Ciudad de México, CDMX 06600",
    trackingNumber: "TRK123456789",
  },
  {
    id: "ORD-12346",
    date: "2024-01-20",
    total: 2499.99,
    status: "shipped",
    items: [
      {
        id: "4",
        name: 'MacBook Pro 16"',
        price: 2499.99,
        quantity: 1,
        image: "/macbook-pro-16-inch.png",
      },
    ],
    shippingAddress: "Av. Reforma 123, Ciudad de México, CDMX 06600",
    trackingNumber: "TRK987654321",
  },
  {
    id: "ORD-12347",
    date: "2024-01-25",
    total: 649.98,
    status: "processing",
    items: [
      {
        id: "7",
        name: 'iPad Pro 12.9"',
        price: 1099.99,
        quantity: 1,
        image: "/ipad-pro-12-9-inch.png",
      },
    ],
    shippingAddress: "Av. Reforma 123, Ciudad de México, CDMX 06600",
  },
];

export default function OrdersPage() {
  const [expandedOrders, setExpandedOrders] = useState<Set<string>>(new Set());
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/pedidos");
    }
  }, [isAuthenticated, router]);

  const toggleOrderExpansion = (orderId: string) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  const getStatusIcon = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return <Clock className="h-4 w-4" />;
      case "shipped":
        return <Truck className="h-4 w-4" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "shipped":
        return "bg-blue-100 text-blue-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: Order["status"]) => {
    switch (status) {
      case "processing":
        return "Procesando";
      case "shipped":
        return "Enviado";
      case "delivered":
        return "Entregado";
      default:
        return "Desconocido";
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <h1 className="text-3xl font-bold text-foreground font-sans mb-4">
              Cargando...
            </h1>
          </div>
        </main>
      </div>
    );
  }

  if (mockOrders.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-16">
            <Package className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-foreground font-sans mb-4">
              No tienes pedidos aún
            </h1>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Cuando realices tu primera compra, aparecerá aquí con toda la
              información de seguimiento.
            </p>
            <Button size="lg" asChild>
              <a href="/">Explorar Productos</a>
            </Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground font-sans mb-2">
            Mis Pedidos
          </h1>
          <p className="text-muted-foreground">
            Historial y seguimiento de tus compras
          </p>
        </div>

        <div className="space-y-6">
          {mockOrders.map((order) => {
            const isExpanded = expandedOrders.has(order.id);

            return (
              <Card key={order.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer"
                  onClick={() => toggleOrderExpansion(order.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{order.id}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Pedido realizado el{" "}
                        {new Date(order.date).toLocaleDateString("es-ES", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge
                        className={cn(
                          "flex items-center space-x-1",
                          getStatusColor(order.status)
                        )}
                      >
                        {getStatusIcon(order.status)}
                        <span>{getStatusText(order.status)}</span>
                      </Badge>
                      <div className="text-right">
                        <p className="font-bold">${order.total.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.items.length} producto
                          {order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="h-5 w-5" />
                      ) : (
                        <ChevronDown className="h-5 w-5" />
                      )}
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <Separator className="mb-6" />

                    {/* Order Items */}
                    <div className="space-y-4 mb-6">
                      <h3 className="font-semibold">Productos</h3>
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center space-x-4"
                        >
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                            <Image
                              src={item.image || "/placeholder.svg"}
                              alt={item.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold line-clamp-1">
                              {item.name}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Cantidad: {item.quantity}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">
                              ${(item.price * item.quantity).toFixed(2)}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              ${item.price.toFixed(2)} c/u
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Shipping Info */}
                    <div className="space-y-4">
                      <h3 className="font-semibold">Información de Envío</h3>
                      <div className="bg-muted p-4 rounded-lg">
                        <p className="text-sm">
                          <span className="font-semibold">Dirección:</span>{" "}
                          {order.shippingAddress}
                        </p>
                        {order.trackingNumber && (
                          <p className="text-sm mt-2">
                            <span className="font-semibold">
                              Número de seguimiento:
                            </span>{" "}
                            {order.trackingNumber}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex space-x-4 mt-6">
                      {order.status === "delivered" && (
                        <Button variant="outline" size="sm">
                          Reordenar
                        </Button>
                      )}
                      {order.trackingNumber && (
                        <Button variant="outline" size="sm">
                          Rastrear Pedido
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        Ver Factura
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Continue Shopping */}
        <div className="mt-12 text-center">
          <Button size="lg" asChild>
            <a href="/">Seguir Comprando</a>
          </Button>
        </div>
      </main>
    </div>
  );
}
