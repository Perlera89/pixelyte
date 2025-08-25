"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, DollarSign, Package, Users, ShoppingCart, Star, Calendar } from "lucide-react"

export default function ReportsPage() {
  const salesData = [
    { month: "Enero", sales: 45000, orders: 120, growth: 12 },
    { month: "Febrero", sales: 52000, orders: 135, growth: 15.5 },
    { month: "Marzo", sales: 48000, orders: 128, growth: -7.7 },
    { month: "Abril", sales: 61000, orders: 156, growth: 27.1 },
    { month: "Mayo", sales: 58000, orders: 149, growth: -4.9 },
    { month: "Junio", sales: 67000, orders: 172, growth: 15.5 },
  ]

  const topProducts = [
    { name: "iPhone 15 Pro", sales: 89, revenue: 89000 },
    { name: "MacBook Air M3", sales: 45, revenue: 67500 },
    { name: "Samsung Galaxy S24", sales: 67, revenue: 53600 },
    { name: "iPad Pro", sales: 34, revenue: 40800 },
    { name: "AirPods Pro", sales: 156, revenue: 39000 },
  ]

  const metrics = [
    {
      title: "Ventas Totales",
      value: "$331,000",
      change: "+12.5%",
      trend: "up",
      icon: DollarSign,
      color: "text-green-600",
    },
    {
      title: "Productos Vendidos",
      value: "1,247",
      change: "+8.2%",
      trend: "up",
      icon: Package,
      color: "text-blue-600",
    },
    {
      title: "Nuevos Usuarios",
      value: "89",
      change: "-2.1%",
      trend: "down",
      icon: Users,
      color: "text-purple-600",
    },
    {
      title: "Pedidos Completados",
      value: "860",
      change: "+15.3%",
      trend: "up",
      icon: ShoppingCart,
      color: "text-orange-600",
    },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Reportes y Análisis</h1>
        <p className="text-muted-foreground">Métricas y estadísticas del negocio</p>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {metrics.map((metric) => (
          <Card key={metric.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{metric.title}</p>
                  <p className="text-2xl font-bold">{metric.value}</p>
                  <div className="flex items-center mt-1">
                    {metric.trend === "up" ? (
                      <TrendingUp className="h-4 w-4 text-green-600 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-600 mr-1" />
                    )}
                    <span className={`text-sm ${metric.trend === "up" ? "text-green-600" : "text-red-600"}`}>
                      {metric.change}
                    </span>
                  </div>
                </div>
                <metric.icon className={`h-8 w-8 ${metric.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sales by Month */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Ventas por Mes
            </CardTitle>
            <CardDescription>Rendimiento mensual de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {salesData.map((data) => (
                <div key={data.month} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{data.month}</p>
                    <p className="text-sm text-muted-foreground">{data.orders} pedidos</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${data.sales.toLocaleString()}</p>
                    <div className="flex items-center">
                      {data.growth > 0 ? (
                        <TrendingUp className="h-3 w-3 text-green-600 mr-1" />
                      ) : (
                        <TrendingDown className="h-3 w-3 text-red-600 mr-1" />
                      )}
                      <span className={`text-xs ${data.growth > 0 ? "text-green-600" : "text-red-600"}`}>
                        {data.growth > 0 ? "+" : ""}
                        {data.growth}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Productos Más Vendidos
            </CardTitle>
            <CardDescription>Top 5 productos por ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={product.name} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                      {index + 1}
                    </Badge>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.sales} unidades</p>
                    </div>
                  </div>
                  <p className="font-medium">${product.revenue.toLocaleString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
