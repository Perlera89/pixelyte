# Pixelyte API - Guía de Documentación Swagger

## Descripción General

La API de Pixelyte cuenta con documentación completa generada automáticamente con Swagger/OpenAPI 3.0. Esta documentación proporciona una interfaz interactiva para explorar y probar todos los endpoints de la API.

## Acceso a la Documentación

### Desarrollo

- **URL**: http://localhost:4000/api/docs
- **Disponible cuando**: El servidor de desarrollo está ejecutándose

### Producción

- **URL**: https://api.pixelyte.com/api/docs
- **Disponible cuando**: El servidor de producción está activo

## Características de la Documentación

### 🔐 Autenticación Integrada

- **Botón "Authorize"** en la parte superior derecha
- Soporte completo para JWT Bearer tokens
- Persistencia de autorización entre requests
- Ejemplos de tokens y payloads

### 📊 Organización por Módulos

La documentación está organizada en las siguientes secciones:

1. **🔐 Autorización** - Registro, login, refresh tokens
2. **👤 Usuarios** - Gestión de usuarios y perfiles
3. **📍 Direcciones** - Gestión de direcciones de usuario
4. **🛍️ Productos** - Catálogo completo con filtros
5. **📂 Categorías** - Gestión de categorías
6. **🏷️ Marcas** - Gestión de marcas
7. **🛒 Carrito** - Carrito de compras persistente
8. **❤️ Wishlist** - Lista de deseos
9. **📦 Órdenes** - Sistema de órdenes y checkout
10. **🔧 Admin** - Panel de administración

### 📝 Ejemplos Completos

- **Request examples** para todos los endpoints
- **Response examples** con datos realistas
- **Error examples** con códigos y mensajes específicos
- **Schema definitions** detalladas

### 🎨 Interfaz Mejorada

- **Diseño personalizado** con colores de marca
- **Filtros de búsqueda** para encontrar endpoints rápidamente
- **Expansión controlada** de secciones
- **Duración de requests** visible
- **Sintaxis highlighting** para JSON

## Cómo Usar la Documentación

### 1. Autenticación

```bash
# 1. Ir a la sección "1. Autorización"
# 2. Usar POST /api/auth/login con credenciales válidas
# 3. Copiar el token de la respuesta
# 4. Hacer clic en "Authorize" (botón verde)
# 5. Pegar el token en el campo "Value"
# 6. Hacer clic en "Authorize"
```

### 2. Explorar Endpoints

- **GET** (azul): Obtener datos
- **POST** (verde): Crear recursos
- **PUT/PATCH** (naranja): Actualizar recursos
- **DELETE** (rojo): Eliminar recursos

### 3. Probar Endpoints

1. Hacer clic en el endpoint deseado
2. Hacer clic en "Try it out"
3. Completar los parámetros requeridos
4. Hacer clic en "Execute"
5. Ver la respuesta en tiempo real

### 4. Ver Ejemplos

- **Request Body**: Ejemplos de datos de entrada
- **Responses**: Ejemplos de respuestas exitosas y errores
- **Schema**: Estructura detallada de los datos

## Modelos de Datos Documentados

### Usuario

```json
{
  "id": "uuid-usuario",
  "email": "usuario@ejemplo.com",
  "names": "Juan Carlos",
  "surnames": "Pérez González",
  "role": "USER",
  "isActive": true,
  "emailVerified": true,
  "createdAt": "2024-01-15T10:30:00.000Z"
}
```

### Producto

```json
{
  "id": "uuid-producto",
  "sku": "LAPTOP001",
  "name": "Laptop Gaming XYZ",
  "slug": "laptop-gaming-xyz",
  "basePrice": 1299.99,
  "compareAtPrice": 1499.99,
  "isFeatured": true,
  "brand": {
    "name": "TechBrand",
    "slug": "techbrand"
  },
  "category": {
    "name": "Laptops",
    "slug": "laptops"
  }
}
```

### Carrito

```json
{
  "id": "uuid-carrito",
  "userId": "uuid-usuario",
  "items": [
    {
      "id": "uuid-item",
      "variantId": "uuid-variante",
      "quantity": 2,
      "unitPrice": 1299.99,
      "totalPrice": 2599.98
    }
  ],
  "subtotal": 2599.98,
  "itemCount": 2
}
```

## Códigos de Respuesta

| Código  | Significado       | Descripción                     |
| ------- | ----------------- | ------------------------------- |
| **200** | ✅ OK             | Operación exitosa               |
| **201** | ✅ Created        | Recurso creado exitosamente     |
| **204** | ✅ No Content     | Operación exitosa sin contenido |
| **400** | ❌ Bad Request    | Datos de entrada inválidos      |
| **401** | ❌ Unauthorized   | No autenticado                  |
| **403** | ❌ Forbidden      | Sin permisos suficientes        |
| **404** | ❌ Not Found      | Recurso no encontrado           |
| **409** | ❌ Conflict       | Conflicto (ej: email duplicado) |
| **500** | ❌ Internal Error | Error interno del servidor      |

## Ejemplos de Autenticación JWT

### 1. Registro

