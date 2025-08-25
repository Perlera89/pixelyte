import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { ProductGrid } from "@/components/home/product-grid";
import { getFeaturedProducts } from "@/lib/data/products";

export default function HomePage() {
  const featuredProducts = getFeaturedProducts();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <HeroSection />
        <FeaturedCategories />
        <ProductGrid
          products={featuredProducts}
          title="Productos Destacados"
          featured
        />
      </main>
    </div>
  );
}
