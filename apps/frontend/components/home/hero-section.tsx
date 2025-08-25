import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <div className="relative bg-gradient-to-r from-primary to-secondary rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-black/20" />
      <div className="relative px-8 py-16 sm:py-24 text-center">
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 font-sans">
          Los mejores productos tecnológicos
        </h2>
        <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
          Descubre los últimos productos electrónicos con la mejor calidad y
          precios competitivos
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button size="lg" variant="secondary" asChild>
            <Link href="/category/smartphones">Ver Smartphones</Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            asChild
          >
            <Link href="/category/laptops">Ver Laptops</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
