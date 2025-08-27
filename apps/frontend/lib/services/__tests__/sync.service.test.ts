import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { SyncService } from "../sync.service";
import { cartApi } from "@/lib/api/cart";
import { wishlistApi } from "@/lib/api/wishlist";

// Mock APIs
vi.mock("@/lib/api/cart", () => ({
  cartApi: {
    syncCart: vi.fn(),
  },
}));

vi.mock("@/lib/api/wishlist", () => ({
  wishlistApi: {
    syncWishlist: vi.fn(),
  },
}));

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
});

// Mock toast
vi.mock("sonner", () => ({
  toast: {
    loading: vi.fn(),
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
    dismiss: vi.fn(),
  },
}));

describe("SyncService", () => {
  let syncService: SyncService;

  beforeEach(() => {
    syncService = SyncService.getInstance();
    vi.clearAllMocks();
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("syncAllData", () => {
    it("should sync both cart and wishlist successfully", async () => {
      // Mock local data
      localStorageMock.getItem
        .mockReturnValueOnce(
          JSON.stringify({
            state: {
              items: [
                { product: { id: "1" }, quantity: 2 },
                { product: { id: "2" }, quantity: 1 },
              ],
            },
          })
        ) // cart-storage
        .mockReturnValueOnce(
          JSON.stringify({
            state: {
              items: [{ id: "1" }, { id: "3" }],
            },
          })
        ); // wishlist-storage

      // Mock API responses
      const mockCartResponse = {
        items: [
          { product: { id: "1" }, quantity: 2 },
          { product: { id: "2" }, quantity: 1 },
        ],
      };

      const mockWishlistResponse = {
        items: [{ id: "1" }, { id: "3" }],
      };

      vi.mocked(cartApi.syncCart).mockResolvedValue(mockCartResponse);
      vi.mocked(wishlistApi.syncWishlist).mockResolvedValue(
        mockWishlistResponse
      );

      const result = await syncService.syncAllData();

      expect(result.success).toBe(true);
      expect(result.syncedItems.cart).toBe(2);
      expect(result.syncedItems.wishlist).toBe(2);
      expect(result.errors).toHaveLength(0);
      expect(cartApi.syncCart).toHaveBeenCalledWith({
        items: [
          { productId: "1", variantId: undefined, quantity: 2 },
          { productId: "2", variantId: undefined, quantity: 1 },
        ],
      });
      expect(wishlistApi.syncWishlist).toHaveBeenCalledWith({
        productIds: ["1", "3"],
      });
    });

    it("should handle cart sync failure gracefully", async () => {
      // Mock local data
      localStorageMock.getItem
        .mockReturnValueOnce(
          JSON.stringify({
            state: { items: [{ product: { id: "1" }, quantity: 1 }] },
          })
        )
        .mockReturnValueOnce(
          JSON.stringify({
            state: { items: [{ id: "1" }] },
          })
        );

      // Mock cart API failure
      vi.mocked(cartApi.syncCart).mockRejectedValue(new Error("Network error"));
      vi.mocked(wishlistApi.syncWishlist).mockResolvedValue({
        items: [{ id: "1" }],
      });

      const result = await syncService.syncAllData();

      expect(result.success).toBe(false);
      expect(result.errors).toContain("Cart sync failed: Network error");
      expect(result.syncedItems.wishlist).toBe(1);
    });

    it("should detect conflicts in cart sync", async () => {
      // Mock local data with different quantities
      localStorageMock.getItem
        .mockReturnValueOnce(
          JSON.stringify({
            state: {
              items: [{ product: { id: "1" }, quantity: 3 }],
            },
          })
        )
        .mockReturnValueOnce(null); // No wishlist data

      // Mock server response with different quantity
      const mockCartResponse = {
        items: [
          { product: { id: "1" }, quantity: 5 }, // Different quantity
        ],
      };

      vi.mocked(cartApi.syncCart).mockResolvedValue(mockCartResponse);

      const result = await syncService.syncAllData();

      expect(result.success).toBe(true);
      expect(result.conflicts).toHaveLength(1);
      expect(result.conflicts[0]).toMatchObject({
        type: "cart",
        localData: { quantity: 3 },
        serverData: { quantity: 5 },
        resolution: "merge",
      });
    });

    it("should handle empty local data", async () => {
      // Mock empty local data
      localStorageMock.getItem
        .mockReturnValueOnce(null) // No cart data
        .mockReturnValueOnce(null); // No wishlist data

      const result = await syncService.syncAllData();

      expect(result.success).toBe(true);
      expect(result.syncedItems.cart).toBe(0);
      expect(result.syncedItems.wishlist).toBe(0);
      expect(cartApi.syncCart).not.toHaveBeenCalled();
      expect(wishlistApi.syncWishlist).not.toHaveBeenCalled();
    });

    it("should prevent concurrent sync operations", async () => {
      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          state: { items: [{ product: { id: "1" }, quantity: 1 }] },
        })
      );

      vi.mocked(cartApi.syncCart).mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(() => resolve({ items: [] }), 100)
          )
      );

      // Start first sync
      const firstSync = syncService.syncAllData();

      // Try to start second sync immediately
      const secondSync = syncService.syncAllData();

      const [firstResult, secondResult] = await Promise.all([
        firstSync,
        secondSync,
      ]);

      expect(firstResult.success).toBe(true);
      expect(secondResult.success).toBe(false);
      expect(secondResult.errors).toContain("Sync already in progress");
    });
  });

  describe("scheduleSyncOnLogin", () => {
    it("should schedule sync after delay", async () => {
      vi.useFakeTimers();

      localStorageMock.getItem.mockReturnValue(
        JSON.stringify({
          state: { items: [] },
        })
      );

      const syncSpy = vi.spyOn(syncService, "syncAllData").mockResolvedValue({
        success: true,
        conflicts: [],
        syncedItems: { cart: 0, wishlist: 0 },
        errors: [],
      });

      syncService.scheduleSyncOnLogin();

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      await vi.runAllTimersAsync();

      expect(syncSpy).toHaveBeenCalledWith({
        showNotifications: false,
        conflictResolution: "auto",
        autoResolutionStrategy: "merge",
      });

      vi.useRealTimers();
    });
  });

  describe("getSyncStatus", () => {
    it("should return current sync status", () => {
      const status = syncService.getSyncStatus();

      expect(status).toHaveProperty("inProgress");
      expect(status).toHaveProperty("lastSyncTime");
      expect(status).toHaveProperty("queueLength");
      expect(typeof status.inProgress).toBe("boolean");
      expect(typeof status.queueLength).toBe("number");
    });
  });

  describe("queue operations", () => {
    it("should queue sync operations", () => {
      const mockOperation = vi.fn().mockResolvedValue(undefined);

      syncService.queueSync(mockOperation);

      const status = syncService.getSyncStatus();
      expect(status.queueLength).toBeGreaterThan(0);
    });
  });
});

