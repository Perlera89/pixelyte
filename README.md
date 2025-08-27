# Pixelyte - Documentación Completa de Integración

Esta documentación unificada cubre toda la integración entre el frontend y backend de la plataforma Pixelyte, incluyendo API services, sincronización de datos, manejo de errores y arquitectura completa.

## Arquitectura General

```
Pixelyte Platform/
├── Frontend (Next.js + TypeScript)
│   ├── lib/api/              # Servicios de API
│   ├── lib/services/         # Servicios de sincronización
│   ├── hooks/               # React Query hooks
│   ├── stores/              # Zustand stores
│   └── components/          # Componentes UI
│
└── Backend (NestJS + Prisma)
    ├── modules/             # Módulos de negocio
    ├── common/              # Sistema de errores
    └── docs/                # Documentación Swagger
```

## 🎯 Características Principales

### Frontend

- **API Integration**: Servicios type-safe con TypeScript
- **React Query**: Caching, sincronización y optimistic updates
- **Zustand Stores**: Estado global con persistencia offline
- **Sync System**: Sincronización inteligente entre dispositivos
- **Error Handling**: Manejo centralizado de errores con UX amigable

### Backend

- **NestJS**: Framework escalable con decoradores
- **Prisma**: ORM type-safe con migraciones automáticas
- **Error System**: Sistema estructurado de manejo de errores
- **Swagger**: Documentación automática de API
- **JWT Auth**: Autenticación segura con guards

## 📁 Estructura de Archivos

### Frontend API Layer

```
lib/api/
├── products.ts          # Servicios de productos
├── cart.ts              # Servicios de carrito
├── wishlist.ts          # Servicios de wishlist
├── orders.ts            # Servicios de órdenes
├── users.ts             # Servicios de usuarios
├── error-handler.ts     # Manejo centralizado de errores
└── index.ts             # Exports principales

hooks/
├── use-products.ts      # Hooks de productos
├── use-cart.ts          # Hooks de carrito
├── use-wishlist.ts      # Hooks de wishlist
├── use-orders.ts        # Hooks de órdenes
├── use-users.ts         # Hooks de usuarios
└── use-sync.ts          # Hooks de sincronización

stores/
├── auth-store.ts        # Store de autenticación
├── cart-store.ts        # Store de carrito con sync
└── wishlist-store.ts    # Store de wishlist con sync

lib/services/
├── sync.service.ts      # Servicio principal de sync
└── __tests__/           # Tests del sistema de sync

lib/utils/
└── offline-queue.ts     # Cola de operaciones offline
```

### Backend Structure

```
src/
├── modules/
│   ├── auth/            # Autenticación y autorización
│   ├── users/           # Gestión de usuarios
│   ├── products/        # Catálogo de productos
│   ├── cart/            # Carrito de compras
│   ├── wishlist/        # Lista de deseos
│   ├── orders/          # Gestión de órdenes
│   └── admin/           # Panel administrativo
│
├── common/
│   ├── dto/             # DTOs compartidos
│   ├── exceptions/      # Excepciones de negocio
│   ├── filters/         # Filtros de excepción
│   ├── services/        # Servicios comunes
│   ├── utils/           # Utilidades
│   └── enums/           # Enumeraciones
│
└── docs/                # Documentación Swagger
```

## 🚀 Uso Rápido

### 1. Configuración Inicial

```tsx
// app/provider.tsx
import { SyncProvider } from "@/lib/providers/sync-provider";
import { QueryProvider } from "@/lib/providers/query-provider";

export default function Providers({ children }) {
  return (
    <QueryProvider>
      <SyncProvider
        autoSyncOnLogin={true}
        periodicSyncInterval={5}
        showSyncNotifications={false}
      >
        {children}
      </SyncProvider>
    </QueryProvider>
  );
}
```

### 2. Usando API Hooks

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

### 3. Usando Zustand Stores

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

### 4. Sistema de Sincronización

