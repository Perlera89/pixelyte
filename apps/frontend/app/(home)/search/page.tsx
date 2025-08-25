"use client";

import type React from "react";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { searchProducts, categories } from "@/lib/data/products";
import type { Product } from "@/lib/stores/cart-store";

type SortOption =
  | "relevance"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(query);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    inStock: false,
    onSale: false,
    rating: 0,
  });

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setSearchResults([]);
        return;
      }

      setIsLoading(true);
      // Simulate search delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      const results = searchProducts(query);
      setSearchResults(results);
      setIsLoading(false);
    };

    performSearch();
  }, [query]);

  // Get unique brands and categories from search results
  const availableBrands = Array.from(
    new Set(searchResults.map((product) => product.brand))
  );
  const availableCategories = Array.from(
    new Set(searchResults.map((product) => product.category))
  );

  const filteredAndSortedResults = useMemo(() => {
    const filtered = searchResults.filter((product) => {
      if (filters.category && product.category !== filters.category)
        return false;
      if (filters.brand && product.brand !== filters.brand) return false;
      if (filters.inStock && product.stock === 0) return false;
      if (filters.onSale && !product.discount) return false;
      if (filters.rating && product.rating < filters.rating) return false;
      return product.price >= priceRange[0] && product.price <= priceRange[1];
    });

    // Sort results
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
      case "relevance":
      default:
        // Keep original search relevance order
        break;
    }

    return filtered;
  }, [searchResults, filters, priceRange, sortOption]);

  const clearFilters = () => {
    setFilters({
      category: "",
      brand: "",
      inStock: false,
      onSale: false,
      rating: 0,
    });
    setPriceRange([0, 5000]);
    setSortOption("relevance");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/buscar?q=${encodeURIComponent(searchQuery.trim())}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar productos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-12 text-lg h-12"
              />
              <Button
                type="submit"
                size="sm"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 p-0"
              >
                <Search className="h-4 w-4" />
              </Button>
            </div>
          </form>

          {query && (
            <div className="text-center">
              <h1 className="text-2xl font-bold text-foreground font-sans mb-2">
                Resultados para "{query}"
              </h1>
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-muted-foreground">Buscando...</span>
                </div>
              ) : (
                <p className="text-muted-foreground">
                  {filteredAndSortedResults.length} producto
                  {filteredAndSortedResults.length !== 1 ? "s" : ""} encontrado
                  {filteredAndSortedResults.length !== 1 ? "s" : ""}
                </p>
              )}
            </div>
          )}
        </div>

        {!query.trim() ? (
          <div className="text-center py-16">
            <Search className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground font-sans mb-4">
              ¿Qué estás buscando?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Usa la barra de búsqueda para encontrar productos específicos,
              marcas o categorías.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {categories.map((category) => (
                <Button key={category.id} variant="outline" asChild>
                  <a href={`/categoria/${category.id}`}>{category.name}</a>
                </Button>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Buscando productos...</p>
          </div>
        ) : searchResults.length === 0 ? (
          <div className="text-center py-16">
            <Search className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground font-sans mb-4">
              No se encontraron resultados
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              No encontramos productos que coincidan con tu búsqueda. Intenta
              con otros términos o explora nuestras categorías.
            </p>
            <div className="space-y-4">
              <h3 className="font-semibold">Sugerencias:</h3>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href="/buscar?q=smartphone">Smartphones</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/buscar?q=laptop">Laptops</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/buscar?q=apple">Apple</a>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <a href="/buscar?q=gaming">Gaming</a>
                </Button>
              </div>
            </div>
          </div>
        ) : (
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

                  {/* Category Filter */}
                  {availableCategories.length > 1 && (
                    <div>
                      <h3 className="font-semibold mb-3">Categoría</h3>
                      <Select
                        value={filters.category}
                        onValueChange={(value) =>
                          setFilters({ ...filters, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Todas las categorías" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">
                            Todas las categorías
                          </SelectItem>
                          {availableCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {categories.find((c) => c.id === category)
                                ?.name || category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Brand Filter */}
                  {availableBrands.length > 1 && (
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
                          <SelectItem value="all">Todas las marcas</SelectItem>
                          {availableBrands.map((brand) => (
                            <SelectItem key={brand} value={brand}>
                              {brand}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

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
                        <SelectItem value="0">
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

            {/* Results */}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-6">
                <p className="text-muted-foreground">
                  {filteredAndSortedResults.length} producto
                  {filteredAndSortedResults.length !== 1 ? "s" : ""} encontrado
                  {filteredAndSortedResults.length !== 1 ? "s" : ""}
                </p>
                <Select
                  value={sortOption}
                  onValueChange={(value) => setSortOption(value as SortOption)}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="relevance">Más Relevantes</SelectItem>
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

              <ProductGrid products={filteredAndSortedResults} />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