```bash
POST /api/auth/register
Content-Type: application/json

{
  "email": "nuevo@ejemplo.com",
  "names": "Juan Carlos",
  "surnames": "Pérez González",
  "password": "MiContraseñaSegura123!",
  "phone": "+57 300 123 4567",
  "dateOfBirth": "1990-01-15"
}
```

**Respuesta:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "isAuthenticated": true,
  "user": {
    "id": "uuid-usuario",
    "email": "nuevo@ejemplo.com",
    "names": "Juan Carlos",
    "surnames": "Pérez González",
    "role": "USER"
  }
}
```

### 2. Login

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "usuario@ejemplo.com",
  "password": "MiContraseñaSegura123!"
}
```

### 3. Usar Token

```bash
GET /api/users/profile
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### 4. Refresh Token

```bash
POST /api/auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

## Filtros y Búsqueda de Productos

### Filtros Disponibles

```bash
GET /api/products/search?category=laptops&brand=techbrand&minPrice=500&maxPrice=2000&inStock=true&isFeatured=true&sortBy=price&sortOrder=asc&page=1&limit=12&search=gaming
```

### Parámetros de Filtro

- **category**: Slug de categoría
- **brand**: Slug de marca
- **minPrice/maxPrice**: Rango de precios
- **inStock**: Solo productos en stock
- **isFeatured**: Solo productos destacados
- **sortBy**: Campo de ordenamiento (price, name, rating, featured)
- **sortOrder**: Orden (asc, desc)
- **page/limit**: Paginación
- **search**: Término de búsqueda

## Paginación

Todos los endpoints que devuelven listas incluyen metadatos de paginación:

```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 12,
    "totalCount": 150,
    "totalPages": 13,
    "hasNextPage": true,
    "hasPreviousPage": false
  }
}
```

## Manejo de Errores

### Formato Estándar de Error

```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": [
    "email must be a valid email",
    "password must be at least 8 characters"
  ],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/register",
  "errorId": "err_1234567890"
}
```

### Códigos de Error Específicos

- **VALIDATION_ERROR**: Errores de validación de datos
- **INVALID_CREDENTIALS**: Credenciales incorrectas
- **TOKEN_EXPIRED**: Token JWT expirado
- **INVALID_TOKEN**: Token JWT inválido
- **EMAIL_ALREADY_EXISTS**: Email ya registrado
- **INSUFFICIENT_PERMISSIONS**: Sin permisos suficientes
- **RESOURCE_NOT_FOUND**: Recurso no encontrado
- **STOCK_INSUFFICIENT**: Stock insuficiente

## Límites y Rate Limiting

### Límites Generales

- **100 requests por 15 minutos** por IP
- **Tamaño máximo de archivo**: 10 MB
- **Timeout de request**: 30 segundos

### Límites Específicos

- **Autenticación**: 5 intentos por 15 minutos
- **Registro**: 3 intentos por hora
- **Uploads**: 10 archivos por minuto

## Desarrollo y Contribución

### Agregar Documentación a Nuevos Endpoints

1. **Usar decoradores de Swagger**:

```typescript
@ApiTags('Mi Módulo')
@ApiOperation({ summary: 'Descripción del endpoint' })
@ApiResponse({ status: 200, description: 'Respuesta exitosa' })
@ApiResponse({ status: 400, description: 'Error de validación' })
```

2. **Documentar DTOs**:

```typescript
export class MiDto {
  @ApiProperty({
    description: 'Descripción del campo',
    example: 'Valor de ejemplo',
  })
  campo: string;
}
```

3. **Agregar ejemplos**:

```typescript
@ApiBody({
  type: MiDto,
  examples: {
    ejemplo1: {
      summary: 'Ejemplo básico',
      value: { campo: 'valor' }
    }
  }
})
```

### Actualizar Configuración

La configuración de Swagger se encuentra en:

- `src/common/config/swagger.config.ts`
- `src/main.ts`

### Generar Documentación Estática

```bash
# Generar archivo JSON de la especificación
npm run build
node -e "
const { NestFactory } = require('@nestjs/core');
const { SwaggerModule } = require('@nestjs/swagger');
const { AppModule } = require('./dist/app.module');
const { swaggerConfig } = require('./dist/common/config/swagger.config');

async function generateDocs() {
  const app = await NestFactory.create(AppModule);
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  console.log(JSON.stringify(document, null, 2));
  await app.close();
}
generateDocs();
" > swagger.json
```

## Soporte y Recursos

### Enlaces Útiles

- **Documentación OpenAPI**: https://swagger.io/specification/
- **NestJS Swagger**: https://docs.nestjs.com/openapi/introduction
- **JWT.io**: https://jwt.io/ (para decodificar tokens)

### Contacto

- **Email**: dev@pixelyte.com
- **GitHub**: https://github.com/pixelyte/backend
- **Documentación**: https://docs.pixelyte.com

### Reportar Problemas

Si encuentras problemas con la documentación:

1. Verificar que el servidor esté ejecutándose
2. Limpiar caché del navegador
3. Reportar el issue en GitHub con detalles específicos
