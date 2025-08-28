"use client";

import type React from "react";
import api from "@/lib/api";
import { useState } from "react";
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
import { Save } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { brandsApi } from "@/lib/api/brands";

interface BrandModalProps {
  isOpen: boolean;
  onClose: () => void;
  brand?: any;
}

export function BrandModal({ isOpen, onClose, brand }: BrandModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    logo: "",
  });

  const resetForm = () => {
    setFormData({
      name: "",
      slug: "",
      description: "",
      logo: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!formData.slug) {
      toast({
        title: "Error",
        description: "El slug es requerido",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    try {
      await brandsApi.addBrand({
        name: formData.name,
        slug: formData.slug,
        description: formData.description || undefined,
        logo: formData.logo || undefined,
        isActive: true,
      });

      toast({
        title: "¡Éxito!",
        description: "La marca se ha guardado correctamente.",
        variant: "default",
      });
      resetForm();
      onClose();
      // Trigger a custom event to notify parent components
      window.dispatchEvent(new Event("brand-updated"));
    } catch (error: any) {
      console.error("Error saving brand:", error);
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Hubo un error al guardar la marca. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const newData = { ...prev, [field]: value };
      // Auto-generate slug from name if it's the name field and slug is empty or hasn't been modified
      if (
        field === "name" &&
        (!prev.slug || prev.slug === "" || prev.slug === toSlug(prev.name))
      ) {
        newData.slug = toSlug(value);
      }
      return newData;
    });
  };

  // Helper function to convert string to URL-friendly slug
  const toSlug = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .trim()
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-"); // Replace multiple hyphens with single hyphen
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
        if (!open && !isLoading) resetForm();
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {brand ? "Editar Marca" : "Agregar Nueva Marca"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="brand-name">Nombre de la Marca</Label>
            <Input
              id="brand-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Apple"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-slug">Slug</Label>
            <Input
              id="brand-slug"
              value={formData.slug}
              onChange={(e) => handleInputChange("slug", e.target.value)}
              placeholder="Ej: apple"
              required
            />
            <p className="text-xs text-muted-foreground">
              Identificador único para URLs. Se genera automáticamente desde el
              nombre.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-description">Descripción</Label>
            <Textarea
              id="brand-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descripción de la marca..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="brand-logo">URL del Logo</Label>
            <Input
              id="brand-logo"
              type="url"
              value={formData.logo}
              onChange={(e) => handleInputChange("logo", e.target.value)}
              placeholder="https://example.com/logo.png"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar Marca"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
