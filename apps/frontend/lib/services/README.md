# Synchronization Service

This directory contains the implementation of the data synchronization system between localStorage and the server for the Pixelyte e-commerce platform.

## Overview

The synchronization system ensures that user data (cart and wishlist) remains consistent across devices and sessions, with intelligent conflict resolution and offline support.

## Key Features

### 🔄 Automatic Synchronization

- **Login Sync**: Automatically syncs data when user logs in
- **Periodic Sync**: Background synchronization every 5 minutes
- **Reconnection Sync**: Syncs when internet connection is restored
- **Real-time Sync**: Immediate sync on data changes (when online)

### 🧠 Intelligent Merge Logic

- **Cart Conflicts**: Uses maximum quantity when conflicts occur
- **Wishlist Conflicts**: Merges items from both local and server
- **Data Validation**: Ensures only valid products are synced
- **Stock Verification**: Respects inventory limits during sync

### 📱 Offline Support

- **Local Storage**: All changes saved locally when offline
- **Operation Queue**: Failed operations queued for retry
- **Automatic Retry**: Operations retried when connection restored
- **Graceful Degradation**: App works fully offline with local data

### ⚡ Conflict Resolution

- **Auto Resolution**: Intelligent automatic conflict resolution
- **Manual Resolution**: UI for manual conflict resolution (future)
- **Merge Strategies**: Local, server, or intelligent merge options
- **Conflict Logging**: Detailed logging of all conflicts

## Architecture

```
lib/services/
├── sync.service.ts          # Main synchronization service
├── __tests__/
│   └── sync.service.test.ts # Comprehensive tests
└── README.md               # This documentation

lib/utils/
└── offline-queue.ts        # Offline operation queue

hooks/
└── use-sync.ts            # React hooks for sync functionality

components/sync/
├── sync-status.tsx        # Sync status indicators
└── sync-conflict-modal.tsx # Conflict resolution UI

lib/providers/
└── sync-provider.tsx      # App-level sync provider
```

## Usage

### Basic Setup

```tsx
// In your app provider
import { SyncProvider } from "@/lib/providers/sync-provider";

export default function App({ children }) {
  return (
    <SyncProvider
      autoSyncOnLogin={true}
      periodicSyncInterval={5}
      showSyncNotifications={false}
    >
      {children}
    </SyncProvider>
  );
}
```

### Using Sync Hooks

```tsx
import { useSync, useCartSync, useWishlistSync } from "@/hooks/use-sync";

function MyComponent() {
  // Main sync hook
  const { isLoading, lastSyncTime, sync, forceSync } = useSync();

  // Specific sync hooks
  const { syncCart, isSyncing: cartSyncing } = useCartSync();
  const { syncWishlist, isSyncing: wishlistSyncing } = useWishlistSync();

  return (
    <div>
      <button onClick={forceSync} disabled={isLoading}>
        {isLoading ? "Syncing..." : "Force Sync"}
      </button>

      <p>Last sync: {lastSyncTime?.toLocaleString() || "Never"}</p>
    </div>
  );
}
```

### Sync Status Component

```tsx
import { SyncStatus } from "@/components/sync/sync-status";

function Header() {
  return (
    <header>
      <nav>
        {/* Other nav items */}
        <SyncStatus variant="minimal" />
      </nav>
    </header>
  );
}
```

### Manual Synchronization

```tsx
import { syncService } from "@/lib/services/sync.service";

// Force immediate sync
const result = await syncService.forcSync();

// Sync with custom options
const result = await syncService.syncAllData({
  conflictResolution: "manual",
  showNotifications: true,
  autoResolutionStrategy: "merge",
});
```

## API Reference

### SyncService

The main synchronization service (singleton).

#### Methods

- `syncAllData(options?)`: Sync all user data
- `scheduleSyncOnLogin()`: Schedule sync after login
- `startPeriodicSync(interval)`: Start periodic background sync
- `queueSync(operation)`: Queue a sync operation
- `getSyncStatus()`: Get current sync status
- `forcSync()`: Force immediate sync

#### Options

```typescript
interface SyncOptions {
  conflictResolution: "auto" | "manual";
  autoResolutionStrategy: "local" | "server" | "merge";
  showNotifications: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
}
```

### Hooks

#### useSync(options?)

Main sync hook with full functionality.

```typescript
const {
  isLoading, // boolean: sync in progress
  lastSyncTime, // Date | null: last successful sync
  error, // string | null: last error
  sync, // function: manual sync
  forceSync, // function: force sync with notifications
} = useSync();
```

#### useCartSync()

Cart-specific sync hook.

```typescript
const {
  syncCart, // function: sync cart only
  isSyncing, // boolean: cart sync in progress
  lastSyncTime, // Date | null: last cart sync
} = useCartSync();
```

