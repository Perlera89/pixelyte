# Cart Module - API Documentation

## Overview

The Cart module provides comprehensive cart management functionality with persistent storage, user authentication, and intelligent synchronization between local storage and server-side data.

## Features

- ✅ **User-specific persistent carts** - Each authenticated user has their own cart
- ✅ **Stock validation** - Prevents adding items with insufficient inventory
- ✅ **Cart synchronization** - Merge local cart data with server cart on login
- ✅ **Intelligent merging** - Smart conflict resolution when syncing carts
- ✅ **Real-time inventory checks** - Validates stock availability on every operation
- ✅ **Comprehensive error handling** - Detailed error messages for all scenarios
- ✅ **Backward compatibility** - Legacy endpoints still supported

## API Endpoints

### User-Specific Cart Endpoints (Authenticated)

All these endpoints require JWT authentication via `Authorization: Bearer <token>` header.

#### GET `/cart`

Get the authenticated user's cart.

**Response:**

```json
{
  "id": "cart-uuid",
  "items": [
    {
      "id": "item-uuid",
      "variantId": "variant-uuid",
      "quantity": 2,
      "price": 99.99,
      "total": 199.98,
      "properties": {},
      "product": {
        "id": "product-uuid",
        "name": "Product Name",
        "slug": "product-slug",
        "image": "image-url",
        "brand": "Brand Name"
      },
      "variant": {
        "id": "variant-uuid",
        "title": "Variant Title",
        "sku": "SKU123",
        "inventoryQuantity": 10,
        "inventoryPolicy": "DENY"
      }
    }
  ],
  "totalItems": 2,
  "subtotal": 199.98,
  "currency": "USD",
  "createdAt": "2024-01-01T00:00:00Z",
  "updatedAt": "2024-01-01T00:00:00Z"
}
```

#### POST `/cart/items`

Add an item to the user's cart.

**Request Body:**

```json
{
  "variantId": "variant-uuid",
  "quantity": 2,
  "properties": {} // optional
}
```

**Validation:**

- `variantId`: Required, must be a valid product variant ID
- `quantity`: Required, integer between 1 and 99
- `properties`: Optional, JSON object for custom properties

**Response:** Returns the created/updated cart item.

**Error Cases:**

- `400`: Invalid data, insufficient stock, or product not available
- `401`: User not authenticated
- `404`: Product variant not found

#### PATCH `/cart/items/:itemId`

Update an item in the user's cart.

**Request Body:**

```json
{
  "quantity": 3,
  "properties": {} // optional
}
```

**Response:** Returns the updated cart item.

**Error Cases:**

- `400`: Invalid quantity or insufficient stock
- `401`: User not authenticated
- `403`: Item doesn't belong to user
- `404`: Item not found

#### DELETE `/cart/items/:itemId`

Remove an item from the user's cart.

**Response:**

```json
{
  "message": "Item eliminado exitosamente"
}
```

#### DELETE `/cart/clear`

Remove all items from the user's cart.

**Response:**

```json
{
  "message": "Carrito vaciado exitosamente"
}
```

#### POST `/cart/sync`

Synchronize local cart data with server cart. This endpoint implements intelligent merging logic.

**Request Body:**

```json
{
  "items": [
    {
      "variantId": "variant-uuid",
      "quantity": 2,
      "properties": {}
    }
  ]
}
```

**Sync Logic:**

1. For items that exist in both local and server: use the higher quantity
2. For items only in local: add to server cart
3. For items only in server: keep in server cart
4. Validate stock availability for all items
5. Skip invalid/inactive products

**Response:**

```json
{
  "cartId": "cart-uuid",
  "items": [...], // merged items
  "totalItems": 5,
  "subtotal": 299.95,
  "currency": "USD",
  "message": "Carrito sincronizado exitosamente"
}
```

### Legacy Endpoints (Backward Compatibility)

These endpoints maintain backward compatibility with existing implementations:

- `POST /cart/add-cart` - Create cart
- `GET /cart/find-cart` - Find cart by userId or sessionId
- `GET /cart/find-cart-summary/:id` - Get cart summary
- `POST /cart/add-item/:id` - Add item to cart
- `PATCH /cart/update-item/:itemId` - Update cart item
- `DELETE /cart/delete-item/:itemId` - Remove cart item
- `DELETE /cart/delete-cart/:id/clear` - Clear cart
- `DELETE /cart/delete-expired-carts` - Clean expired carts

## Stock Validation

The cart system implements comprehensive stock validation:

### Inventory Policies

