# Orders Module - Checkout and Order Management

This module implements the complete checkout process and order management functionality for the Pixelyte e-commerce platform.

## Features Implemented

### ✅ Checkout Process

- **POST /orders/checkout** - Complete checkout process from cart to order
- Validates cart items and stock availability
- Processes shipping and billing addresses
- Simulates payment processing
- Automatically updates inventory levels
- Clears cart after successful order

### ✅ Order History

- **GET /orders/my-orders** - Get user's order history with pagination
- **GET /orders/my-orders/:id** - Get specific order details
- User can only access their own orders (security enforced)

### ✅ Stock Management Integration

- Automatic stock updates when orders are processed
- Inventory movement tracking
- Stock validation during checkout
- Integration with inventory management system

### ✅ Payment Processing (Simulated)

- Simulated payment gateway integration
- Transaction tracking and status updates
- Support for multiple payment methods
- Payment success/failure handling

## API Endpoints

### User Endpoints (Protected)

#### Process Checkout

```http
POST /orders/checkout
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "shippingAddress": {
    "country": "Colombia",
    "stateProvince": "Cundinamarca",
    "city": "Bogotá",
    "postalCode": "110111",
    "address": "Calle 123 #45-67",
    "addressLine": "Apartamento 101",
    "fullName": "Juan Pérez",
    "phone": "+57 300 123 4567"
  },
  "billingAddress": {
    "country": "Colombia",
    "stateProvince": "Cundinamarca",
    "city": "Bogotá",
    "postalCode": "110111",
    "address": "Calle 123 #45-67"
  },
  "paymentMethod": {
    "type": "credit_card",
    "details": {
      "last4": "1234",
      "brand": "visa"
    }
  },
  "notes": "Entregar en horario de oficina",
  "email": "otro@email.com"
}
```

**Response:**

```json
{
  "id": "order-123",
  "orderNumber": "202412250001",
  "status": "CONFIRMED",
  "totalPrice": 1299.99,
  "createdAt": "2024-12-25T10:30:00Z",
  "paymentStatus": "SUCCESS",
  "transactionId": "transaction-123",
  "items": [
    {
      "id": "item-1",
      "productName": "Laptop Gaming XYZ",
      "variantTitle": "16GB RAM, 512GB SSD",
      "quantity": 1,
      "price": 1299.99,
      "total": 1299.99,
      "image": "https://example.com/image.jpg"
    }
  ]
}
```

#### Get Order History

```http
GET /orders/my-orders?page=1&limit=10
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "data": [
    {
      "id": "order-123",
      "orderNumber": "202412250001",
      "status": "DELIVERED",
      "totalPrice": 1299.99,
      "createdAt": "2024-12-25T10:30:00Z",
      "orderItems": [...]
    }
  ],
  "totalCount": 25,
  "page": 1,
  "limit": 10,
  "totalPages": 3,
  "hasNextPage": true,
  "hasPreviousPage": false
}
```

#### Get Order Details

```http
GET /orders/my-orders/order-123
Authorization: Bearer <jwt-token>
```

**Response:**

```json
{
  "id": "order-123",
  "orderNumber": "202412250001",
  "status": "DELIVERED",
  "financialStatus": "PAID",
  "fulfillmentStatus": "FULFILLED",
  "totalPrice": 1299.99,
  "shippingAddress": {...},
  "billingAddress": {...},
  "orderItems": [
    {
      "id": "item-1",
      "title": "Laptop Gaming XYZ",
      "variantTitle": "16GB RAM, 512GB SSD",
      "quantity": 1,
      "price": 1299.99,
      "product": {
        "id": "product-1",
        "name": "Laptop Gaming XYZ",
        "productImages": [...]
      }
    }
  ],
  "transactions": [
    {
      "id": "transaction-1",
      "kind": "SALE",
      "status": "SUCCESS",
      "amount": 1299.99,
      "gateway": "credit_card",
      "processedAt": "2024-12-25T10:30:00Z"
    }
  ],
  "createdAt": "2024-12-25T10:30:00Z"
}
```

