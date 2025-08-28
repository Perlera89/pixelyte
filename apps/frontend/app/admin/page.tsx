"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Package,
  Tag,
  Users,
  ShoppingCart,
  BarChart3,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { UserRole } from "@/types";
import { adminApi } from "@/lib/api";

type DashboardStats = {
  totalSales: number;
  totalOrders: number;
  totalProducts: number;
  totalUsers: number;
  monthlySales: number;
  monthlyOrders: number;
  lowStockProducts: number;
  pendingOrders: number;
  totalCategories: number;
};

export default function AdminPage() {
  const { user, isAuthenticated, isHydrated } = useAuthStore();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalSales: 0,
    totalOrders: 0,
    totalProducts: 0,
    totalUsers: 0,
    monthlySales: 0,
    monthlyOrders: 0,
    lowStockProducts: 0,
    pendingOrders: 0,
    totalCategories: 0,
  });

  const isAdmin = user?.role === UserRole.ADMIN;

  useEffect(() => {
    // Solo redirigir si el store ya está hidratado
    if (!isHydrated) return;

    if (!isAuthenticated || !isAdmin) {
      router.push("/login");
      return;
    }

    // Fetch dashboard metrics
    const fetchDashboardMetrics = async () => {
      try {
        const response = await adminApi.getDashboardMetrics();
        setStats({
          totalSales: response.totalSales || 0,
          totalOrders: response.totalOrders || 0,
          totalProducts: response.totalProducts || 0,
          totalUsers: response.totalUsers || 0,
          monthlySales: response.monthlySales || 0,
          monthlyOrders: response.monthlyOrders || 0,
          lowStockProducts: response.lowStockProducts || 0,
          pendingOrders: response.pendingOrders || 0,
          totalCategories: response.totalCategories || 0,
        });

        console.log(response);
      } catch (error) {
        console.error("Error fetching dashboard metrics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardMetrics();
  }, [isAuthenticated, isAdmin, router, isHydrated]);

  // Mostrar loading mientras se hidrata el store o se cargan los datos
  if (!isHydrated || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p>Cargando estadísticas...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !isAdmin) {
    return null;
  }

  const statsData = [
    {
      title: "Productos",
      value: stats.totalProducts + 11,
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Usuarios",
      value: stats.totalUsers + 3,
      icon: Users,
      color: "text-purple-600",
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 mb-8">
        {statsData.map((stat) => (
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
