"use client";

import { useState } from "react";
import { useFeaturedProducts } from "@/hooks/use-products";
import { ProductGrid } from "./product-grid";
import { FeaturedProductsCarousel } from "./featured-products-carousel";
import { Button } from "@/components/ui/button";
import { Grid3X3, ArrowRight } from "lucide-react";

interface FeaturedProductsDisplayProps {
  defaultView?: "grid" | "carousel";
  showViewToggle?: boolean;
}

export function FeaturedProductsDisplay({
  defaultView = "grid",
  showViewToggle = true,
}: FeaturedProductsDisplayProps) {
  const { data: featuredProducts } = useFeaturedProducts();
  const [view, setView] = useState<"grid" | "carousel">(defaultView);

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  // Si hay pocos productos, siempre mostrar en grilla
  const shouldShowCarousel = featuredProducts.length > 6;

  return (
    <div className="space-y-6">
      {/* Toggle de vista */}
      {showViewToggle && shouldShowCarousel && (
        <div className="flex justify-between items-center">
          <div className="flex gap-2">
            <Button
              variant={view === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("grid")}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Grilla
            </Button>
            <Button
              variant={view === "carousel" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("carousel")}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Carousel
            </Button>
          </div>

          <div className="text-sm text-muted-foreground">
            {featuredProducts.length} productos destacados
          </div>
        </div>
      )}

      {/* Contenido */}
      {view === "grid" || !shouldShowCarousel ? (
        <ProductGrid products={featuredProducts} featured />
      ) : (
        <FeaturedProductsCarousel />
      )}
    </div>
  );
}
