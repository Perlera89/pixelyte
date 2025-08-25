"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Save, ArrowLeft, ArrowRight, Plus } from "lucide-react";
import { brands, categories } from "@/lib/data/brands";
import { BrandModal } from "./product/brand-modal";
import { CategoryModal } from "./product/category-modal";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    description: "",
    price: "",
    stock: "",
    discount: "",
    category: "",
    rating: "",
    image: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        brand: product.brand || "",
        description: product.description || "",
        price: product.price?.toString() || "",
        stock: product.stock?.toString() || "",
        discount: product.discount?.toString() || "",
        category: product.category || "",
        rating: product.rating?.toString() || "",
        image: product.image || "",
      });
    } else {
      setFormData({
        name: "",
        brand: "",
        description: "",
        price: "",
        stock: "",
        discount: "",
        category: "",
        rating: "",
        image: "",
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setIsLoading(false);
    onClose();
    setCurrentStep(1);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < 2) setCurrentStep(currentStep + 1);
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleClose = () => {
    setCurrentStep(1);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              {product ? "Editar Producto" : "Agregar Nuevo Producto"}
              <span className="text-sm text-muted-foreground">
                Paso {currentStep} de 2
              </span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-6">
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Producto</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        handleInputChange("name", e.target.value)
                      }
                      placeholder="Ej: iPhone 15 Pro Max"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brand">Marca</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.brand}
                        onValueChange={(value) =>
                          handleInputChange("brand", value)
                        }
                        required
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar marca" />
                        </SelectTrigger>
                        <SelectContent>
                          {brands.map((brand) => (
                            <SelectItem key={brand.id} value={brand.id}>
                              {brand.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setShowBrandModal(true)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    placeholder="Descripción detallada del producto..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Categoría</Label>
                  <div className="flex gap-2">
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        handleInputChange("category", value)
                      }
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => setShowCategoryModal(true)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Precio ($)</Label>
                    <Input
                      id="price"
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) =>
                        handleInputChange("price", e.target.value)
                      }
                      placeholder="999.99"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Stock</Label>
                    <Input
                      id="stock"
                      type="number"
                      value={formData.stock}
                      onChange={(e) =>
                        handleInputChange("stock", e.target.value)
                      }
                      placeholder="50"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="discount">Descuento (%)</Label>
                    <Input
                      id="discount"
                      type="number"
                      min="0"
                      max="100"
                      value={formData.discount}
                      onChange={(e) =>
                        handleInputChange("discount", e.target.value)
                      }
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rating">Rating</Label>
                  <Input
                    id="rating"
                    type="number"
                    min="1"
                    max="5"
                    step="0.1"
                    value={formData.rating}
                    onChange={(e) =>
                      handleInputChange("rating", e.target.value)
                    }
                    placeholder="4.5"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">URL de Imagen</Label>
                  <Input
                    id="image"
                    type="url"
                    value={formData.image}
                    onChange={(e) => handleInputChange("image", e.target.value)}
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between">
              <div>
                {currentStep > 1 && (
                  <Button type="button" variant="outline" onClick={prevStep}>
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Anterior
                  </Button>
                )}
              </div>

              <div className="flex space-x-2">
                <Button type="button" variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>

                {currentStep < 2 ? (
                  <Button type="button" onClick={nextStep}>
                    Siguiente
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={isLoading}>
                    <Save className="h-4 w-4 mr-2" />
                    {isLoading ? "Guardando..." : "Guardar Producto"}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <BrandModal
        isOpen={showBrandModal}
        onClose={() => setShowBrandModal(false)}
      />

      <CategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
      />
    </>
  );
}
