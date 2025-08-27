/**
 * Utility for managing offline operations queue
 * Stores operations in localStorage and executes them when online
 */

export interface QueuedOperation {
  id: string;
  type: "cart" | "wishlist";
  action: "add" | "remove" | "update" | "clear";
  data: any;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface OperationResult {
  success: boolean;
  error?: string;
  data?: any;
}

class OfflineQueue {
  private static instance: OfflineQueue;
  private readonly STORAGE_KEY = "offline-operations-queue";
  private readonly MAX_QUEUE_SIZE = 100;
  private readonly MAX_RETRIES = 3;
  private isProcessing = false;

  static getInstance(): OfflineQueue {
    if (!OfflineQueue.instance) {
      OfflineQueue.instance = new OfflineQueue();
    }
    return OfflineQueue.instance;
  }

  /**
   * Agrega una operación a la cola
   */
  enqueue(
    operation: Omit<
      QueuedOperation,
      "id" | "timestamp" | "retryCount" | "maxRetries"
    >
  ): void {
    const queue = this.getQueue();

    // Limitar el tamaño de la cola
    if (queue.length >= this.MAX_QUEUE_SIZE) {
      // Remover las operaciones más antiguas
      queue.splice(0, queue.length - this.MAX_QUEUE_SIZE + 1);
    }

    const queuedOperation: QueuedOperation = {
      ...operation,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.MAX_RETRIES,
    };

    queue.push(queuedOperation);
    this.saveQueue(queue);

    // Intentar procesar inmediatamente si estamos online
    if (navigator.onLine) {
      this.processQueue();
    }
  }

  /**
   * Procesa todas las operaciones en la cola
   */
  async processQueue(): Promise<void> {
    if (this.isProcessing || !navigator.onLine) {
      return;
    }

    this.isProcessing = true;
    const queue = this.getQueue();
    const processedOperations: string[] = [];
    const failedOperations: QueuedOperation[] = [];

    try {
      for (const operation of queue) {
        try {
          const result = await this.executeOperation(operation);

          if (result.success) {
            processedOperations.push(operation.id);
          } else {
            // Incrementar contador de reintentos
            operation.retryCount++;

            if (operation.retryCount < operation.maxRetries) {
              failedOperations.push(operation);
            } else {
              // Operación falló demasiadas veces, descartarla
              console.warn(
                `Operation ${operation.id} failed after ${operation.maxRetries} retries:`,
                result.error
              );
              processedOperations.push(operation.id); // Marcar como procesada para eliminarla
            }
          }
        } catch (error) {
          console.error(`Error executing operation ${operation.id}:`, error);
          operation.retryCount++;

          if (operation.retryCount < operation.maxRetries) {
            failedOperations.push(operation);
          } else {
            processedOperations.push(operation.id);
          }
        }
      }

      // Actualizar la cola: remover operaciones exitosas y mantener las fallidas
      const updatedQueue = failedOperations;
      this.saveQueue(updatedQueue);
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Ejecuta una operación específica
   */
  private async executeOperation(
    operation: QueuedOperation
  ): Promise<OperationResult> {
    try {
      switch (operation.type) {
        case "cart":
          return await this.executeCartOperation(operation);
        case "wishlist":
          return await this.executeWishlistOperation(operation);
        default:
          return {
            success: false,
            error: `Unknown operation type: ${operation.type}`,
          };
      }
    } catch (error: any) {
      return { success: false, error: error.message || "Operation failed" };
    }
  }

  /**
   * Ejecuta operaciones del carrito
   */
  private async executeCartOperation(
    operation: QueuedOperation
  ): Promise<OperationResult> {
    const { cartApi } = await import("@/lib/api/cart");

    try {
      switch (operation.action) {
        case "add":
          await cartApi.addItem(operation.data);
          return { success: true };

        case "update":
          await cartApi.updateItem(operation.data.itemId, {
            quantity: operation.data.quantity,
          });
          return { success: true };

        case "remove":
          await cartApi.removeItem(operation.data.itemId);
          return { success: true };

        case "clear":
          await cartApi.clearCart();
          return { success: true };

        default:
          return {
            success: false,
            error: `Unknown cart action: ${operation.action}`,
          };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Ejecuta operaciones de la wishlist
   */
  private async executeWishlistOperation(
    operation: QueuedOperation
  ): Promise<OperationResult> {
    const { wishlistApi } = await import("@/lib/api/wishlist");

    try {
      switch (operation.action) {
        case "add":
          await wishlistApi.addItem(operation.data);
          return { success: true };

        case "remove":
          await wishlistApi.removeItem(operation.data.productId);
          return { success: true };

        case "clear":
          await wishlistApi.clearWishlist();
          return { success: true };

        default:
          return {
            success: false,
            error: `Unknown wishlist action: ${operation.action}`,
          };
      }
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtiene la cola desde localStorage
   */
  private getQueue(): QueuedOperation[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn("Failed to load offline queue:", error);
      return [];
    }
  }

  /**
   * Guarda la cola en localStorage
   */
  private saveQueue(queue: QueuedOperation[]): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(queue));
    } catch (error) {
      console.warn("Failed to save offline queue:", error);
    }
  }

  /**
   * Genera un ID único para la operación
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Obtiene el estado actual de la cola
   */
  getQueueStatus(): {
    length: number;
    isProcessing: boolean;
    operations: QueuedOperation[];
  } {
    return {
      length: this.getQueue().length,
      isProcessing: this.isProcessing,
      operations: this.getQueue(),
    };
  }

  /**
   * Limpia toda la cola
   */
  clearQueue(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Elimina operaciones específicas de la cola
   */
  removeOperations(operationIds: string[]): void {
    const queue = this.getQueue();
    const filteredQueue = queue.filter((op) => !operationIds.includes(op.id));
    this.saveQueue(filteredQueue);
  }

  /**
   * Inicia el procesamiento automático cuando se recupera la conexión
   */
  startAutoProcessing(): void {
    // Procesar cola cuando se recupera la conexión
    window.addEventListener("online", () => {
      setTimeout(() => this.processQueue(), 1000);
    });

    // Procesar cola periódicamente si hay operaciones pendientes
    setInterval(() => {
      if (navigator.onLine && this.getQueue().length > 0) {
        this.processQueue();
      }
    }, 30000); // Cada 30 segundos
  }
}

// Exportar instancia singleton
export const offlineQueue = OfflineQueue.getInstance();

// Iniciar procesamiento automático
if (typeof window !== "undefined") {
  offlineQueue.startAutoProcessing();
}

// Hook para usar la cola offline
export function useOfflineQueue() {
  const enqueueCartOperation = (
    action: "add" | "remove" | "update" | "clear",
    data: any
  ) => {
    offlineQueue.enqueue({
      type: "cart",
      action,
      data,
    });
  };

  const enqueueWishlistOperation = (
    action: "add" | "remove" | "clear",
    data: any
  ) => {
    offlineQueue.enqueue({
      type: "wishlist",
      action,
      data,
    });
  };

  const processQueue = () => {
    return offlineQueue.processQueue();
  };

  const getQueueStatus = () => {
    return offlineQueue.getQueueStatus();
  };

  const clearQueue = () => {
    offlineQueue.clearQueue();
  };

  return {
    enqueueCartOperation,
    enqueueWishlistOperation,
    processQueue,
    getQueueStatus,
    clearQueue,
  };
}
