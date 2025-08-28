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
import { Search, Loader2 } from "lucide-react";
import { productsApi, SearchProductsResponse } from "@/lib/api/products";
import { useCategories } from "@/hooks/use-categories";
import Link from "next/link";

type SortOption =
  | "relevance"
  | "price-low"
  | "price-high"
  | "rating"
  | "newest";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] =
    useState<SearchProductsResponse | null>(null);
  const [sortOption, setSortOption] = useState<SortOption>("relevance");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 5000]);
  const [filters, setFilters] = useState({
    category: "",
    brand: "",
    inStock: false,
    onSale: false,
  });
  const [error, setError] = useState<string | null>(null);

  // Get categories from API
  const { data: categoriesData } = useCategories();

  // Perform search
  useEffect(() => {
    const performSearch = async () => {
      if (!query.trim()) {
        setSearchResults(null);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const results = await productsApi.searchProducts(query, 1, 50); // Get more results for filtering
        setSearchResults(results);
      } catch (err) {
        console.error("Error searching products:", err);
        setError("Error al buscar productos. Por favor, intenta de nuevo.");
        setSearchResults(null);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [query]);

  // Get unique brands and categories from search results
  const availableBrands = searchResults
    ? Array.from(
        new Set(searchResults.data.map((product) => product.brand.name))
      )
    : [];
  const availableCategories = searchResults
    ? Array.from(
        new Set(searchResults.data.map((product) => product.category.id))
      )
    : [];

  const filteredAndSortedResults = useMemo(() => {
    if (!searchResults) return [];

    const filtered = searchResults.data.filter((product) => {
      const basePrice = parseFloat(product.basePrice);
      const compareAtPrice = parseFloat(product.compareAtPrice || "0");

      if (filters.category && product.category.id !== filters.category)
        return false;
      if (filters.brand && product.brand.name !== filters.brand) return false;
      if (filters.inStock && !product.isActive) return false;
      if (
        filters.onSale &&
        (!product.compareAtPrice || basePrice >= compareAtPrice)
      )
        return false;
      return basePrice >= priceRange[0] && basePrice <= priceRange[1];
    });

    // Sort results
    switch (sortOption) {
      case "price-low":
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.basePrice);
          const priceB = parseFloat(b.basePrice);
          return priceA - priceB;
        });
        break;
      case "price-high":
        filtered.sort((a, b) => {
          const priceA = parseFloat(a.basePrice);
          const priceB = parseFloat(b.basePrice);
          return priceB - priceA;
        });
        break;
      case "rating":
        filtered.sort((a, b) => {
          if (a.isFeatured && !b.isFeatured) return -1;
          if (!a.isFeatured && b.isFeatured) return 1;
          return 0;
        });
        break;
      case "newest":
        filtered.sort((a, b) => {
          const dateA = new Date(a.createdAt).getTime();
          const dateB = new Date(b.createdAt).getTime();
          return dateB - dateA;
        });
        break;
      case "relevance":
      default:
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
    });
    setPriceRange([0, 5000]);
    setSortOption("relevance");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        {query && (
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold text-foreground font-sans mb-2">
              Resultados para "{query}"
            </h1>
            {!isLoading && (
              <p className="text-muted-foreground">
                {filteredAndSortedResults.length} producto
                {filteredAndSortedResults.length !== 1 ? "s" : ""} encontrado
                {filteredAndSortedResults.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}

        {!query.trim() ? (
          <div className="text-center py-16">
            <Search className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground font-sans mb-4">
              ¿Qué estás buscando?
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              Usa la barra de búsqueda del menú para encontrar productos
              específicos, marcas o categorías.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 max-w-4xl mx-auto">
              {categoriesData?.data?.map((category) => (
                <Button key={category.id} variant="outline" asChild>
                  <Link href={`/category/${category.slug}`}>
                    {category.name}
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        ) : isLoading ? (
          <div className="text-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">Buscando productos...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <Search className="h-24 w-24 text-muted-foreground mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-foreground font-sans mb-4">
              Error en la búsqueda
            </h2>
            <p className="text-muted-foreground mb-8 max-w-md mx-auto">
              {error}
            </p>
            <Button onClick={() => window.location.reload()}>
              Intentar de nuevo
            </Button>
          </div>
        ) : !searchResults || searchResults.data.length === 0 ? (
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
                  <Link href="/search?q=smartphone">Smartphones</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/search?q=laptop">Laptops</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/search?q=apple">Apple</Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/search?q=gaming">Gaming</Link>
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
                          <SelectItem value="">Todas las categorías</SelectItem>
                          {availableCategories.map((categoryId) => (
                            <SelectItem key={categoryId} value={categoryId}>
                              {categoriesData?.data?.find(
                                (c) => c.id === categoryId
                              )?.name || categoryId}
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
                          <SelectItem value="">Todas las marcas</SelectItem>
                          {availableBrands.map((brandName) => (
                            <SelectItem key={brandName} value={brandName}>
                              {brandName}
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
                      Solo productos activos
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
                    <SelectItem value="rating">Destacados</SelectItem>
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
