import { cartApi, SyncCartDto } from "@/lib/api/cart";
import { wishlistApi, SyncWishlistDto } from "@/lib/api/wishlist";
import { ApiErrorHandler } from "@/lib/api/error-handler";
import { toast } from "sonner";

export interface SyncConflict {
  type: "cart" | "wishlist";
  item: any;
  localData: any;
  serverData: any;
  resolution?: "local" | "server" | "merge";
}

export interface SyncResult {
  success: boolean;
  conflicts: SyncConflict[];
  syncedItems: {
    cart: number;
    wishlist: number;
  };
  errors: string[];
}

export interface SyncOptions {
  conflictResolution: "auto" | "manual";
  autoResolutionStrategy: "local" | "server" | "merge";
  showNotifications: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
}

const DEFAULT_SYNC_OPTIONS: SyncOptions = {
  conflictResolution: "auto",
  autoResolutionStrategy: "merge",
  showNotifications: true,
  retryOnFailure: true,
  maxRetries: 3,
};

export class SyncService {
  private static instance: SyncService;
  private syncInProgress = false;
  private lastSyncTime: Date | null = null;
  private syncQueue: Array<() => Promise<void>> = [];

  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Sincroniza todos los datos del usuario con el servidor
   */
  async syncAllData(options: Partial<SyncOptions> = {}): Promise<SyncResult> {
    const finalOptions = { ...DEFAULT_SYNC_OPTIONS, ...options };

    if (this.syncInProgress) {
      if (finalOptions.showNotifications) {
        toast.info("Sincronización ya en progreso...");
      }
      return {
        success: false,
        conflicts: [],
        syncedItems: { cart: 0, wishlist: 0 },
        errors: ["Sync already in progress"],
      };
    }

    this.syncInProgress = true;
    const result: SyncResult = {
      success: true,
      conflicts: [],
      syncedItems: { cart: 0, wishlist: 0 },
      errors: [],
    };

    try {
      if (finalOptions.showNotifications) {
        toast.loading("Sincronizando datos...", { id: "sync-toast" });
      }

      // Sincronizar carrito
      try {
        const cartResult = await this.syncCart(finalOptions);
        result.syncedItems.cart = cartResult.syncedItems;
        result.conflicts.push(...cartResult.conflicts);
      } catch (error) {
        const apiError = ApiErrorHandler.handleError(error);
        result.errors.push(`Cart sync failed: ${apiError.message}`);
        result.success = false;
      }

      // Sincronizar wishlist
      try {
        const wishlistResult = await this.syncWishlist(finalOptions);
        result.syncedItems.wishlist = wishlistResult.syncedItems;
        result.conflicts.push(...wishlistResult.conflicts);
      } catch (error) {
        const apiError = ApiErrorHandler.handleError(error);
        result.errors.push(`Wishlist sync failed: ${apiError.message}`);
        result.success = false;
      }

      // Manejar conflictos si es necesario
      if (
        result.conflicts.length > 0 &&
        finalOptions.conflictResolution === "manual"
      ) {
        // En una implementación real, aquí se mostraría un modal para resolver conflictos
        console.warn("Conflicts detected during sync:", result.conflicts);
      }

      this.lastSyncTime = new Date();

      if (finalOptions.showNotifications) {
        if (result.success) {
          toast.success(
            `Datos sincronizados: ${result.syncedItems.cart} items del carrito, ${result.syncedItems.wishlist} items de wishlist`,
            { id: "sync-toast" }
          );
        } else {
          toast.error("Error en la sincronización", { id: "sync-toast" });
        }
      }
    } catch (error) {
      const apiError = ApiErrorHandler.handleError(error);
      result.errors.push(apiError.message);
      result.success = false;

      if (finalOptions.showNotifications) {
        toast.error("Error en la sincronización", { id: "sync-toast" });
      }
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  /**
   * Sincroniza el carrito con lógica de merge inteligente
   */
  private async syncCart(options: SyncOptions): Promise<{
    syncedItems: number;
    conflicts: SyncConflict[];
  }> {
    // Obtener datos locales del carrito
    const localCartData = this.getLocalCartData();

    if (!localCartData || localCartData.items.length === 0) {
      return { syncedItems: 0, conflicts: [] };
    }

    const syncData: SyncCartDto = {
      items: localCartData.items.map((item: any) => ({
        productId: item.product.id,
        variantId: item.variantId,
        quantity: item.quantity,
      })),
    };

    const response = await cartApi.syncCart(syncData);

    // Detectar conflictos (items que cambiaron durante el merge)
    const conflicts: SyncConflict[] = [];

    localCartData.items.forEach((localItem: any) => {
      const serverItem = response.items.find(
        (item: any) => item.product.id === localItem.product.id
      );

      if (serverItem && serverItem.quantity !== localItem.quantity) {
        conflicts.push({
          type: "cart",
          item: localItem.product,
          localData: { quantity: localItem.quantity },
          serverData: { quantity: serverItem.quantity },
          resolution: "merge",
        });
      }
    });

    return {
      syncedItems: response.items.length,
      conflicts,
    };
  }

  /**
   * Sincroniza la wishlist con lógica de merge inteligente
   */
  private async syncWishlist(options: SyncOptions): Promise<{
    syncedItems: number;
    conflicts: SyncConflict[];
  }> {
    // Obtener datos locales de la wishlist
    const localWishlistData = this.getLocalWishlistData();

    if (!localWishlistData || localWishlistData.items.length === 0) {
      return { syncedItems: 0, conflicts: [] };
    }

    const syncData: SyncWishlistDto = {
      productIds: localWishlistData.items.map((item: any) => item.id),
    };

    const response = await wishlistApi.syncWishlist(syncData);

    // Para wishlist, los conflictos son menos comunes ya que solo se agregan/eliminan items
    const conflicts: SyncConflict[] = [];

    return {
      syncedItems: response.items.length,
      conflicts,
    };
  }

  /**
   * Programa una sincronización automática
   */
  async scheduleSyncOnLogin(): Promise<void> {
    // Esperar un poco para que las stores se hidraten completamente
    setTimeout(async () => {
      try {
        await this.syncAllData({
          showNotifications: false, // No mostrar notificaciones en login automático
          conflictResolution: "auto",
          autoResolutionStrategy: "merge",
        });
      } catch (error) {
        console.warn("Auto-sync on login failed:", error);
      }
    }, 1000);
  }

  /**
   * Programa sincronización periódica
   */
  startPeriodicSync(intervalMinutes: number = 5): void {
    setInterval(
      async () => {
        if (!this.syncInProgress && this.shouldPerformPeriodicSync()) {
          try {
            await this.syncAllData({
              showNotifications: false,
              conflictResolution: "auto",
              autoResolutionStrategy: "merge",
            });
          } catch (error) {
            console.warn("Periodic sync failed:", error);
          }
        }
      },
      intervalMinutes * 60 * 1000
    );
  }

  /**
   * Agrega una operación a la cola de sincronización
   */
  queueSync(syncOperation: () => Promise<void>): void {
    this.syncQueue.push(syncOperation);
    this.processSyncQueue();
  }

  /**
   * Procesa la cola de sincronización
   */
  private async processSyncQueue(): Promise<void> {
    if (this.syncInProgress || this.syncQueue.length === 0) {
      return;
    }

    const operation = this.syncQueue.shift();
    if (operation) {
      try {
        await operation();
      } catch (error) {
        console.error("Queued sync operation failed:", error);
      }
    }

    // Procesar siguiente operación si hay más
    if (this.syncQueue.length > 0) {
      setTimeout(() => this.processSyncQueue(), 100);
    }
  }

  /**
   * Verifica si debe realizar sincronización periódica
   */
  private shouldPerformPeriodicSync(): boolean {
    if (!this.lastSyncTime) return true;

    const timeSinceLastSync = Date.now() - this.lastSyncTime.getTime();
    const fiveMinutes = 5 * 60 * 1000;

    return timeSinceLastSync > fiveMinutes;
  }

  /**
   * Obtiene datos locales del carrito desde localStorage
   */
  private getLocalCartData(): any {
    try {
      const cartStorage = localStorage.getItem("cart-storage");
      if (cartStorage) {
        const parsed = JSON.parse(cartStorage);
        return parsed.state || parsed;
      }
    } catch (error) {
      console.warn("Failed to get local cart data:", error);
    }
    return null;
  }

  /**
   * Obtiene datos locales de la wishlist desde localStorage
   */
  private getLocalWishlistData(): any {
    try {
      const wishlistStorage = localStorage.getItem("wishlist-storage");
      if (wishlistStorage) {
        const parsed = JSON.parse(wishlistStorage);
        return parsed.state || parsed;
      }
    } catch (error) {
      console.warn("Failed to get local wishlist data:", error);
    }
    return null;
  }

  /**
   * Obtiene el estado actual de sincronización
   */
  getSyncStatus(): {
    inProgress: boolean;
    lastSyncTime: Date | null;
    queueLength: number;
  } {
    return {
      inProgress: this.syncInProgress,
      lastSyncTime: this.lastSyncTime,
      queueLength: this.syncQueue.length,
    };
  }

  /**
   * Fuerza una sincronización inmediata
   */
  async forcSync(): Promise<SyncResult> {
    return this.syncAllData({
      showNotifications: true,
      conflictResolution: "auto",
      autoResolutionStrategy: "merge",
    });
  }
}

// Exportar instancia singleton
export const syncService = SyncService.getInstance();
