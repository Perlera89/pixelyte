"use client";

import { useState, useMemo, use, useEffect, useCallback } from "react";
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
import { useCategories } from "@/hooks/use-categories";
import { useProductsByCategory } from "@/hooks/use-products";
import { useBrands } from "@/hooks/use-brands";

type SortOption = "featured" | "price-low" | "price-high" | "rating" | "newest";

interface CategoryPageProps {
  params: Promise<{
    category: string;
  }>;
}

export default function CategoryPage({ params }: CategoryPageProps) {
  const { category } = use(params);

  // Verificar que category existe antes de hacer las llamadas a la API
  if (!category) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Categoría no válida
            </h1>
          </div>
        </main>
      </div>
    );
  }

  const { data: categoriesResponse } = useCategories();
  const { data: brandsResponse } = useBrands();
  const [sortOption, setSortOption] = useState<SortOption>("featured");
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 3000]);
  const [filters, setFilters] = useState({
    brand: "",
    inStock: false,
    onSale: false,
    rating: 0,
  });

  // Buscar la categoría por slug en los datos del API
  const categories = categoriesResponse?.data || [];
  const categoryData = categories.find((cat) => cat.slug === category);

  // Obtener productos por categoría usando la API (sin filtros para evitar recargas)
  const {
    data: productsResponse,
    isLoading: productsLoading,
    error: productsError,
  } = useProductsByCategory(category, 1, 50); // Obtener más productos para filtrar localmente

  // Obtener marcas disponibles
  const brands = brandsResponse?.data || [];

  // Los productos de la API (sin filtros aplicados)
  const allProducts = productsResponse?.data || [];

  // Calcular el rango de precios disponible de los productos
  const availablePriceRange = useMemo(() => {
    if (allProducts.length === 0) return { min: 0, max: 3000 };

    const prices = allProducts
      .map((product: any) => parseFloat(product.basePrice))
      .filter((price) => !isNaN(price) && price > 0);

    if (prices.length === 0) return { min: 0, max: 3000 };

    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [allProducts.length]); // Solo depender de la longitud para evitar recálculos innecesarios

  // Aplicar filtros y ordenamiento localmente para evitar recargas
  const filteredAndSortedProducts = useMemo(() => {
    if (allProducts.length === 0) {
      return [];
    }

    let result = [...allProducts];

    // Filtro de precio
    result = result.filter((product: any) => {
      const price = parseFloat(product.basePrice);
      return !isNaN(price) && price >= priceRange[0] && price <= priceRange[1];
    });

    // Filtro de marca
    if (filters.brand) {
      result = result.filter(
        (product: any) => product.brand?.slug === filters.brand
      );
    }

    // Filtro de productos activos
    if (filters.inStock) {
      result = result.filter((product: any) => product.isActive);
    }

    // Filtro de productos en oferta
    if (filters.onSale) {
      result = result.filter((product: any) => {
        return (
          product.compareAtPrice &&
          parseFloat(product.compareAtPrice) > parseFloat(product.basePrice)
        );
      });
    }

    // Filtro de productos destacados
    if (filters.rating > 0) {
      result = result.filter((product: any) => product.isFeatured);
    }

    // Aplicar ordenamiento
    switch (sortOption) {
      case "price-low":
        result.sort(
          (a: any, b: any) => parseFloat(a.basePrice) - parseFloat(b.basePrice)
        );
        break;
      case "price-high":
        result.sort(
          (a: any, b: any) => parseFloat(b.basePrice) - parseFloat(a.basePrice)
        );
        break;
      case "rating":
        result.sort(
          (a: any, b: any) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
        );
        break;
      case "newest":
        result.sort(
          (a: any, b: any) =>
            new Date(b.createdAt || 0).getTime() -
            new Date(a.createdAt || 0).getTime()
        );
        break;
      case "featured":
      default:
        result.sort(
          (a: any, b: any) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0)
        );
        break;
    }

    return result;
  }, [allProducts, priceRange, filters, sortOption]);

  // Inicializar el rango de precios una sola vez cuando se cargan los productos
  useEffect(() => {
    if (
      allProducts.length > 0 &&
      priceRange[0] === 0 &&
      priceRange[1] === 3000
    ) {
      const prices = allProducts
        .map((product: any) => parseFloat(product.basePrice))
        .filter((price) => !isNaN(price) && price > 0);

      if (prices.length > 0) {
        const min = Math.min(...prices);
        const max = Math.max(...prices);
        setPriceRange([min, max]);
      }
    }
  }, [allProducts.length]); // Solo ejecutar cuando cambie la cantidad de productos

  const clearFilters = useCallback(() => {
    setFilters({
      brand: "",
      inStock: false,
      onSale: false,
      rating: 0,
    });
    setPriceRange([0, 3000]); // Usar valores fijos para evitar dependencias
    setSortOption("featured");
  }, []); // Sin dependencias para evitar recreaciones

  // Estados de carga y error
  if (productsLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Cargando productos...
            </h1>
          </div>
        </main>
      </div>
    );
  }

  // Mostrar error si la API falla
  if (productsError) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Error al cargar productos
            </h1>
            <p className="text-muted-foreground mt-2">
              {(productsError as any)?.message ||
                "Ha ocurrido un error inesperado"}
            </p>
          </div>
        </main>
      </div>
    );
  }

  // Solo mostrar error si no encontramos la categoría en ningún lado
  const finalCategoryData =
    categoryData ||
    categoriesResponse?.data?.find((cat) => cat.slug === category);

  if (!finalCategoryData) {
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
            {finalCategoryData.name}
          </h1>
          <p className="text-muted-foreground">
            {finalCategoryData.description}
          </p>
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
                    max={availablePriceRange.max}
                    min={availablePriceRange.min}
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
                    value={filters.brand || "all-brands"}
                    onValueChange={(value) =>
                      setFilters((prev) => ({
                        ...prev,
                        brand: value === "all-brands" ? "" : value,
                      }))
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
                        <SelectItem key={brand.id} value={brand.slug}>
                          {brand.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Active Products Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="inStock"
                    checked={filters.inStock}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        inStock: checked as boolean,
                      }))
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
                      setFilters((prev) => ({
                        ...prev,
                        onSale: checked as boolean,
                      }))
                    }
                  />
                  <label htmlFor="onSale" className="text-sm font-medium">
                    Solo productos en oferta
                  </label>
                </div>

                {/* Featured Filter */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={filters.rating > 0}
                    onCheckedChange={(checked) =>
                      setFilters((prev) => ({
                        ...prev,
                        rating: checked ? 1 : 0,
                      }))
                    }
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Solo productos destacados
                  </label>
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
