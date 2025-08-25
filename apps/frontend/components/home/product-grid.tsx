import type { Product } from "@/lib/stores/cart-store";
import { ProductCard } from "./product-card";

interface ProductGridProps {
  products: Product[];
  title?: string;
  featured?: boolean;
}

export function ProductGrid({
  products,
  title,
  featured = false,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="space-y-6">
        {title && (
          <h2 className="text-2xl font-bold text-foreground font-sans">
            {title}
          </h2>
        )}
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <h3 className="text-lg font-semibold text-muted-foreground mb-2">
            No se encontraron productos
          </h3>
          <p className="text-muted-foreground">
            Intenta con otros filtros o categorías.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-2xl font-bold text-foreground font-sans">
          {title}
        </h2>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} featured={featured} />
        ))}
      </div>
    </div>
  );
}
