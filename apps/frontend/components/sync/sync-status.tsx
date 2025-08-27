"use client";

import React from "react";
import { useSyncContext } from "@/lib/providers/sync-provider";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SyncStatusProps {
  variant?: "minimal" | "detailed" | "button";
  className?: string;
  showLastSyncTime?: boolean;
  showForceSync?: boolean;
}

export function SyncStatus({
  variant = "minimal",
  className,
  showLastSyncTime = true,
  showForceSync = true,
}: SyncStatusProps) {
  const { isLoading, lastSyncTime, error, isOnline, forceSync } =
    useSyncContext();

  const handleForceSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error("Force sync failed:", error);
    }
  };

  const formatLastSyncTime = (date: Date | null) => {
    if (!date) return "Nunca";

    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));

    if (diffMinutes < 1) return "Ahora";
    if (diffMinutes < 60) return `Hace ${diffMinutes}m`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `Hace ${diffHours}h`;

    return date.toLocaleDateString();
  };

  if (variant === "minimal") {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={cn("flex items-center gap-1", className)}>
              {/* Indicador de conexión */}
              {isOnline ? (
                <Wifi className="h-4 w-4 text-green-500" />
              ) : (
                <WifiOff className="h-4 w-4 text-red-500" />
              )}

              {/* Indicador de sincronización */}
              {isLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin text-blue-500" />
              ) : error ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <CheckCircle className="h-4 w-4 text-green-500" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-sm">
              <div>Estado: {isOnline ? "En línea" : "Sin conexión"}</div>
              <div>
                Sincronización:{" "}
                {isLoading ? "En progreso..." : error ? "Error" : "Actualizado"}
              </div>
              {showLastSyncTime && (
                <div>Última sync: {formatLastSyncTime(lastSyncTime)}</div>
              )}
              {error && <div className="text-red-400">Error: {error}</div>}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={handleForceSync}
        disabled={isLoading || !isOnline}
        className={cn("gap-2", className)}
      >
        <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        {isLoading ? "Sincronizando..." : "Sincronizar"}
      </Button>
    );
  }

  // variant === "detailed"
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 bg-muted/50 rounded-lg",
        className
      )}
    >
      {/* Estado de conexión */}
      <div className="flex items-center gap-2">
        {isOnline ? (
          <Badge variant="secondary" className="gap-1">
            <Wifi className="h-3 w-3" />
            En línea
          </Badge>
        ) : (
          <Badge variant="destructive" className="gap-1">
            <WifiOff className="h-3 w-3" />
            Sin conexión
          </Badge>
        )}
      </div>

      {/* Estado de sincronización */}
      <div className="flex items-center gap-2">
        {isLoading ? (
          <Badge variant="secondary" className="gap-1">
            <RefreshCw className="h-3 w-3 animate-spin" />
            Sincronizando...
          </Badge>
        ) : error ? (
          <Badge variant="destructive" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Error
          </Badge>
        ) : (
          <Badge variant="secondary" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Actualizado
          </Badge>
        )}
      </div>

      {/* Última sincronización */}
      {showLastSyncTime && (
        <div className="text-sm text-muted-foreground">
          Última sync: {formatLastSyncTime(lastSyncTime)}
        </div>
      )}

      {/* Botón de sincronización forzada */}
      {showForceSync && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleForceSync}
          disabled={isLoading || !isOnline}
          className="ml-auto"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </Button>
      )}

      {/* Mensaje de error */}
      {error && (
        <div
          className="text-sm text-red-500 ml-auto max-w-xs truncate"
          title={error}
        >
          {error}
        </div>
      )}
    </div>
  );
}

// Componente para mostrar el estado en la barra de navegación
export function NavSyncStatus() {
  return <SyncStatus variant="minimal" className="ml-2" />;
}

// Componente para mostrar en configuraciones o páginas de perfil
export function DetailedSyncStatus() {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Estado de Sincronización</h3>
      <SyncStatus variant="detailed" showLastSyncTime showForceSync />

      <div className="text-sm text-muted-foreground">
        <p>
          Los datos se sincronizan automáticamente cuando inicias sesión y cada
          5 minutos. También se sincronizan cuando recuperas la conexión a
          internet.
        </p>
      </div>
    </div>
  );
}
