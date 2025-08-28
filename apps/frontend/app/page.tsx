import { Navbar } from "@/components/layout/navbar";
import { HeroSection } from "@/components/home/hero-section";
import { FeaturedCategories } from "@/components/home/featured-categories";
import { FeaturedProductsSection } from "@/components/home/featured-products-section";
import { StoreDebug } from "@/components/debug/store-debug";
import { TestButtons } from "@/components/debug/test-buttons";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <HeroSection />
        <FeaturedCategories />
        <FeaturedProductsSection />
      </main>
    </div>
  );
}