```tsx
import { useSync, useCartSync, useWishlistSync } from "@/hooks/use-sync";

function SyncControls() {
  const { isLoading, lastSyncTime, sync, forceSync } = useSync();
  const { syncCart, isSyncing: cartSyncing } = useCartSync();
  const { syncWishlist, isSyncing: wishlistSyncing } = useWishlistSync();

  return (
    <div>
      <button onClick={forceSync} disabled={isLoading}>
        {isLoading ? "Sincronizando..." : "Forzar Sync"}
      </button>

      <p>Última sincronización: {lastSyncTime?.toLocaleString() || "Nunca"}</p>

      <button onClick={syncCart} disabled={cartSyncing}>
        Sync Carrito
      </button>

      <button onClick={syncWishlist} disabled={wishlistSyncing}>
        Sync Wishlist
      </button>
    </div>
  );
}
```

## 🔌 API Endpoints

### Productos

- `GET /products` - Listar productos con filtros
- `GET /products/featured` - Obtener productos destacados
- `GET /products/:id` - Obtener detalles de producto
- `GET /products/:id/related` - Obtener productos relacionados
- `GET /products/search` - Buscar productos

### Carrito

- `GET /cart` - Obtener carrito del usuario
- `POST /cart/items` - Agregar item al carrito
- `PUT /cart/items/:id` - Actualizar item del carrito
- `DELETE /cart/items/:id` - Remover item del carrito
- `DELETE /cart` - Limpiar carrito
- `POST /cart/sync` - Sincronizar carrito local con servidor

### Wishlist

- `GET /wishlist` - Obtener wishlist del usuario
- `POST /wishlist/items` - Agregar item a wishlist
- `DELETE /wishlist/items/:productId` - Remover de wishlist
- `DELETE /wishlist` - Limpiar wishlist
- `POST /wishlist/sync` - Sincronizar wishlist local con servidor

### Órdenes

- `POST /orders` - Crear nueva orden
- `GET /orders` - Obtener órdenes del usuario
- `GET /orders/:id` - Obtener detalles de orden

### Usuarios

- `GET /users/profile` - Obtener perfil de usuario
- `PUT /users/profile` - Actualizar perfil de usuario
- `PUT /users/password` - Cambiar contraseña
- `GET /users/addresses` - Obtener direcciones del usuario
- `POST /users/addresses` - Crear dirección
- `PUT /users/addresses/:id` - Actualizar dirección
- `DELETE /users/addresses/:id` - Eliminar dirección

## 🔄 Sistema de Sincronización

### Características Principales

#### 🔄 Sincronización Automática

- **Login Sync**: Sincronización automática al iniciar sesión
- **Periodic Sync**: Sincronización en segundo plano cada 5 minutos
- **Reconnection Sync**: Sincronización al restaurar conexión
- **Real-time Sync**: Sincronización inmediata en cambios (cuando está online)

#### 🧠 Lógica de Merge Inteligente

- **Conflictos de Carrito**: Usa cantidad máxima cuando hay conflictos
- **Conflictos de Wishlist**: Combina items de local y servidor
- **Validación de Datos**: Asegura que solo productos válidos se sincronicen
- **Verificación de Stock**: Respeta límites de inventario durante sync

#### 📱 Soporte Offline

- **Local Storage**: Todos los cambios se guardan localmente cuando está offline
- **Cola de Operaciones**: Operaciones fallidas se encolan para reintentar
- **Retry Automático**: Operaciones se reintentan cuando se restaura conexión
- **Degradación Elegante**: App funciona completamente offline con datos locales

### Flujo de Sincronización

#### 1. Sync de Login

```
Login Usuario → Auth Store → Programar Sync → Sync Service → API Calls → Actualizar Stores
```

#### 2. Sync Periódico

```
Timer → Verificar Auth → Verificar Cambios → Sync Service → API Calls → Actualizar Stores
```

#### 3. Operaciones Offline

```
Acción Usuario → Actualizar Store → API Call Falla → Encolar Operación → Conexión Restaurada → Procesar Cola
```

#### 4. Resolución de Conflictos

```
Request Sync → Comparar Datos → Detectar Conflictos → Aplicar Resolución → Actualizar Stores → Notificar Usuario
```

### Estrategias de Resolución de Conflictos

#### Conflictos de Carrito

