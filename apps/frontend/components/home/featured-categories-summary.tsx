"use client";

import { useFeaturedProducts } from "@/hooks/use-products";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FeaturedCategoriesSummary() {
  const { data: featuredProducts } = useFeaturedProducts();

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  // Agrupar productos por categoría
  const categoryStats = featuredProducts.reduce(
    (acc, product) => {
      const categoryName = product.category.name;
      const categorySlug = product.category.slug;

      if (!acc[categoryName]) {
        acc[categoryName] = {
          name: categoryName,
          slug: categorySlug,
          count: 0,
          products: [],
          avgPrice: 0,
        };
      }

      acc[categoryName].count++;
      acc[categoryName].products.push(product);

      return acc;
    },
    {} as Record<
      string,
      {
        name: string;
        slug: string;
        count: number;
        products: any[];
        avgPrice: number;
      }
    >
  );

  // Calcular precio promedio y ordenar por cantidad
  const categories = Object.values(categoryStats)
    .map((category) => ({
      ...category,
      avgPrice:
        category.products.reduce((sum, p) => sum + parseFloat(p.basePrice), 0) /
        category.count,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 4); // Mostrar solo las top 4 categorías

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">
          Categorías Destacadas
        </h3>
        <Button asChild variant="ghost" size="sm">
          <Link href="/category">Ver todas</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categories.map((category) => (
          <Card
            key={category.slug}
            className="hover:shadow-md transition-shadow"
          >
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-foreground truncate">
                    {category.name}
                  </h4>
                  <Badge variant="secondary" className="text-xs">
                    {category.count}
                  </Badge>
                </div>

                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Precio promedio: ${category.avgPrice.toFixed(0)}
                  </p>

                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    <Link href={`/category/${category.slug}`}>
                      Ver productos
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
