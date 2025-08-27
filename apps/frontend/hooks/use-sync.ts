import { useEffect, useState, useCallback } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useCartStore } from "@/lib/stores/cart-store";
import { useWishlistStore } from "@/lib/stores/wishlist-store";
import {
  syncService,
  SyncResult,
  SyncOptions,
} from "@/lib/services/sync.service";
import { toast } from "sonner";

export interface UseSyncOptions extends Partial<SyncOptions> {
  autoSyncOnLogin?: boolean;
  autoSyncOnReconnect?: boolean;
  periodicSyncInterval?: number; // minutes
}

export interface SyncState {
  isLoading: boolean;
  lastSyncTime: Date | null;
  error: string | null;
  queueLength: number;
}

/**
 * Hook principal para manejo de sincronización automática
 */
export function useSync(options: UseSyncOptions = {}) {
  const { isAuthenticated, isHydrated } = useAuthStore();
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    lastSyncTime: null,
    error: null,
    queueLength: 0,
  });

  const defaultOptions: UseSyncOptions = {
    autoSyncOnLogin: true,
    autoSyncOnReconnect: true,
    periodicSyncInterval: 5,
    conflictResolution: "auto",
    autoResolutionStrategy: "merge",
    showNotifications: false,
    ...options,
  };

  // Función para actualizar el estado de sincronización
  const updateSyncState = useCallback(() => {
    const status = syncService.getSyncStatus();
    setSyncState({
      isLoading: status.inProgress,
      lastSyncTime: status.lastSyncTime,
      error: null,
      queueLength: status.queueLength,
    });
  }, []);

  // Función para ejecutar sincronización manual
  const sync = useCallback(
    async (customOptions?: Partial<SyncOptions>): Promise<SyncResult> => {
      if (!isAuthenticated) {
        const error = "User not authenticated";
        setSyncState((prev) => ({ ...prev, error }));
        throw new Error(error);
      }

      setSyncState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const result = await syncService.syncAllData({
          ...defaultOptions,
          ...customOptions,
        });

        if (!result.success) {
          setSyncState((prev) => ({
            ...prev,
            error: result.errors.join(", "),
          }));
        }

        updateSyncState();
        return result;
      } catch (error: any) {
        const errorMessage = error.message || "Sync failed";
        setSyncState((prev) => ({ ...prev, error: errorMessage }));
        throw error;
      } finally {
        setSyncState((prev) => ({ ...prev, isLoading: false }));
      }
    },
    [isAuthenticated, defaultOptions, updateSyncState]
  );

  // Función para forzar sincronización
  const forceSync = useCallback(async (): Promise<SyncResult> => {
    return sync({
      showNotifications: true,
      conflictResolution: "auto",
      autoResolutionStrategy: "merge",
    });
  }, [sync]);

  // Efecto para sincronización automática en login
  useEffect(() => {
    if (isAuthenticated && isHydrated && defaultOptions.autoSyncOnLogin) {
      syncService.scheduleSyncOnLogin();
      updateSyncState();
    }
  }, [
    isAuthenticated,
    isHydrated,
    defaultOptions.autoSyncOnLogin,
    updateSyncState,
  ]);

  // Efecto para sincronización periódica
  useEffect(() => {
    if (
      isAuthenticated &&
      defaultOptions.periodicSyncInterval &&
      defaultOptions.periodicSyncInterval > 0
    ) {
      syncService.startPeriodicSync(defaultOptions.periodicSyncInterval);
    }
  }, [isAuthenticated, defaultOptions.periodicSyncInterval]);

  // Efecto para sincronización en reconexión
  useEffect(() => {
    if (!defaultOptions.autoSyncOnReconnect) return;

    const handleOnline = () => {
      if (isAuthenticated) {
        syncService.queueSync(async () => {
          await syncService.syncAllData({
            ...defaultOptions,
            showNotifications: false,
          });
        });
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, [isAuthenticated, defaultOptions]);

  // Actualizar estado periódicamente
  useEffect(() => {
    const interval = setInterval(updateSyncState, 1000);
    return () => clearInterval(interval);
  }, [updateSyncState]);

  return {
    ...syncState,
    sync,
    forceSync,
    updateSyncState,
  };
}

/**
 * Hook para sincronización automática del carrito
 */
export function useCartSync() {
  const { isAuthenticated } = useAuthStore();
  const { syncWithServer, isSyncing } = useCartStore();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const syncCart = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await syncWithServer();
      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Cart sync failed:", error);
    }
  }, [isAuthenticated, syncWithServer]);

  // Sincronización automática en cambios de autenticación
  useEffect(() => {
    if (isAuthenticated) {
      syncCart();
    }
  }, [isAuthenticated, syncCart]);

  return {
    syncCart,
    isSyncing,
    lastSyncTime,
  };
}

/**
 * Hook para sincronización automática de la wishlist
 */
export function useWishlistSync() {
  const { isAuthenticated } = useAuthStore();
  const { syncWithServer, isSyncing } = useWishlistStore();
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);

  const syncWishlist = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      await syncWithServer();
      setLastSyncTime(new Date());
    } catch (error) {
      console.error("Wishlist sync failed:", error);
    }
  }, [isAuthenticated, syncWithServer]);

  // Sincronización automática en cambios de autenticación
  useEffect(() => {
    if (isAuthenticated) {
      syncWishlist();
    }
  }, [isAuthenticated, syncWishlist]);

  return {
    syncWishlist,
    isSyncing,
    lastSyncTime,
  };
}

/**
 * Hook para detectar cambios de conectividad y sincronizar
 */
export function useConnectivitySync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const { isAuthenticated } = useAuthStore();
  const { sync } = useSync({ showNotifications: false });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (isAuthenticated) {
        // Sincronizar cuando se recupera la conexión
        sync().catch(console.error);
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [isAuthenticated, sync]);

  return {
    isOnline,
  };
}

/**
 * Hook para sincronización en tiempo real con WebSocket (futuro)
 */
export function useRealtimeSync() {
  const { isAuthenticated } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);

  // Placeholder para implementación futura con WebSocket
  useEffect(() => {
    if (!isAuthenticated) return;

    // TODO: Implementar conexión WebSocket para sincronización en tiempo real
    // const ws = new WebSocket('ws://localhost:3001/sync');
    // ws.onopen = () => setIsConnected(true);
    // ws.onclose = () => setIsConnected(false);
    // ws.onmessage = (event) => {
    //   const data = JSON.parse(event.data);
    //   // Manejar actualizaciones en tiempo real
    // };

    // return () => ws.close();
  }, [isAuthenticated]);

  return {
    isConnected,
  };
}

/**
 * Hook para manejo de conflictos de sincronización
 */
export function useSyncConflicts() {
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [showConflictModal, setShowConflictModal] = useState(false);

  const resolveConflict = useCallback(
    (conflictId: string, resolution: "local" | "server" | "merge") => {
      setConflicts((prev) =>
        prev.map((conflict) =>
          conflict.id === conflictId ? { ...conflict, resolution } : conflict
        )
      );
    },
    []
  );

  const resolveAllConflicts = useCallback(
    (resolution: "local" | "server" | "merge") => {
      setConflicts((prev) =>
        prev.map((conflict) => ({ ...conflict, resolution }))
      );
    },
    []
  );

  const clearConflicts = useCallback(() => {
    setConflicts([]);
    setShowConflictModal(false);
  }, []);

  return {
    conflicts,
    showConflictModal,
    setShowConflictModal,
    resolveConflict,
    resolveAllConflicts,
    clearConflicts,
  };
}