- **Conflictos de Cantidad**: Usar cantidad máxima entre local y servidor
- **Conflictos de Items**: Combinar items, manteniendo todos los productos únicos
- **Validación de Stock**: Respetar límites de inventario durante merge

#### Conflictos de Wishlist

- **Conflictos de Items**: Unión de items locales y del servidor
- **Manejo de Duplicados**: Remover duplicados basado en ID de producto
- **Verificación de Disponibilidad**: Remover productos no disponibles

## ⚠️ Sistema de Manejo de Errores

### Backend Error System

#### Componentes Principales

1. **DTOs de Respuesta de Error**
   - `ErrorResponseDto`: Estructura básica de respuesta de error
   - `ValidationErrorResponseDto`: Para errores de validación con detalles por campo
   - `PrismaErrorResponseDto`: Para errores específicos de Prisma

2. **Códigos de Error**

   ```typescript
   import { ErrorCodes } from "./common/enums/error-codes.enum";

   ErrorCodes.VALIDATION_ERROR;
   ErrorCodes.RESOURCE_NOT_FOUND;
   ErrorCodes.INSUFFICIENT_STOCK;
   ErrorCodes.UNAUTHORIZED;
   ```

3. **Excepciones de Negocio**

   ```typescript
   import {
     BusinessException,
     InsufficientStockException,
     EmptyCartException,
   } from "./common/exceptions";

   // Uso básico
   throw new BusinessException(
     "Custom error message",
     ErrorCodes.VALIDATION_ERROR,
     HttpStatus.BAD_REQUEST,
     ["Detail 1", "Detail 2"]
   );

   // Excepciones específicas
   throw new InsufficientStockException("iPhone 14", 5);
   throw new EmptyCartException();
   ```

4. **Utilidad de Errores**

   ```typescript
   import { ErrorUtil } from "./common/utils/error.util";

   // Lanzar error de recurso no encontrado
   ErrorUtil.throwNotFound("Product", "product-123");

   // Lanzar error de recurso ya existente
   ErrorUtil.throwAlreadyExists("User", "email");

   // Lanzar error de permisos insuficientes
   ErrorUtil.throwInsufficientPermissions("delete products");
   ```

### Frontend Error Handling

```tsx
import { useErrorHandler } from "@/lib/api/error-handler";

function MyComponent() {
  const { handleError } = useErrorHandler();

  const handleApiCall = async () => {
    try {
      await someApiCall();
    } catch (error) {
      const apiError = handleError(error);
      // Error se muestra automáticamente como toast
      // y redirects de auth se manejan automáticamente
    }
  };
}
```

### Estructura de Respuestas de Error

#### Error Estándar

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": ["email must be valid", "password is too short"],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users/profile",
  "errorId": "err_1705312200000_abc123def"
}
```

#### Error de Validación

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": ["email must be valid", "password is too short"],
  "fieldErrors": {
    "email": ["must be a valid email"],
    "password": ["must be at least 8 characters long"]
  },
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users/register",
  "errorId": "err_1705312200000_abc123def"
}
```

## ⚙️ Configuración

### React Query Setup

- **Stale time**: 1 minuto para queries
- **Cache time**: 5 minutos para queries
- **Retry logic**: Reintentos inteligentes basados en tipo de error
- **Retry delays**: Backoff exponencial

### Axios Configuration

- **Base URL**: http://localhost:4000/
- **Timeout**: 10 segundos
- **Inyección automática de token** desde auth store
- **Response interceptors** para manejo de errores

### Estados de Carga

Todas las operaciones de API incluyen estados de carga completos:

- `isLoading` - Carga inicial de datos
- `isAddingItem` - Agregando items a carrito/wishlist
- `isUpdatingItem` - Actualizando cantidades
- `isRemovingItem` - Removiendo items
- `isSyncing` - Sincronizando con servidor

## 🔧 Optimizaciones de Performance

- **Request deduplication** vía React Query
- **Background updates** para mantener datos frescos
- **Optimistic updates** para feedback inmediato
- **Selective cache invalidation** para minimizar refetches
- **Infinite queries** para paginación eficiente