- **DENY**: Prevents adding items when stock is insufficient
- **CONTINUE**: Allows adding items even with insufficient stock

### Validation Points

1. **Adding items**: Checks available inventory before adding
2. **Updating quantities**: Validates new quantity against stock
3. **Cart synchronization**: Adjusts quantities to available stock
4. **Existing item updates**: Prevents increasing beyond available stock

### Stock Error Messages

- `"Stock insuficiente. Solo hay X unidades disponibles"`
- `"El producto no está disponible"`
- `"Variante de producto no encontrada"`

## Cart Synchronization Logic

The sync endpoint implements intelligent merging:

```typescript
// Pseudo-code for sync logic
for each localItem in localCart:
  serverItem = findInServerCart(localItem.variantId)

  if serverItem exists:
    finalQuantity = max(localItem.quantity, serverItem.quantity)
  else:
    finalQuantity = localItem.quantity

  // Validate against stock
  if variant.inventoryPolicy === 'DENY':
    finalQuantity = min(finalQuantity, variant.inventoryQuantity)

  upsertCartItem(finalQuantity)

// Keep server items not in local cart
```

## Error Handling

### HTTP Status Codes

- `200`: Success
- `201`: Created
- `204`: No Content (for deletions)
- `400`: Bad Request (validation errors, insufficient stock)
- `401`: Unauthorized (authentication required)
- `403`: Forbidden (user doesn't own resource)
- `404`: Not Found (resource doesn't exist)
- `500`: Internal Server Error

### Error Response Format

```json
{
  "statusCode": 400,
  "message": "Stock insuficiente. Solo hay 5 unidades disponibles",
  "timestamp": "2024-01-01T00:00:00Z"
}
```

## Usage Examples

### Frontend Integration

```typescript
// Get user cart
const cart = await fetch('/api/cart', {
  headers: { Authorization: `Bearer ${token}` },
}).then((r) => r.json());

// Add item to cart
await fetch('/api/cart/items', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    variantId: 'variant-123',
    quantity: 2,
  }),
});

// Sync cart on login
await fetch('/api/cart/sync', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    items: localCartItems,
  }),
});
```

### React Hook Example

```typescript
const useCart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);

  const addItem = async (variantId: string, quantity: number) => {
    setLoading(true);
    try {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ variantId, quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      // Refresh cart
      await fetchCart();
    } catch (error) {
      console.error('Error adding item:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const syncCart = async (localItems: CartItem[]) => {
    try {
      const response = await fetch('/api/cart/sync', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${getToken()}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: localItems }),
      });

      const syncedCart = await response.json();
      setCart(syncedCart);

      // Clear local storage after successful sync
      localStorage.removeItem('cart');

      return syncedCart;
    } catch (error) {
      console.error('Error syncing cart:', error);
      throw error;
    }
  };

  return { cart, loading, addItem, syncCart };
};
```

## Testing

The module includes comprehensive tests:

- **Unit tests**: `cart.service.spec.ts`, `cart.controller.spec.ts`
- **Integration tests**: `cart.integration.spec.ts`

Run tests:

```bash
npm test -- --testPathPattern=cart
```

## Database Schema

The cart system uses these Prisma models:

```prisma
model Cart {
  id        String    @id @default(uuid())
  userId    String?   @map("user_id")
  sessionId String?   @map("session_id")
  currency  String    @default("USD")
  expiresAt DateTime? @map("expires_at")
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  lineItems CartLineItem[]
}

model CartLineItem {
  id         String   @id @default(uuid())
  cartId     String   @map("cart_id")
  variantId  String   @map("variant_id")
  quantity   Int      @default(1)
  properties Json?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  cart    Cart           @relation(fields: [cartId], references: [id], onDelete: Cascade)
  variant ProductVariant @relation(fields: [variantId], references: [id], onDelete: Cascade)

  @@unique([cartId, variantId])
}
```

## Requirements Fulfilled

This implementation fulfills all requirements from task 2:

- ✅ **2.1**: Authenticated users can add products to cart with database persistence
- ✅ **2.2**: Users can update product quantities with database updates
- ✅ **2.3**: Users can remove products from cart with database removal
- ✅ **2.4**: Users get their persisted cart loaded on login
- ✅ **2.5**: Unauthenticated users can use localStorage until login (via sync endpoint)

Additional features implemented:

- ✅ Stock validation on all operations
- ✅ Intelligent cart merging on sync
- ✅ Comprehensive error handling
- ✅ Full test coverage
- ✅ Backward compatibility with legacy endpoints
