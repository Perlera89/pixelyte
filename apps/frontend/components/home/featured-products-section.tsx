"use client";

import { useFeaturedProducts } from "@/hooks/use-products";
import { FeaturedStats } from "./featured-stats";
import { FeaturedProductsDisplay } from "./featured-products-display";
import { FeaturedCategoriesSummary } from "./featured-categories-summary";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function FeaturedProductsSection() {
  const {
    data: featuredProducts,
    isLoading,
    error,
    refetch,
  } = useFeaturedProducts();

  if (isLoading) {
    return (
      <section className="space-y-8">
        <div className="text-center space-y-4">
          <Skeleton className="h-8 w-64 mx-auto" />
          <Skeleton className="h-4 w-96 mx-auto" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <Skeleton className="h-48 w-full rounded-lg" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-6 w-20" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
            <Star className="h-8 w-8 text-yellow-500" />
            Productos Destacados
          </h2>
        </div>
        <Alert variant="destructive" className="max-w-md mx-auto">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>Error al cargar los productos destacados.</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              className="ml-2"
            >
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      </section>
    );
  }

  if (!featuredProducts || featuredProducts.length === 0) {
    return (
      <section className="space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4 flex items-center justify-center gap-2">
            <Star className="h-8 w-8 text-yellow-500" />
            Productos Destacados
          </h2>
        </div>
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground text-lg">
            No hay productos destacados disponibles en este momento.
          </p>
          <p className="text-muted-foreground text-sm mt-2">
            ¡Vuelve pronto para ver nuestras mejores ofertas!
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold text-foreground flex items-center justify-center gap-2">
          <Star className="h-8 w-8 text-yellow-500" />
          Productos Destacados
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Descubre nuestra selección especial de productos más populares y mejor
          valorados
        </p>
      </div>

      <FeaturedStats />

      <FeaturedProductsDisplay />

      <FeaturedCategoriesSummary />

      {featuredProducts.length >= 8 && (
        <div className="text-center pt-4">
          <Button asChild variant="outline" size="lg">
            <Link href="/product">Ver Todos los Productos</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