### Estrategias de Optimización

- **Debounced Sync**: Prevenir llamadas excesivas a API
- **Incremental Sync**: Solo sincronizar datos cambiados
- **Background Processing**: Operaciones de sync no bloqueantes
- **Queue Management**: Limitar tamaño de cola y intentos de retry

## 🧪 Testing

### Frontend Testing

- **Type safety** con TypeScript
- **Error simulation** para testing de estados de error
- **Mock data support** para desarrollo
- **Loading state testing** con React Query devtools

### Backend Testing

El sistema incluye tests completos para:

- ✅ Filtros de excepción
- ✅ Excepciones de negocio
- ✅ Servicio de logging
- ✅ Utilidades de error

### Sync System Testing

- ✅ Escenarios de sync exitosos
- ✅ Manejo de fallos de red
- ✅ Detección y resolución de conflictos
- ✅ Prevención de sync concurrente
- ✅ Gestión de cola
- ✅ Escenarios de error

Ejecutar tests:

```bash
# Frontend tests
npm test lib/services/__tests__/sync.service.test.ts

# Backend tests
npm test -- --testPathPattern="common.*spec.ts"
```

## 📚 Mejores Prácticas

### Frontend

1. **Siempre manejar estados de carga** en componentes
2. **Usar optimistic updates** para feedback inmediato
3. **Implementar error boundaries** apropiados para capturar errores
4. **Aprovechar caching** para minimizar llamadas a API
5. **Usar interfaces TypeScript** para type safety
6. **Testear escenarios offline** para asegurar degradación elegante
7. **Monitorear performance** con React Query devtools

### Backend

1. **Usar ErrorUtil para errores comunes**: Proporciona consistencia
2. **Loggear eventos de negocio**: Ayuda con debugging y análisis
3. **Incluir contexto relevante**: Siempre incluir información útil como userId, productId
4. **No exponer información sensible**: El sistema automáticamente redacta campos sensibles
5. **Usar códigos de error específicos**: Facilita el manejo en frontend
6. **Manejar errores de Prisma apropiadamente**: El sistema convierte automáticamente códigos de Prisma

## 🚀 Guía de Migración

Para migrar componentes existentes a usar la nueva integración de API:

1. **Reemplazar llamadas directas a API** con React Query hooks
2. **Actualizar estados de carga** para usar las nuevas propiedades de loading
3. **Agregar manejo de errores** usando la utilidad de error handler
4. **Actualizar stores** para usar las versiones integradas con API
5. **Agregar optimistic updates** para mejor UX

## 🔮 Mejoras Futuras

### Características Planeadas

- **Real-time Sync**: Sincronización en tiempo real basada en WebSocket
- **Conflict UI**: Interfaz de resolución manual de conflictos
- **Sync Analytics**: Métricas detalladas de performance de sync
- **Selective Sync**: Elegir qué datos sincronizar
- **Sync History**: Ver historial de operaciones de sync

### Mejoras de Performance

- **Delta Sync**: Solo sincronizar campos cambiados
- **Compression**: Comprimir payloads de sync
- **Caching**: Cachear resultados de sync
- **Batching**: Agrupar múltiples operaciones

## 🛠️ Troubleshooting

### Problemas Comunes

#### Sync No Funciona

1. Verificar conexión a internet
2. Verificar autenticación de usuario
3. Revisar consola del navegador para errores
4. Limpiar localStorage y reintentar

#### Datos No Se Sincronizan

1. Verificar componente de estado de sync
2. Forzar sync manual
3. Verificar que endpoints de API funcionen
4. Revisar errores de JavaScript

#### Conflictos No Se Resuelven

1. Verificar estrategia de resolución de conflictos
2. Verificar consistencia de formato de datos
3. Limpiar datos locales y re-sincronizar
4. Revisar lógica de merge del servidor

### Modo Debug

Habilitar modo debug en desarrollo:

```tsx
<SyncProvider showSyncNotifications={true}>{children}</SyncProvider>
```

Esto mostrará información detallada de sync y UI de debug.

## 📄 Licencia

Este sistema de integración es parte de la plataforma e-commerce Pixelyte.
