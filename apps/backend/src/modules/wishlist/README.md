# Wishlist Module

Este módulo implementa la gestión completa de wishlist (lista de deseos) para la plataforma Pixelyte, incluyendo sincronización entre localStorage y base de datos.

## Funcionalidades Implementadas

### 1. Gestión Básica de Wishlist

- ✅ Agregar productos a la wishlist
- ✅ Obtener wishlist del usuario
- ✅ Eliminar productos específicos de la wishlist
- ✅ Limpiar toda la wishlist

### 2. Sincronización de Datos

- ✅ Sincronización entre localStorage y servidor
- ✅ Merge inteligente de datos locales con datos del servidor
- ✅ Manejo de conflictos en sincronización

### 3. Validaciones y Seguridad

- ✅ Validación de productos activos
- ✅ Validación de variantes activas
- ✅ Prevención de duplicados
- ✅ Autenticación JWT requerida

## Endpoints Disponibles

### `POST /wishlist/items`

Agrega un producto a la wishlist del usuario.

**Request Body:**

```json
{
  "productId": "string",
  "variantId": "string" // opcional
}
```

**Response:**

```json
{
  "id": "string",
  "productId": "string",
  "variantId": "string",
  "addedAt": "datetime",
  "product": {
    "id": "string",
    "name": "string",
    "basePrice": "number",
    "brand": { "name": "string" },
    "image": { "url": "string" }
  },
  "variant": {
    "id": "string",
    "name": "string",
    "price": "number"
  }
}
```

### `GET /wishlist`

Obtiene la wishlist completa del usuario.

**Response:**

```json
{
  "id": "string",
  "items": [
    {
      "id": "string",
      "productId": "string",
      "variantId": "string",
      "addedAt": "datetime",
      "product": {
        /* detalles del producto */
      },
      "variant": {
        /* detalles de la variante */
      }
    }
  ]
}
```

### `DELETE /wishlist/items/:productId`

Elimina un producto de la wishlist (todas las variantes).

**Response:**

```json
{
  "message": "Producto eliminado de la wishlist exitosamente"
}
```

### `DELETE /wishlist/items`

Elimina un producto específico con variante de la wishlist.

**Request Body:**

```json
{
  "productId": "string",
  "variantId": "string" // opcional
}
```

### `DELETE /wishlist`

Limpia toda la wishlist del usuario.

**Response:**

```json
{
  "message": "Wishlist limpiada exitosamente"
}
```

### `POST /wishlist/sync`

Sincroniza la wishlist local con el servidor.

**Request Body:**

```json
{
  "items": [
    {
      "productId": "string",
      "variantId": "string" // opcional
    }
  ]
}
```

**Response:**

```json
{
  "wishlistId": "string",
  "items": [
    /* items sincronizados */
  ],
  "totalItems": "number",
  "message": "Wishlist sincronizada exitosamente"
}
```

## Lógica de Sincronización

La sincronización implementa las siguientes reglas:

1. **Merge Inteligente**: Los items locales se combinan con los del servidor
2. **Validación de Productos**: Solo se sincronizan productos y variantes activos
3. **Prevención de Duplicados**: Se evitan items duplicados en la wishlist
4. **Preservación de Datos del Servidor**: Los items que solo existen en el servidor se mantienen

## Casos de Error

- **400 Bad Request**: Producto ya está en la wishlist, producto/variante inactivo
- **401 Unauthorized**: Usuario no autenticado
- **404 Not Found**: Producto no encontrado, wishlist no encontrada, item no encontrado
- **500 Internal Server Error**: Errores de base de datos

## Estructura de Base de Datos

### Tabla `Wishlist`

```sql
- id: String (UUID)
- userId: String
- name: String
- isDefault: Boolean
- createdAt: DateTime
- updatedAt: DateTime
```

### Tabla `WishlistItem`

```sql
- id: String (UUID)
- wishlistId: String
- productId: String
- variantId: String (nullable)
- addedAt: DateTime
```

## Testing

El módulo incluye:

- ✅ Pruebas unitarias para el servicio
- ✅ Pruebas unitarias para el controlador
- ✅ Pruebas de integración E2E

Para ejecutar las pruebas:

```bash
# Pruebas unitarias
npm run test wishlist

# Pruebas de integración
npm run test:e2e wishlist
```

## Dependencias

- `@nestjs/common`: Framework base
- `@nestjs/swagger`: Documentación API
- `class-validator`: Validación de DTOs
- `class-transformer`: Transformación de datos
- `prisma`: ORM para base de datos

## Consideraciones de Rendimiento

1. **Índices de Base de Datos**: Se recomienda crear índices en:
   - `wishlist.userId`
   - `wishlistItem.wishlistId`
   - `wishlistItem.productId`

2. **Paginación**: Para usuarios con muchos items, considerar implementar paginación

3. **Caché**: Los productos frecuentemente agregados a wishlist podrían beneficiarse de caché

## Integración con Frontend

El frontend debe:

1. Mantener wishlist en localStorage para usuarios no autenticados
2. Sincronizar automáticamente al hacer login
3. Manejar estados de loading durante operaciones
4. Mostrar mensajes de error apropiados
5. Implementar optimistic updates para mejor UX
