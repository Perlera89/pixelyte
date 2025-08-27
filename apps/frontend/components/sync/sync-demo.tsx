"use client";

import React, { useState } from "react";
import {
  useSync,
  useCartSync,
  useWishlistSync,
  useConnectivitySync,
} from "@/hooks/use-sync";
import { useSyncContext } from "@/lib/providers/sync-provider";
import { useOfflineQueue } from "@/lib/utils/offline-queue";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  RefreshCw,
  Wifi,
  WifiOff,
  ShoppingCart,
  Heart,
  Clock,
  CheckCircle,
  AlertCircle,
  Queue,
} from "lucide-react";

/**
 * Demo component to showcase synchronization functionality
 * This component demonstrates all the sync features implemented
 */
export function SyncDemo() {
  const [showDetails, setShowDetails] = useState(false);

  // Main sync hooks
  const {
    isLoading: mainSyncLoading,
    lastSyncTime,
    error: mainSyncError,
    sync,
    forceSync,
  } = useSync();

  // Specific sync hooks
  const {
    syncCart,
    isSyncing: cartSyncing,
    lastSyncTime: cartLastSync,
  } = useCartSync();
  const {
    syncWishlist,
    isSyncing: wishlistSyncing,
    lastSyncTime: wishlistLastSync,
  } = useWishlistSync();

  // Connectivity hook
  const { isOnline } = useConnectivitySync();

  // Context hook
  const syncContext = useSyncContext();

  // Offline queue hook
  const { getQueueStatus, processQueue, clearQueue } = useOfflineQueue();
  const queueStatus = getQueueStatus();

  const handleForceSync = async () => {
    try {
      await forceSync();
    } catch (error) {
      console.error("Force sync failed:", error);
    }
  };

  const handleCartSync = async () => {
    try {
      await syncCart();
    } catch (error) {
      console.error("Cart sync failed:", error);
    }
  };

  const handleWishlistSync = async () => {
    try {
      await syncWishlist();
    } catch (error) {
      console.error("Wishlist sync failed:", error);
    }
  };

  const handleProcessQueue = async () => {
    try {
      await processQueue();
    } catch (error) {
      console.error("Queue processing failed:", error);
    }
  };

  const formatTime = (date: Date | null) => {
    if (!date) return "Never";
    return date.toLocaleTimeString();
  };

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Sync System Demo</h1>
        <p className="text-muted-foreground">
          Demonstration of the data synchronization system between localStorage
          and server
        </p>
      </div>

      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isOnline ? (
              <Wifi className="h-5 w-5 text-green-500" />
            ) : (
              <WifiOff className="h-5 w-5 text-red-500" />
            )}
            Connection Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Badge variant={isOnline ? "secondary" : "destructive"}>
            {isOnline ? "Online" : "Offline"}
          </Badge>
          {!isOnline && (
            <p className="text-sm text-muted-foreground mt-2">
              Changes will be saved locally and synced when connection is
              restored.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Main Sync Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw
              className={`h-5 w-5 ${mainSyncLoading ? "animate-spin" : ""}`}
            />
            Main Sync Status
          </CardTitle>
          <CardDescription>
            Overall synchronization status for all data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Status:</span>
            <Badge
              variant={
                mainSyncLoading
                  ? "secondary"
                  : mainSyncError
                    ? "destructive"
                    : "secondary"
              }
            >
              {mainSyncLoading
                ? "Syncing..."
                : mainSyncError
                  ? "Error"
                  : "Ready"}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span>Last Sync:</span>
            <span className="text-sm text-muted-foreground">
              {formatTime(lastSyncTime)}
            </span>
          </div>

          {mainSyncError && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              {mainSyncError}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={sync}
              disabled={mainSyncLoading || !isOnline}
              variant="outline"
              size="sm"
            >
              {mainSyncLoading ? "Syncing..." : "Sync"}
            </Button>
            <Button
              onClick={handleForceSync}
              disabled={mainSyncLoading || !isOnline}
              size="sm"
            >
              Force Sync
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Individual Sync Status */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Cart Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-blue-500" />
              Cart Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge variant={cartSyncing ? "secondary" : "secondary"}>
                {cartSyncing ? "Syncing..." : "Ready"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Last Sync:</span>
              <span className="text-sm text-muted-foreground">
                {formatTime(cartLastSync)}
              </span>
            </div>

            <Button
              onClick={handleCartSync}
              disabled={cartSyncing || !isOnline}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {cartSyncing ? "Syncing..." : "Sync Cart"}
            </Button>
          </CardContent>
        </Card>

        {/* Wishlist Sync */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              Wishlist Sync
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span>Status:</span>
              <Badge variant={wishlistSyncing ? "secondary" : "secondary"}>
                {wishlistSyncing ? "Syncing..." : "Ready"}
              </Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Last Sync:</span>
              <span className="text-sm text-muted-foreground">
                {formatTime(wishlistLastSync)}
              </span>
            </div>

            <Button
              onClick={handleWishlistSync}
              disabled={wishlistSyncing || !isOnline}
              variant="outline"
              size="sm"
              className="w-full"
            >
              {wishlistSyncing ? "Syncing..." : "Sync Wishlist"}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Offline Queue Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Queue className="h-5 w-5 text-orange-500" />
            Offline Queue
          </CardTitle>
          <CardDescription>
            Operations queued for when connection is restored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Queue Length:</span>
            <Badge variant={queueStatus.length > 0 ? "secondary" : "outline"}>
              {queueStatus.length} operations
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span>Processing:</span>
            <Badge variant={queueStatus.isProcessing ? "secondary" : "outline"}>
              {queueStatus.isProcessing ? "Yes" : "No"}
            </Badge>
          </div>

          {queueStatus.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Queued Operations:</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {queueStatus.operations.slice(0, 5).map((op, index) => (
                  <div key={op.id} className="text-xs bg-muted p-2 rounded">
                    <div className="flex items-center justify-between">
                      <span>
                        {op.type} - {op.action}
                      </span>
                      <span className="text-muted-foreground">
                        Retry: {op.retryCount}/{op.maxRetries}
                      </span>
                    </div>
                  </div>
                ))}
                {queueStatus.operations.length > 5 && (
                  <div className="text-xs text-muted-foreground text-center">
                    ... and {queueStatus.operations.length - 5} more
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleProcessQueue}
              disabled={
                queueStatus.isProcessing ||
                !isOnline ||
                queueStatus.length === 0
              }
              variant="outline"
              size="sm"
            >
              Process Queue
            </Button>
            <Button
              onClick={clearQueue}
              disabled={queueStatus.length === 0}
              variant="destructive"
              size="sm"
            >
              Clear Queue
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Advanced Details
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? "Hide" : "Show"}
            </Button>
          </CardTitle>
        </CardHeader>
        {showDetails && (
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium mb-2">Sync Context</h4>
                <div className="space-y-1">
                  <div>Loading: {syncContext.isLoading ? "Yes" : "No"}</div>
                  <div>Last Sync: {formatTime(syncContext.lastSyncTime)}</div>
                  <div>Error: {syncContext.error || "None"}</div>
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Local Storage</h4>
                <div className="space-y-1">
                  <div>
                    Cart Data:{" "}
                    {localStorage.getItem("cart-storage") ? "Present" : "Empty"}
                  </div>
                  <div>
                    Wishlist Data:{" "}
                    {localStorage.getItem("wishlist-storage")
                      ? "Present"
                      : "Empty"}
                  </div>
                  <div>
                    Auth Data:{" "}
                    {localStorage.getItem("auth-storage") ? "Present" : "Empty"}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h4 className="font-medium mb-2">Sync Features Implemented</h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Automatic login sync
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Periodic background sync
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Intelligent merge logic
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Offline operation queue
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Conflict detection
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Connectivity awareness
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Custom sync hooks
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  Retry mechanisms
                </div>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>
            1. <strong>Login:</strong> Automatic sync should trigger when you
            log in
          </p>
          <p>
            2. <strong>Add to Cart/Wishlist:</strong> Items sync immediately
            when online
          </p>
          <p>
            3. <strong>Go Offline:</strong> Disable network and make changes -
            they'll be queued
          </p>
          <p>
            4. <strong>Go Online:</strong> Re-enable network and watch queued
            operations process
          </p>
          <p>
            5. <strong>Force Sync:</strong> Use the buttons above to manually
            trigger sync
          </p>
          <p>
            6. <strong>Multiple Devices:</strong> Make changes on different
            devices to see conflict resolution
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
