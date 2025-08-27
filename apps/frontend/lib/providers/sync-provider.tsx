"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useSync, useConnectivitySync } from "@/hooks/use-sync";
import { syncService, SyncResult } from "@/lib/services/sync.service";
import { toast } from "sonner";

interface SyncContextType {
  isLoading: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  isOnline: boolean;
  sync: () => Promise<SyncResult>;
  forceSync: () => Promise<SyncResult>;
}

const SyncContext = createContext<SyncContextType | undefined>(undefined);

export function useSyncContext() {
  const context = useContext(SyncContext);
  if (context === undefined) {
    throw new Error("useSyncContext must be used within a SyncProvider");
  }
  return context;
}

interface SyncProviderProps {
  children: React.ReactNode;
  autoSyncOnLogin?: boolean;
  periodicSyncInterval?: number; // minutes
  showSyncNotifications?: boolean;
}

export function SyncProvider({
  children,
  autoSyncOnLogin = true,
  periodicSyncInterval = 5,
  showSyncNotifications = false,
}: SyncProviderProps) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [syncStats, setSyncStats] = useState({
    totalSyncs: 0,
    lastSyncResult: null as SyncResult | null,
  });

  // Usar hooks de sincronización
  const { isLoading, lastSyncTime, error, sync, forceSync } = useSync({
    autoSyncOnLogin,
    periodicSyncInterval,
    showNotifications: showSyncNotifications,
    conflictResolution: "auto",
    autoResolutionStrategy: "merge",
  });

  const { isOnline } = useConnectivitySync();

  // Función de sincronización con estadísticas
  const syncWithStats = async (): Promise<SyncResult> => {
    const result = await sync();
    setSyncStats((prev) => ({
      totalSyncs: prev.totalSyncs + 1,
      lastSyncResult: result,
    }));
    return result;
  };

  const forceSyncWithStats = async (): Promise<SyncResult> => {
    const result = await forceSync();
    setSyncStats((prev) => ({
      totalSyncs: prev.totalSyncs + 1,
      lastSyncResult: result,
    }));
    return result;
  };

  // Efecto para mostrar notificaciones de estado de conexión
  useEffect(() => {
    if (!isOnline) {
      toast.warning(
        "Sin conexión a internet. Los cambios se guardarán localmente.",
        {
          id: "offline-toast",
          duration: 5000,
        }
      );
    } else {
      toast.dismiss("offline-toast");

      // Si recuperamos la conexión y hay datos locales, sincronizar
      if (isAuthenticated && isHydrated) {
        syncService.queueSync(async () => {
          await syncWithStats();
        });
      }
    }
  }, [isOnline, isAuthenticated, isHydrated]);

  // Efecto para manejar errores de sincronización
  useEffect(() => {
    if (error && showSyncNotifications) {
      toast.error(`Error de sincronización: ${error}`, {
        id: "sync-error-toast",
      });
    }
  }, [error, showSyncNotifications]);

  // Efecto para limpiar recursos al desmontar
  useEffect(() => {
    return () => {
      toast.dismiss("offline-toast");
      toast.dismiss("sync-error-toast");
    };
  }, []);

  const contextValue: SyncContextType = {
    isLoading,
    lastSyncTime,
    error,
    isOnline,
    sync: syncWithStats,
    forceSync: forceSyncWithStats,
  };

  return (
    <SyncContext.Provider value={contextValue}>
      {children}
      {/* Componente de estado de sincronización (opcional) */}
      {process.env.NODE_ENV === "development" && (
        <SyncDebugInfo
          isLoading={isLoading}
          lastSyncTime={lastSyncTime}
          error={error}
          isOnline={isOnline}
          totalSyncs={syncStats.totalSyncs}
          lastResult={syncStats.lastSyncResult}
        />
      )}
    </SyncContext.Provider>
  );
}

// Componente de debug para desarrollo
function SyncDebugInfo({
  isLoading,
  lastSyncTime,
  error,
  isOnline,
  totalSyncs,
  lastResult,
}: {
  isLoading: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  isOnline: boolean;
  totalSyncs: number;
  lastResult: SyncResult | null;
}) {
  const [showDebug, setShowDebug] = useState(false);

  if (!showDebug) {
    return (
      <button
        onClick={() => setShowDebug(true)}
        className="fixed bottom-4 right-4 bg-blue-500 text-white p-2 rounded-full text-xs z-50"
        title="Show sync debug info"
      >
        🔄
      </button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm z-50">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold">Sync Debug</h3>
        <button
          onClick={() => setShowDebug(false)}
          className="text-gray-300 hover:text-white"
        >
          ✕
        </button>
      </div>

      <div className="space-y-1">
        <div>Status: {isLoading ? "🔄 Syncing..." : "✅ Idle"}</div>
        <div>Online: {isOnline ? "🟢" : "🔴"}</div>
        <div>Total Syncs: {totalSyncs}</div>
        <div>
          Last Sync:{" "}
          {lastSyncTime ? lastSyncTime.toLocaleTimeString() : "Never"}
        </div>
        {error && <div className="text-red-300">Error: {error}</div>}
        {lastResult && (
          <div>
            Last Result: {lastResult.success ? "✅" : "❌"}
            (Cart: {lastResult.syncedItems.cart}, WL:{" "}
            {lastResult.syncedItems.wishlist})
          </div>
        )}
      </div>
    </div>
  );
}
