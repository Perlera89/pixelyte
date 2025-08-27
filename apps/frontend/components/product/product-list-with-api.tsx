"use client";

import { useState } from "react";
import { useProducts } from "@/hooks/use-products";
import { useAddToCart } from "@/hooks/use-cart";
import { useAddToWishlist } from "@/hooks/use-wishlist";
import { LoadingState, LoadingSpinner } from "@/components/ui/loading-spinner";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { Product } from "@/types";
import { ProductFilters } from "@/lib/api";

interface ProductListProps {
  initialFilters?: ProductFilters;
  showFilters?: boolean;
}

export function ProductListWithApi({
  initialFilters = {},
  showFilters = true,
}: ProductListProps) {
  const [filters, setFilters] = useState<ProductFilters>(initialFilters);

  // API hooks
  const {
    data: productsData,
    isLoading,
    error,
    refetch,
  } = useProducts(filters);
  const addToCartMutation = useAddToCart();
  const addToWishlistMutation = useAddToWishlist();

  const handleAddToCart = async (product: Product) => {
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity: 1,
      });
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Failed to add to cart:", error);
    }
  };

  const handleAddToWishlist = async (product: Product) => {
    try {
      await addToWishlistMutation.mutateAsync({
        productId: product.id,
      });
    } catch (error) {
      // Error is handled by the mutation hook
      console.error("Failed to add to wishlist:", error);
    }
  };

  const handleFilterChange = (newFilters: Partial<ProductFilters>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
  };

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">Error al cargar productos</p>
        <Button onClick={() => refetch()}>Reintentar</Button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        {/* Filters */}
        {showFilters && (
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <h3 className="font-semibold mb-4">Filtros</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Categoría
                </label>
                <select
                  value={filters.category || ""}
                  onChange={(e) =>
                    handleFilterChange({
                      category: e.target.value || undefined,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Todas las categorías</option>
                  <option value="electronics">Electrónicos</option>
                  <option value="clothing">Ropa</option>
                  <option value="books">Libros</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Precio mínimo
                </label>
                <input
                  type="number"
                  value={filters.minPrice || ""}
                  onChange={(e) =>
                    handleFilterChange({
                      minPrice: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Precio máximo
                </label>
                <input
                  type="number"
                  value={filters.maxPrice || ""}
                  onChange={(e) =>
                    handleFilterChange({
                      maxPrice: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                  placeholder="1000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Ordenar por
                </label>
                <select
                  value={filters.sortBy || ""}
                  onChange={(e) =>
                    handleFilterChange({
                      sortBy:
                        (e.target.value as ProductFilters["sortBy"]) ||
                        undefined,
                    })
                  }
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Relevancia</option>
                  <option value="price">Precio</option>
                  <option value="name">Nombre</option>
                  <option value="rating">Calificación</option>
                  <option value="featured">Destacados</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Products Grid */}
        <LoadingState isLoading={isLoading}>
          {productsData && (
            <>
              {/* Results info */}
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  Mostrando {productsData.products.length} de{" "}
                  {productsData.pagination.total} productos
                </p>
                <Badge variant="outline">
                  Página {productsData.pagination.page} de{" "}
                  {productsData.pagination.totalPages}
                </Badge>
              </div>

              {/* Products */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {productsData.products.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onAddToCart={handleAddToCart}
                    onAddToWishlist={handleAddToWishlist}
                    isAddingToCart={addToCartMutation.isPending}
                    isAddingToWishlist={addToWishlistMutation.isPending}
                  />
                ))}
              </div>

              {/* Pagination */}
              {productsData.pagination.totalPages > 1 && (
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    disabled={!productsData.pagination.hasPreviousPage}
                    onClick={() =>
                      handleFilterChange({
                        page: Math.max(1, (filters.page || 1) - 1),
                      })
                    }
                  >
                    Anterior
                  </Button>
                  <span className="flex items-center px-4">
                    {productsData.pagination.page} /{" "}
                    {productsData.pagination.totalPages}
                  </span>
                  <Button
                    variant="outline"
                    disabled={!productsData.pagination.hasNextPage}
                    onClick={() =>
                      handleFilterChange({
                        page: (filters.page || 1) + 1,
                      })
                    }
                  >
                    Siguiente
                  </Button>
                </div>
              )}
            </>
          )}
        </LoadingState>
      </div>
    </ErrorBoundary>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onAddToWishlist: (product: Product) => void;
  isAddingToCart: boolean;
  isAddingToWishlist: boolean;
}

function ProductCard({
  product,
  onAddToCart,
  onAddToWishlist,
  isAddingToCart,
  isAddingToWishlist,
}: ProductCardProps) {
  const primaryImage =
    product.productImages?.find((img) => img.isPrimary) ||
    product.productImages?.[0];
  const price = parseFloat(product.basePrice);
  const comparePrice = product.compareAtPrice
    ? parseFloat(product.compareAtPrice)
    : null;
  const hasDiscount = comparePrice && comparePrice > price;

  return (
    <Card className="group hover:shadow-lg transition-shadow">
      <CardContent className="p-4">
        {/* Product Image */}
        <div className="aspect-square mb-4 bg-gray-100 rounded-lg overflow-hidden">
          {primaryImage ? (
            <img
              src={primaryImage.url}
              alt={primaryImage.altText || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              Sin imagen
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-2">
          <h3 className="font-semibold line-clamp-2">{product.name}</h3>
          <p className="text-sm text-gray-600 line-clamp-2">
            {product.shortDescription}
          </p>

          {/* Brand and Category */}
          <div className="flex gap-2">
            <Badge variant="secondary" className="text-xs">
              {product.brand?.name}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {product.category?.name}
            </Badge>
          </div>

          {/* Price */}
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold">${price.toFixed(2)}</span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${comparePrice.toFixed(2)}
              </span>
            )}
            {product.isFeatured && <Badge className="text-xs">Destacado</Badge>}
          </div>
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0 flex gap-2">
        <Button
          onClick={() => onAddToCart(product)}
          disabled={isAddingToCart || !product.isActive}
          className="flex-1"
          size="sm"
        >
          {isAddingToCart ? (
            <LoadingSpinner size="sm" className="mr-2" />
          ) : (
            <ShoppingCart className="h-4 w-4 mr-2" />
          )}
          Agregar
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onAddToWishlist(product)}
          disabled={isAddingToWishlist}
        >
          {isAddingToWishlist ? (
            <LoadingSpinner size="sm" />
          ) : (
            <Heart className="h-4 w-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