#### useWishlistSync()

Wishlist-specific sync hook.

```typescript
const {
  syncWishlist, // function: sync wishlist only
  isSyncing, // boolean: wishlist sync in progress
  lastSyncTime, // Date | null: last wishlist sync
} = useWishlistSync();
```

#### useConnectivitySync()

Connectivity-aware sync hook.

```typescript
const {
  isOnline, // boolean: online status
} = useConnectivitySync();
```

### Components

#### SyncStatus

Displays sync status with different variants.

```tsx
<SyncStatus
  variant="minimal" | "detailed" | "button"
  showLastSyncTime={true}
  showForceSync={true}
/>
```

#### SyncConflictModal

Modal for resolving sync conflicts (future feature).

```tsx
<SyncConflictModal
  open={showModal}
  conflicts={conflicts}
  onResolve={handleResolve}
  onResolveAll={handleResolveAll}
/>
```

## Sync Flow

### 1. Login Sync

```
User Login → Auth Store → Schedule Sync → Sync Service → API Calls → Update Stores
```

### 2. Periodic Sync

```
Timer → Check Auth → Check Changes → Sync Service → API Calls → Update Stores
```

### 3. Offline Operations

```
User Action → Store Update → API Call Fails → Queue Operation → Connection Restored → Process Queue
```

### 4. Conflict Resolution

```
Sync Request → Compare Data → Detect Conflicts → Apply Resolution → Update Stores → Notify User
```

## Conflict Resolution Strategies

### Cart Conflicts

- **Quantity Conflicts**: Use maximum quantity between local and server
- **Item Conflicts**: Merge items, keeping all unique products
- **Stock Validation**: Respect inventory limits during merge

### Wishlist Conflicts

- **Item Conflicts**: Union of local and server items
- **Duplicate Handling**: Remove duplicates based on product ID
- **Availability Check**: Remove unavailable products

### Resolution Options

- **Auto (Merge)**: Intelligent automatic resolution (default)
- **Local**: Always prefer local data
- **Server**: Always prefer server data
- **Manual**: Show UI for user to choose (future feature)

## Error Handling

### Network Errors

- Operations queued for retry when connection restored
- Local data preserved during network failures
- User notified about offline status

### API Errors

- Detailed error logging and reporting
- Graceful fallback to local data
- Retry logic with exponential backoff

### Data Validation Errors

- Invalid products filtered out during sync
- Stock limits respected
- User notified about data issues

## Performance Considerations

### Optimization Strategies

- **Debounced Sync**: Prevent excessive API calls
- **Incremental Sync**: Only sync changed data
- **Background Processing**: Non-blocking sync operations
- **Queue Management**: Limit queue size and retry attempts

### Memory Management

- **Cleanup**: Remove old sync data and logs
- **Storage Limits**: Respect localStorage size limits
- **Garbage Collection**: Clean up expired operations

## Testing

The sync service includes comprehensive tests covering:

- ✅ Successful sync scenarios
- ✅ Network failure handling
- ✅ Conflict detection and resolution
- ✅ Concurrent sync prevention
- ✅ Queue management
- ✅ Error scenarios

Run tests with:

```bash
npm test lib/services/__tests__/sync.service.test.ts
```

## Future Enhancements

### Planned Features

- **Real-time Sync**: WebSocket-based real-time synchronization
- **Conflict UI**: Manual conflict resolution interface
- **Sync Analytics**: Detailed sync performance metrics
- **Selective Sync**: Choose what data to sync
- **Sync History**: View sync operation history

### Performance Improvements

- **Delta Sync**: Only sync changed fields
- **Compression**: Compress sync payloads
- **Caching**: Cache sync results
- **Batching**: Batch multiple operations

## Troubleshooting

### Common Issues

#### Sync Not Working

1. Check internet connection
2. Verify user authentication
3. Check browser console for errors
4. Clear localStorage and retry

#### Data Not Syncing

1. Check sync status component
2. Force manual sync
3. Verify API endpoints are working
4. Check for JavaScript errors

#### Conflicts Not Resolving

1. Check conflict resolution strategy
2. Verify data format consistency
3. Clear local data and re-sync
4. Check server-side merge logic

### Debug Mode

Enable debug mode in development:

```tsx
<SyncProvider showSyncNotifications={true}>{children}</SyncProvider>
```

This will show detailed sync information and debug UI.

## Contributing

When contributing to the sync system:

1. **Test Coverage**: Ensure all new features have tests
2. **Error Handling**: Handle all possible error scenarios
3. **Performance**: Consider impact on app performance
4. **Documentation**: Update this README for new features
5. **Backward Compatibility**: Maintain compatibility with existing data

## License

This synchronization system is part of the Pixelyte e-commerce platform.
