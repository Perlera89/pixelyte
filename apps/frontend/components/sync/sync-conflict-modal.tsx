"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ShoppingCart, Heart, AlertTriangle } from "lucide-react";
import { SyncConflict } from "@/lib/services/sync.service";

interface SyncConflictModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conflicts: SyncConflict[];
  onResolve: (
    resolutions: Record<string, "local" | "server" | "merge">
  ) => void;
  onResolveAll: (resolution: "local" | "server" | "merge") => void;
}

export function SyncConflictModal({
  open,
  onOpenChange,
  conflicts,
  onResolve,
  onResolveAll,
}: SyncConflictModalProps) {
  const [resolutions, setResolutions] = useState<
    Record<string, "local" | "server" | "merge">
  >({});
  const [globalResolution, setGlobalResolution] = useState<
    "local" | "server" | "merge"
  >("merge");

  const handleConflictResolution = (
    conflictId: string,
    resolution: "local" | "server" | "merge"
  ) => {
    setResolutions((prev) => ({
      ...prev,
      [conflictId]: resolution,
    }));
  };

  const handleResolveAll = () => {
    onResolveAll(globalResolution);
    onOpenChange(false);
  };

  const handleResolveIndividual = () => {
    onResolve(resolutions);
    onOpenChange(false);
  };

  const getConflictIcon = (type: "cart" | "wishlist") => {
    return type === "cart" ? (
      <ShoppingCart className="h-5 w-5 text-blue-500" />
    ) : (
      <Heart className="h-5 w-5 text-red-500" />
    );
  };

  const getConflictDescription = (conflict: SyncConflict) => {
    if (conflict.type === "cart") {
      return `Cantidad local: ${conflict.localData.quantity}, Cantidad en servidor: ${conflict.serverData.quantity}`;
    } else {
      return "Diferencias en la lista de deseos entre dispositivos";
    }
  };

  const getResolutionDescription = (
    resolution: "local" | "server" | "merge"
  ) => {
    switch (resolution) {
      case "local":
        return "Usar datos de este dispositivo";
      case "server":
        return "Usar datos del servidor";
      case "merge":
        return "Combinar automáticamente (recomendado)";
    }
  };

  if (conflicts.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Conflictos de Sincronización Detectados
          </DialogTitle>
          <DialogDescription>
            Se encontraron diferencias entre los datos locales y del servidor.
            Elige cómo resolver cada conflicto.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resolución global */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resolución Rápida</CardTitle>
              <CardDescription>
                Aplicar la misma resolución a todos los conflictos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={globalResolution}
                onValueChange={(value) => setGlobalResolution(value as any)}
                className="space-y-3"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="merge" id="global-merge" />
                  <Label htmlFor="global-merge" className="flex-1">
                    <div className="font-medium">Combinar automáticamente</div>
                    <div className="text-sm text-muted-foreground">
                      Usar la mejor opción para cada conflicto (recomendado)
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="local" id="global-local" />
                  <Label htmlFor="global-local" className="flex-1">
                    <div className="font-medium">Usar datos locales</div>
                    <div className="text-sm text-muted-foreground">
                      Mantener los datos de este dispositivo
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="server" id="global-server" />
                  <Label htmlFor="global-server" className="flex-1">
                    <div className="font-medium">Usar datos del servidor</div>
                    <div className="text-sm text-muted-foreground">
                      Usar los datos sincronizados más recientes
                    </div>
                  </Label>
                </div>
              </RadioGroup>

              <Button onClick={handleResolveAll} className="w-full mt-4">
                Resolver Todos los Conflictos
              </Button>
            </CardContent>
          </Card>

          {/* Resolución individual */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Resolución Individual</h3>

            {conflicts.map((conflict, index) => (
              <Card key={index} className="border-l-4 border-l-yellow-500">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    {getConflictIcon(conflict.type)}
                    {conflict.item.name || `${conflict.type} item`}
                    <Badge variant="secondary" className="ml-auto">
                      {conflict.type === "cart" ? "Carrito" : "Lista de Deseos"}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {getConflictDescription(conflict)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={resolutions[`conflict-${index}`] || "merge"}
                    onValueChange={(value) =>
                      handleConflictResolution(
                        `conflict-${index}`,
                        value as any
                      )
                    }
                    className="space-y-2"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="merge" id={`merge-${index}`} />
                      <Label htmlFor={`merge-${index}`} className="text-sm">
                        Combinar automáticamente
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="local" id={`local-${index}`} />
                      <Label htmlFor={`local-${index}`} className="text-sm">
                        Usar datos locales
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="server" id={`server-${index}`} />
                      <Label htmlFor={`server-${index}`} className="text-sm">
                        Usar datos del servidor
                      </Label>
                    </div>
                  </RadioGroup>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleResolveIndividual}>
            Resolver Conflictos Seleccionados
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Hook para usar el modal de conflictos
export function useSyncConflictModal() {
  const [open, setOpen] = useState(false);
  const [conflicts, setConflicts] = useState<SyncConflict[]>([]);

  const showConflicts = (conflictList: SyncConflict[]) => {
    setConflicts(conflictList);
    setOpen(true);
  };

  const handleResolve = (
    resolutions: Record<string, "local" | "server" | "merge">
  ) => {
    // Aquí se implementaría la lógica para aplicar las resoluciones
    console.log("Resolving conflicts:", resolutions);
    setOpen(false);
    setConflicts([]);
  };

  const handleResolveAll = (resolution: "local" | "server" | "merge") => {
    // Aquí se implementaría la lógica para aplicar la resolución global
    console.log("Resolving all conflicts with:", resolution);
    setOpen(false);
    setConflicts([]);
  };

  return {
    ConflictModal: () => (
      <SyncConflictModal
        open={open}
        onOpenChange={setOpen}
        conflicts={conflicts}
        onResolve={handleResolve}
        onResolveAll={handleResolveAll}
      />
    ),
    showConflicts,
    isOpen: open,
  };
}
