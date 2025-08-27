"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { useCategories } from "@/hooks/use-categories";
import { Category } from "@/types";

export function FeaturedCategories() {
  const { data: categoriesResponse, isLoading, error } = useCategories();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground font-sans">
          Explora por Categorías
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="animate-pulse">
              <CardContent className="p-4 text-center">
                <div className="aspect-square relative mb-3 rounded-lg overflow-hidden bg-gray-200" />
                <div className="h-4 bg-gray-200 rounded mb-2" />
                <div className="h-3 bg-gray-200 rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !categoriesResponse?.data) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground font-sans">
          Explora por Categorías
        </h2>
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            Error al cargar las categorías. Por favor, intenta de nuevo.
          </p>
        </div>
      </div>
    );
  }

  const categories = categoriesResponse.data;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-foreground font-sans">
        Explora por Categorías
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {categories.map((category: Category) => (
          <Link key={category.id} href={`/category/${category.slug}`}>
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105">
              <CardContent className="p-4 text-center">
                <div className="aspect-square relative mb-3 rounded-lg overflow-hidden">
                  <Image
                    src={category.imageUrl || "/placeholder.svg"}
                    alt={category.name}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="font-semibold text-card-foreground group-hover:text-accent transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {category.description}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
