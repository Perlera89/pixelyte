"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Package, Tag, Users, ShoppingCart, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { UserRole } from "@/types";

export default function AdminPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const { items } = useCartStore();
  const router = useRouter();

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    // Solo redirigir si el store ya está hidratado
    if (!isHydrated) return;

    if (!isAuthenticated || !isAdmin) {
      router.push("/login");
    }
  }, [isAuthenticated, isAdmin, router, isHydrated]);

  // Mostrar loading mientras se hidrata el store
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const stats = [
    { title: "Productos", value: "16", icon: Package, color: "text-blue-600" },
    { title: "Categorías", value: "6", icon: Tag, color: "text-green-600" },
    { title: "Usuarios", value: "3", icon: Users, color: "text-purple-600" },
    {
      title: "Pedidos",
      value: "12",
      icon: ShoppingCart,
      color: "text-orange-600",
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Panel de Administración
            </h1>
            <p className="text-muted-foreground">Bienvenido, {user?.names}</p>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            Administrador
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Actividad Reciente</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Nuevo pedido recibido</p>
                <p className="text-sm text-muted-foreground">
                  Pedido #1234 por $299.99
                </p>
              </div>
              <Badge variant="outline">Hace 2 horas</Badge>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <div>
                <p className="font-medium">Producto agregado al inventario</p>
                <p className="text-sm text-muted-foreground">
                  iPhone 15 Pro - 10 unidades
                </p>
              </div>
              <Badge variant="outline">Hace 5 horas</Badge>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium">Usuario registrado</p>
                <p className="text-sm text-muted-foreground">
                  carlos@example.com
                </p>
              </div>
              <Badge variant="outline">Hace 1 día</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
