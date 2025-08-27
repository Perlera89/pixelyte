"use client";

import { useFeaturedProducts } from "@/hooks/use-products";
import { ProductCard } from "./product-card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState } from "react";

export function FeaturedProductsCarousel() {
  const { data: featuredProducts } = useFeaturedProducts();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  if (!featuredProducts || featuredProducts.length === 0) {
    return null;
  }

  const scroll = (direction: "left" | "right") => {
    if (!scrollContainerRef.current) return;

    const scrollAmount = 320; // Ancho aproximado de una tarjeta + gap
    const newScrollLeft =
      scrollContainerRef.current.scrollLeft +
      (direction === "left" ? -scrollAmount : scrollAmount);

    scrollContainerRef.current.scrollTo({
      left: newScrollLeft,
      behavior: "smooth",
    });
  };

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;

    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  return (
    <div className="relative">
      {/* Botones de navegación */}
      <div className="absolute -top-12 right-0 flex gap-2 z-10">
        <Button
          variant="outline"
          size="sm"
          onClick={() => scroll("left")}
          disabled={!canScrollLeft}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => scroll("right")}
          disabled={!canScrollRight}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Contenedor del carousel */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-6 overflow-x-auto scrollbar-hide pb-4"
        style={{
          scrollbarWidth: "none",
          msOverflowStyle: "none",
        }}
      >
        {featuredProducts.map((product) => (
          <div key={product.id} className="flex-none w-72">
            <ProductCard product={product} featured />
          </div>
        ))}
      </div>

      {/* Indicador de más productos */}
      {featuredProducts.length > 4 && (
        <div className="text-center mt-4">
          <p className="text-sm text-muted-foreground">
            {featuredProducts.length} productos destacados disponibles
          </p>
        </div>
      )}
    </div>
  );
}
