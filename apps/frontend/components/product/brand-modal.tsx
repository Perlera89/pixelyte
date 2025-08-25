"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"

interface BrandModalProps {
  isOpen: boolean
  onClose: () => void
  brand?: any
}

export function BrandModal({ isOpen, onClose, brand }: BrandModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: brand?.name || "",
    description: brand?.description || "",
    logo: brand?.logo || "",
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
          <DialogTitle>{brand ? "Editar Marca" : "Agregar Nueva Marca"}</DialogTitle>
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
  )
}