describe("SyncService integration", () => {
  it("should handle real-world sync scenario", async () => {
    const syncService = SyncService.getInstance();

    // Mock realistic local data
    localStorageMock.getItem
      .mockReturnValueOnce(
        JSON.stringify({
          state: {
            items: [
              {
                product: { id: "product-1", name: "Test Product" },
                quantity: 2,
              },
              {
                product: { id: "product-2", name: "Another Product" },
                quantity: 1,
              },
            ],
          },
        })
      )
      .mockReturnValueOnce(
        JSON.stringify({
          state: {
            items: [
              { id: "product-1", name: "Test Product" },
              { id: "product-3", name: "Wishlist Product" },
            ],
          },
        })
      );

    // Mock API responses
    vi.mocked(cartApi.syncCart).mockResolvedValue({
      items: [
        { product: { id: "product-1" }, quantity: 3 }, // Conflict: local=2, server=3
        { product: { id: "product-2" }, quantity: 1 },
        { product: { id: "product-4" }, quantity: 1 }, // New item from server
      ],
    });

    vi.mocked(wishlistApi.syncWishlist).mockResolvedValue({
      items: [
        { id: "product-1" },
        { id: "product-3" },
        { id: "product-5" }, // New item from server
      ],
    });

    const result = await syncService.syncAllData({
      showNotifications: true,
      conflictResolution: "auto",
      autoResolutionStrategy: "merge",
    });

    expect(result.success).toBe(true);
    expect(result.syncedItems.cart).toBe(3);
    expect(result.syncedItems.wishlist).toBe(3);
    expect(result.conflicts).toHaveLength(1); // One cart conflict
    expect(result.conflicts[0].type).toBe("cart");
  });
});
