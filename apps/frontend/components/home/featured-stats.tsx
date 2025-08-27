"use client";

import { useFeaturedProducts } from "@/hooks/use-products";
import { Card, CardContent } from "@/components/ui/card";
import { Star, TrendingUp, Award, Zap } from "lucide-react";

export function FeaturedStats() {
  const { data: featuredProducts } = useFeaturedProducts();

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  // Calcular estadísticas básicas
  const totalProducts = featuredProducts.length;
  const avgPrice =
    featuredProducts.reduce((sum, product) => {
      return sum + parseFloat(product.basePrice);
    }, 0) / totalProducts;

  const categoriesCount = new Set(featuredProducts.map((p) => p.category.name))
    .size;
  const brandsCount = new Set(featuredProducts.map((p) => p.brand.name)).size;

  const stats = [
    {
      icon: Star,
      label: "Productos Destacados",
      value: totalProducts,
      color: "text-yellow-600",
      bgColor: "bg-yellow-50",
    },
    {
      icon: TrendingUp,
      label: "Precio Promedio",
      value: `$${avgPrice.toFixed(0)}`,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      icon: Award,
      label: "Categorías",
      value: categoriesCount,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      icon: Zap,
      label: "Marcas",
      value: brandsCount,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-lg font-bold text-foreground">
                    {stat.value}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
