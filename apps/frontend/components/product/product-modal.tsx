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
import { BrandModal } from "./brand-modal";
import { CategoryModal } from "./category-modal";
import { useCategories } from "@/hooks/use-categories";
import { useBrands } from "@/hooks/use-brands";
import { useCreateProduct, useUpdateProduct } from "@/hooks/use-products";
import {
  CreateProductRequest,
  UpdateProductRequest,
} from "@/types/interfaces/product";
import { useAuthStore } from "@/lib/stores/auth-store";

// Quick Login Component
function QuickLogin({ onSuccess }: { onSuccess: () => void }) {
  const [loginData, setLoginData] = useState({
    email: "admin@pixelyte.com",
    password: "Test1234!",
  });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { login } = useAuthStore();

  const handleQuickLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    try {
      await login(loginData);
      onSuccess();
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-medium text-yellow-800 mb-2">
          Autenticación Requerida
        </h3>
        <p className="text-sm text-yellow-700 mb-4">
          Necesitas estar logueado como ADMIN para crear productos.
        </p>

        <form onSubmit={handleQuickLogin} className="space-y-3">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={loginData.email}
              onChange={(e) =>
                setLoginData((prev) => ({ ...prev, email: e.target.value }))
              }
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData((prev) => ({ ...prev, password: e.target.value }))
              }
              required
            />
          </div>
          <Button type="submit" disabled={isLoggingIn} className="w-full">
            {isLoggingIn ? "Iniciando sesión..." : "Iniciar Sesión"}
          </Button>
        </form>
      </div>
    </div>
  );
}

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: any;
}