## Validation Rules

### Checkout Validation

- Cart must not be empty
- All cart items must be active and available
- Sufficient stock must be available for all items
- Valid shipping and billing addresses required
- Valid payment method required

### Stock Validation

- Checks `inventoryPolicy` (DENY/CONTINUE)
- Validates `inventoryQuantity` for DENY policy
- Updates stock levels after successful order
- Creates inventory movement records

### Security

- All user endpoints require JWT authentication
- Users can only access their own orders
- Order ownership is validated on every request

## Error Handling

### Common Error Responses

#### 400 - Bad Request

```json
{
  "statusCode": 400,
  "message": "El carrito está vacío",
  "timestamp": "2024-12-25T10:30:00Z"
}
```

#### 401 - Unauthorized

```json
{
  "statusCode": 401,
  "message": "Usuario no autenticado",
  "timestamp": "2024-12-25T10:30:00Z"
}
```

#### 403 - Forbidden

```json
{
  "statusCode": 403,
  "message": "No tienes permisos para ver esta orden",
  "timestamp": "2024-12-25T10:30:00Z"
}
```

#### 404 - Not Found

```json
{
  "statusCode": 404,
  "message": "Orden no encontrada",
  "timestamp": "2024-12-25T10:30:00Z"
}
```

## Database Integration

### Tables Used

- `Order` - Main order records
- `OrderItem` - Individual order line items
- `Transaction` - Payment transactions
- `Cart` / `CartLineItem` - Source cart data
- `ProductVariant` - Stock updates
- `InventoryLevel` - Inventory tracking
- `InventoryMovement` - Stock movement history

### Order Status Flow

1. `PENDING` - Order created, payment processing
2. `CONFIRMED` - Payment successful, order confirmed
3. `PROCESSING` - Order being prepared
4. `SHIPPED` - Order shipped to customer
5. `DELIVERED` - Order delivered successfully
6. `CANCELLED` - Order cancelled
7. `REFUNDED` - Order refunded

### Financial Status Flow

1. `PENDING` - Payment not processed
2. `AUTHORIZED` - Payment authorized but not captured
3. `PAID` - Payment successfully processed
4. `PARTIALLY_PAID` - Partial payment received
5. `REFUNDED` - Full refund processed
6. `PARTIALLY_REFUNDED` - Partial refund processed
7. `VOIDED` - Payment authorization voided

## Testing

### Unit Tests

- ✅ OrdersService tests (19 tests)
- ✅ OrdersController tests (19 tests)
- Coverage includes success and error scenarios
- Mocked dependencies for isolated testing

### Test Coverage

- Checkout process validation
- Stock availability checks
- Payment processing simulation
- Order history retrieval
- Security and authorization
- Error handling scenarios

## Requirements Fulfilled

This implementation fulfills the following requirements from the specification:

### Requirement 3 (Checkout Process)

- ✅ 3.1 - Validates cart has products before checkout
- ✅ 3.2 - Validates and saves shipping information
- ✅ 3.3 - Simulates payment transaction and creates order
- ✅ 3.4 - Generates unique order ID and updates stock
- ✅ 3.5 - Clears cart and sends confirmation

### Requirement 4 (Order History)

- ✅ 4.1 - Shows all user orders ordered by date
- ✅ 4.2 - Shows complete order details including products and status
- ✅ 4.3 - Updates order status in database
- ✅ 4.4 - Allows filtering orders by ID or date

## Future Enhancements

### Potential Improvements

- Real payment gateway integration (Stripe, PayPal, etc.)
- Email notifications for order status changes
- Order tracking with shipping providers
- Advanced inventory management with multiple locations
- Order cancellation and refund processing
- Bulk order operations for admin users
- Order export functionality
- Advanced reporting and analytics

### Performance Optimizations

- Database query optimization with proper indexing
- Caching for frequently accessed order data
- Async processing for inventory updates
- Background job processing for email notifications
