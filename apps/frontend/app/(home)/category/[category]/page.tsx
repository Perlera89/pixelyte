"use client";

import { useState, useMemo } from "react";
import { Navbar } from "@/components/layout/navbar";
import { ProductGrid } from "@/components/home/product-grid";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { getProductsByCategory, categories } from "@/lib/data/products";

type SortOption = "featured" | "price-low" | "price-high" | "rating" | "newest";

interface CategoryPageProps {
  params: {
    category: string;
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { category } = await Promise.resolve(params);
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [filters, setFilters] = useState({
    brand: "",
    inStock: false,
    onSale: false,
    rating: 0,
  });

  const categoryData = categories.find((cat) => cat.id === category);
  const allProducts = getProductsByCategory(category);

  // Get unique brands for this category
  const brands = Array.from(
    new Set(allProducts.map((product) => product.brand))
  );

  const filteredAndSortedProducts = useMemo(() => {
    const filtered = allProducts.filter((product) => {
      if (filters.brand && product.brand !== filters.brand) return false;
      if (filters.inStock && product.stock === 0) return false;
      if (filters.onSale && !product.discount) return false;
      if (filters.rating && product.rating < filters.rating) return false;
      return product.price >= priceRange[0] && product.price <= priceRange[1];
    });

    // Sort products
    switch (sortOption) {
      case "price-low":
        filtered.sort((a, b) => {
          const priceA = a.discount
            ? a.price * (1 - a.discount / 100)
            : a.price;
          const priceB = b.discount
            ? b.price * (1 - b.discount / 100)
            : b.price;
          return priceA - priceB;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const priceA = a.discount
            ? a.price * (1 - a.discount / 100)
            : a.price;
          const priceB = b.discount
            ? b.price * (1 - b.discount / 100)
            : b.price;
          return priceB - priceA;
        });
        break;
      case "rating":
        filtered.sort((a, b) => b.rating - a.rating);
        break;
      case "newest":
        filtered.sort((a, b) => Number.parseInt(b.id) - Number.parseInt(a.id));
        break;
      case "featured":
      default:
        filtered.sort((a, b) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return b.rating - a.rating;
        });
        break;
    }

    return filtered;
  }, [allProducts, filters, priceRange, sortOption]);

  const clearFilters = () => {
    setFilters({
      brand: "",
      inStock: false,
      onSale: false,
      rating: 0,
    });
    setPriceRange([0, 5000]);
    setSortOption("featured");
  };

  if (!categoryData) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Categoría no encontrada
            </h1>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground font-sans mb-2">
            {categoryData.name}
          </h1>
          <p className="text-muted-foreground">{categoryData.description}</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <div className="lg:w-64 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Filtros</CardTitle>
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  Limpiar Filtros
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-3">Rango de Precio</h3>
                  <Slider
                    value={priceRange}
                    onValueChange={(value) =>
                      setPriceRange(value as [number, number])
                    }
                    max={5000}
                    min={0}
                    step={50}
                    className="mb-2"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>${priceRange[0]}</span>
                    <span>${priceRange[1]}</span>
                  </div>
                </div>

                {/* Brand Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Marca</h3>
                  <Select
                    value={filters.brand}
                    onValueChange={(value) =>
                      setFilters({ ...filters, brand: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las marcas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all-brands">
                        Todas las marcas
                      </SelectItem>
                      {brands.map((brand) => (
                        <SelectItem key={brand} value={brand}>
                          {brand}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Stock Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) =>
                      setFilters({ ...filters, inStock: checked as boolean })
                    }
                  />
                  <label htmlFor="inStock" className="text-sm font-medium">
                    Solo productos en stock
                  </label>
                </div>

                {/* Sale Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="onSale"
                    checked={filters.onSale}
                    onCheckedChange={(checked) =>
                      setFilters({ ...filters, onSale: checked as boolean })
                    }
                  />
                  <label htmlFor="onSale" className="text-sm font-medium">
                    Solo productos en oferta
                  </label>
                </div>

                {/* Rating Filter */}
                <div>
                  <h3 className="font-semibold mb-3">Calificación mínima</h3>
                  <Select
                    value={filters.rating.toString()}
                    onValueChange={(value) =>
                      setFilters({
                        ...filters,
                        rating: Number.parseFloat(value),
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Cualquier calificación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any-rating">
                        Cualquier calificación
                      </SelectItem>
                      <SelectItem value="4">4+ estrellas</SelectItem>
                      <SelectItem value="4.5">4.5+ estrellas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex justify-between items-center mb-6">
              <p className="text-muted-foreground">
                {filteredAndSortedProducts.length} producto
                {filteredAndSortedProducts.length !== 1 ? "s" : ""} encontrado
                {filteredAndSortedProducts.length !== 1 ? "s" : ""}
              </p>
              <Select
                value={sortOption}
                onValueChange={(value) => setSortOption(value as SortOption)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="featured">Destacados</SelectItem>
                  <SelectItem value="price-low">
                    Precio: Menor a Mayor
                  </SelectItem>
                  <SelectItem value="price-high">
                    Precio: Mayor a Menor
                  </SelectItem>
                  <SelectItem value="rating">Mejor Calificados</SelectItem>
                  <SelectItem value="newest">Más Recientes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <ProductGrid products={filteredAndSortedProducts} />
          </div>
        </div>
      </main>
    </div>
  );
}