export function ProductModal({ isOpen, onClose, product }: ProductModalProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [showBrandModal, setShowBrandModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const { data: categoriesData } = useCategories();
  const { data: brandsData } = useBrands();
  const createProductMutation = useCreateProduct();
  const updateProductMutation = useUpdateProduct();
  const { user, isAuthenticated, token } = useAuthStore();

  const categories = categoriesData?.data || [];
  const brands = brandsData?.data || [];
  const isLoading =
    createProductMutation.isPending || updateProductMutation.isPending;

  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    brandId: "",
    categoryId: "",
    shortDescription: "",
    longDescription: "",
    basePrice: "",
    compareAtPrice: "",
    costPrice: "",
    weight: "",
    requiresShipping: true,
    isDigital: false,
    isFeatured: false,
    isActive: true,
    status: "ACTIVE" as const,
    seoTitle: "",
    seoDescription: "",
  });

  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name || "",
        sku: product.sku || "",
        brandId: product.brandId || "",
        categoryId: product.categoryId || "",
        shortDescription: product.shortDescription || "",
        longDescription: product.longDescription || "",
        basePrice: product.basePrice?.toString() || "",
        compareAtPrice: product.compareAtPrice?.toString() || "",
        costPrice: product.costPrice?.toString() || "",
        weight: product.weight?.toString() || "",
        requiresShipping: product.requiresShipping ?? true,
        isDigital: product.isDigital ?? false,
        isFeatured: product.isFeatured ?? false,
        isActive: product.isActive ?? true,
        status: product.status || "ACTIVE",
        seoTitle: product.seoTitle || "",
        seoDescription: product.seoDescription || "",
      });
    } else {
      setFormData({
        name: "",
        sku: "",
        brandId: "",
        categoryId: "",
        shortDescription: "",
        longDescription: "",
        basePrice: "",
        compareAtPrice: "",
        costPrice: "",
        weight: "",
        requiresShipping: true,
        isDigital: false,
        isFeatured: false,
        isActive: true,
        status: "ACTIVE",
        seoTitle: "",
        seoDescription: "",
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const productData = {
        ...formData,
        slug: formData.name
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        basePrice: parseFloat(formData.basePrice) || 0,
        compareAtPrice: formData.compareAtPrice
          ? parseFloat(formData.compareAtPrice)
          : undefined,
        costPrice: formData.costPrice
          ? parseFloat(formData.costPrice)
          : undefined,
        weight: formData.weight ? parseFloat(formData.weight) : undefined,
      };

      console.log("productData", productData);
      console.log("Auth status:", {
        isAuthenticated,
        userRole: user?.role,
        hasToken: !!token,
      });

      if (product?.id) {
        // Update existing product
        await updateProductMutation.mutateAsync({
          id: product.id,
          ...productData,
        } as UpdateProductRequest);
      } else {
        // Create new product
        await createProductMutation.mutateAsync(
          productData as CreateProductRequest
        );
      }

      onClose();
      setCurrentStep(1);
    } catch (error) {
      // Error handling is done in the mutation hooks
      console.error("Error saving product:", error);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
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

          {!isAuthenticated || user?.role !== "ADMIN" ? (
            <QuickLogin onSuccess={() => window.location.reload()} />
          ) : (
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
                      <Label htmlFor="sku">SKU</Label>
                      <Input
                        id="sku"
                        value={formData.sku}
                        onChange={(e) =>
                          handleInputChange("sku", e.target.value)
                        }
                        placeholder="Ej: IPH15PM-256-BLK"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brand">Marca</Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.brandId}
                          onValueChange={(value) =>
                            handleInputChange("brandId", value)
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

                    <div className="space-y-2">
                      <Label htmlFor="category">Categoría</Label>
                      <div className="flex gap-2">
                        <Select
                          value={formData.categoryId}
                          onValueChange={(value) =>
                            handleInputChange("categoryId", value)
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

                  <div className="space-y-2">
                    <Label htmlFor="shortDescription">Descripción Corta</Label>
                    <Textarea
                      id="shortDescription"
                      value={formData.shortDescription}
                      onChange={(e) =>
                        handleInputChange("shortDescription", e.target.value)
                      }
                      placeholder="Descripción breve del producto..."
                      rows={2}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="longDescription">
                      Descripción Detallada
                    </Label>
                    <Textarea
                      id="longDescription"
                      value={formData.longDescription}
                      onChange={(e) =>
                        handleInputChange("longDescription", e.target.value)
                      }
                      placeholder="Descripción detallada del producto..."
                      rows={4}
                      required
                    />
                  </div>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="basePrice">Precio Base ($)</Label>
                      <Input
                        id="basePrice"
                        type="number"
                        step="0.01"
                        value={formData.basePrice}
                        onChange={(e) =>
                          handleInputChange("basePrice", e.target.value)
                        }
                        placeholder="999.99"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="compareAtPrice">
                        Precio de Comparación ($)
                      </Label>
                      <Input
                        id="compareAtPrice"
                        type="number"
                        step="0.01"
                        value={formData.compareAtPrice}
                        onChange={(e) =>
                          handleInputChange("compareAtPrice", e.target.value)
                        }
                        placeholder="1199.99"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="costPrice">Precio de Costo ($)</Label>
                      <Input
                        id="costPrice"
                        type="number"
                        step="0.01"
                        value={formData.costPrice}
                        onChange={(e) =>
                          handleInputChange("costPrice", e.target.value)
                        }
                        placeholder="750.00"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="weight">Peso (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        step="0.01"
                        value={formData.weight}
                        onChange={(e) =>
                          handleInputChange("weight", e.target.value)
                        }
                        placeholder="0.5"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Estado</Label>
                      <Select
                        value={formData.status}
                        onValueChange={(value) =>
                          handleInputChange("status", value)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccionar estado" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ACTIVE">Activo</SelectItem>
                          <SelectItem value="INACTIVE">Inactivo</SelectItem>
                          <SelectItem value="DRAFT">Borrador</SelectItem>
                          <SelectItem value="ARCHIVED">Archivado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="seoTitle">Título SEO</Label>
                      <Input
                        id="seoTitle"
                        value={formData.seoTitle}
                        onChange={(e) =>
                          handleInputChange("seoTitle", e.target.value)
                        }
                        placeholder="Título optimizado para SEO"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="seoDescription">Descripción SEO</Label>
                      <Input
                        id="seoDescription"
                        value={formData.seoDescription}
                        onChange={(e) =>
                          handleInputChange("seoDescription", e.target.value)
                        }
                        placeholder="Descripción meta para SEO"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isFeatured"
                        checked={formData.isFeatured}
                        onChange={(e) =>
                          handleInputChange("isFeatured", e.target.checked)
                        }
                        className="rounded"
                      />
                      <Label htmlFor="isFeatured">Producto Destacado</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="isDigital"
                        checked={formData.isDigital}
                        onChange={(e) =>
                          handleInputChange("isDigital", e.target.checked)
                        }
                        className="rounded"
                      />
                      <Label htmlFor="isDigital">Producto Digital</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="requiresShipping"
                        checked={formData.requiresShipping}
                        onChange={(e) =>
                          handleInputChange(
                            "requiresShipping",
                            e.target.checked
                          )
                        }
                        className="rounded"
                      />
                      <Label htmlFor="requiresShipping">Requiere Envío</Label>
                    </div>
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
          )}
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
