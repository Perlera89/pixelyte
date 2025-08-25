"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"

interface CategoryModalProps {
  isOpen: boolean
  onClose: () => void
  category?: any
}

export function CategoryModal({ isOpen, onClose, category }: CategoryModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: category?.name || "",
    description: category?.description || "",
    icon: category?.icon || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsLoading(false)
    onClose()
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{category ? "Editar Categoría" : "Agregar Nueva Categoría"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">Nombre de la Categoría</Label>
            <Input
              id="category-name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="Ej: Smartphones"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-description">Descripción</Label>
            <Textarea
              id="category-description"
              value={formData.description}
              onChange={(e) => handleInputChange("description", e.target.value)}
              placeholder="Descripción de la categoría..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-icon">Icono</Label>
            <Input
              id="category-icon"
              value={formData.icon}
              onChange={(e) => handleInputChange("icon", e.target.value)}
              placeholder="smartphone"
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? "Guardando..." : "Guardar Categoría"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
