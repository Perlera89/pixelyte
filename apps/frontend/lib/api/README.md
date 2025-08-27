# Frontend API Integration

This directory contains the complete API integration layer for the Pixelyte frontend application. The integration includes API services, React Query hooks, error handling, and Zustand store updates.

## Architecture Overview

```
lib/api/
├── products.ts      # Products API service
├── cart.ts          # Cart API service
├── wishlist.ts      # Wishlist API service
├── orders.ts        # Orders API service
├── users.ts         # Users API service
├── error-handler.ts # Centralized error handling
└── index.ts         # API exports

hooks/
├── use-products.ts  # Product-related hooks
├── use-cart.ts      # Cart-related hooks
├── use-wishlist.ts  # Wishlist-related hooks
├── use-orders.ts    # Order-related hooks
├── use-users.ts     # User-related hooks
└── use-auth-sync.ts # Authentication sync hook

stores/
├── auth-store.ts    # Updated with sync functionality
├── cart-store.ts    # Updated with API integration
└── wishlist-store.ts # Updated with API integration
```

## Features

### 1. API Services

- **Type-safe API calls** with TypeScript interfaces
- **Consistent error handling** across all services
- **Request/response DTOs** for data validation
- **Automatic token management** via Axios interceptors

### 2. React Query Integration

- **Caching and synchronization** for optimal performance
- **Optimistic updates** for better UX
- **Automatic retries** with smart retry logic
- **Background refetching** to keep data fresh
- **Infinite queries** for pagination

### 3. Enhanced Zustand Stores

- **API integration** with loading states
- **Offline support** with local fallbacks
- **Automatic synchronization** on login
- **Error handling** with user feedback
- **Optimistic updates** for immediate feedback

### 4. Error Handling

- **Centralized error processing** with ApiErrorHandler
- **User-friendly error messages** with toast notifications
- **Automatic retry logic** for network errors
- **Authentication error handling** with auto-redirect

## Usage Examples

### Using API Hooks

```tsx
import { useProducts, useAddToCart } from "@/hooks";

function ProductList() {
  const {
    data: products,
    isLoading,
    error,
  } = useProducts({
    category: "electronics",
    page: 1,
    limit: 12,
  });

  const addToCartMutation = useAddToCart();

  const handleAddToCart = (product: Product) => {
    addToCartMutation.mutate({
      productId: product.id,
      quantity: 1,
    });
  };

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div>
      {products?.products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={() => handleAddToCart(product)}
        />
      ))}
    </div>
  );
}
```

### Using Zustand Stores

```tsx
import { useCartStore } from "@/lib/stores/cart-store";

function CartComponent() {
  const { items, isLoading, addItem, removeItem, getTotalPrice } =
    useCartStore();

  return (
    <div>
      {isLoading && <LoadingSpinner />}
      {items.map((item) => (
        <CartItem
          key={item.id}
          item={item}
          onRemove={() => removeItem(item.id)}
        />
      ))}
      <div>Total: ${getTotalPrice()}</div>
    </div>
  );
}
```

### Error Handling

```tsx
import { useErrorHandler } from "@/lib/api/error-handler";

function MyComponent() {
  const { handleError } = useErrorHandler();

  const handleApiCall = async () => {
    try {
      await someApiCall();
    } catch (error) {
      const apiError = handleError(error);
      // Error is automatically shown as toast
      // and auth redirects are handled
    }
  };
}
```

## API Endpoints

### Products

- `GET /products` - List products with filters
- `GET /products/featured` - Get featured products
- `GET /products/:id` - Get product details
- `GET /products/:id/related` - Get related products
- `GET /products/search` - Search products

### Cart

- `GET /cart` - Get user's cart
- `POST /cart/items` - Add item to cart
- `PUT /cart/items/:id` - Update cart item
- `DELETE /cart/items/:id` - Remove cart item
- `DELETE /cart` - Clear cart
- `POST /cart/sync` - Sync local cart with server

### Wishlist

- `GET /wishlist` - Get user's wishlist
- `POST /wishlist/items` - Add item to wishlist
- `DELETE /wishlist/items/:productId` - Remove from wishlist
- `DELETE /wishlist` - Clear wishlist
- `POST /wishlist/sync` - Sync local wishlist with server

### Orders

- `POST /orders` - Create new order
- `GET /orders` - Get user's orders
- `GET /orders/:id` - Get order details

### Users

- `GET /users/profile` - Get user profile
- `PUT /users/profile` - Update user profile
- `PUT /users/password` - Change password
- `GET /users/addresses` - Get user addresses
- `POST /users/addresses` - Create address
- `PUT /users/addresses/:id` - Update address
- `DELETE /users/addresses/:id` - Delete address

## Configuration

### React Query Setup

The QueryProvider is configured with:

- **Stale time**: 1 minute for queries
- **Cache time**: 5 minutes for queries
- **Retry logic**: Smart retries based on error type
- **Retry delays**: Exponential backoff

### Axios Configuration

- **Base URL**: http://localhost:4000/
- **Timeout**: 10 seconds
- **Automatic token injection** from auth store
- **Response interceptors** for error handling

## Loading States

All API operations include comprehensive loading states:

- `isLoading` - Initial data loading
- `isAddingItem` - Adding items to cart/wishlist
- `isUpdatingItem` - Updating quantities
- `isRemovingItem` - Removing items
- `isSyncing` - Synchronizing with server

## Offline Support

The stores provide offline functionality:

- **Local storage persistence** for cart and wishlist
- **Automatic sync** when connection is restored
- **Fallback to local operations** when API fails
- **User feedback** about offline state

## Error Recovery

- **Automatic retries** for network errors
- **Exponential backoff** for retry delays
- **User-friendly error messages** with actionable advice
- **Graceful degradation** to offline mode
- **Error boundaries** to prevent app crashes

## Performance Optimizations

- **Request deduplication** via React Query
- **Background updates** to keep data fresh
- **Optimistic updates** for immediate feedback
- **Selective cache invalidation** to minimize refetches
- **Infinite queries** for efficient pagination

## Testing

The API integration includes:

- **Type safety** with TypeScript
- **Error simulation** for testing error states
- **Mock data support** for development
- **Loading state testing** with React Query devtools

## Migration Guide

To migrate existing components to use the new API integration:

1. **Replace direct API calls** with React Query hooks
2. **Update loading states** to use the new loading properties
3. **Add error handling** using the error handler utility
4. **Update stores** to use the new API-integrated versions
5. **Add optimistic updates** for better UX

## Best Practices

1. **Always handle loading states** in your components
2. **Use optimistic updates** for immediate feedback
3. **Implement proper error boundaries** to catch errors
4. **Leverage caching** to minimize API calls
5. **Use TypeScript interfaces** for type safety
6. **Test offline scenarios** to ensure graceful degradation
7. **Monitor performance** with React Query devtools
