# Documentación del Backend - Pixelyte

## Información General

**Pixelyte Backend** es una aplicación completa de comercio electrónico desarrollada con **NestJS**, que proporciona una API REST robusta para gestionar productos, usuarios, órdenes, inventario y más funcionalidades de e-commerce.

### Datos del Proyecto

- **Nombre**: pixelyte-backend
- **Versión**: 0.1
- **Autor**: Manuel Perlera
- **Licencia**: MIT
- **Framework**: NestJS
- **Base de Datos**: PostgreSQL (Supabase)
- **ORM**: Prisma

## Arquitectura del Sistema

### Stack Tecnológico

#### Backend Framework

- **NestJS**: Framework de Node.js para aplicaciones escalables
- **TypeScript**: Lenguaje de programación tipado
- **Express**: Servidor HTTP subyacente

#### Base de Datos

- **PostgreSQL**: Base de datos relacional
- **Supabase**: Plataforma de base de datos como servicio
- **Prisma**: ORM moderno para TypeScript/JavaScript

#### Autenticación y Seguridad

- **JWT (JSON Web Tokens)**: Para autenticación
- **Passport**: Middleware de autenticación
- **bcrypt**: Para hash de contraseñas
- **Guards y Decoradores**: Control de acceso basado en roles

#### Documentación API

- **Swagger/OpenAPI**: Documentación interactiva de la API
- **Swagger UI**: Interfaz web para probar endpoints

#### Validación y Transformación

- **class-validator**: Validación de DTOs
- **class-transformer**: Transformación de objetos

#### Manejo de Archivos

- **Multer**: Middleware para subida de archivos
- **Validación de imágenes**: Pipes personalizados

## Estructura del Proyecto

```
pixelyte-backend/
├── src/
│   ├── app.controller.ts          # Controlador principal
│   ├── app.module.ts              # Módulo raíz de la aplicación
│   ├── app.service.ts             # Servicio principal
│   ├── main.ts                    # Punto de entrada de la aplicación
│   ├── common/                    # Módulos y utilidades compartidas
│   │   ├── decorators/            # Decoradores personalizados
│   │   ├── dto/                   # DTOs compartidos
│   │   ├── pipes/                 # Pipes de validación
│   │   ├── services/              # Servicios compartidos
│   │   └── utils/                 # Utilidades
│   └── modules/                   # Módulos de funcionalidad
│       ├── auth/                  # Autenticación y autorización
│       ├── cart/                  # Carrito de compras
│       ├── inventory/             # Gestión de inventario
│       ├── orders/                # Sistema de órdenes
│       ├── products/              # Catálogo de productos
│       ├── reviews/               # Sistema de reseñas
│       ├── users/                 # Gestión de usuarios
│       └── wishlist/              # Lista de deseos
├── prisma/
│   ├── schema.prisma              # Esquema de base de datos
│   ├── seed.ts                    # Datos de prueba
│   └── migrations/                # Migraciones de BD
├── test/                          # Pruebas E2E
├── dist/                          # Código compilado
└── node_modules/                  # Dependencias
```

## Configuración del Entorno

### Variables de Entorno (.env)

```env
# Base de Datos
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# Supabase
SUPABASE_URL="https://..."
SUPABASE_ANON_KEY="..."

# Puerto (opcional)
PORT=3000
```

### Scripts Disponibles

```bash
# Desarrollo
npm run start:dev          # Modo desarrollo con watch
npm run start:debug        # Modo debug

# Producción
npm run build              # Compilar aplicación
npm run start:prod         # Ejecutar en producción

# Testing
npm run test               # Pruebas unitarias
npm run test:e2e           # Pruebas end-to-end
npm run test:cov           # Cobertura de pruebas

# Base de Datos
npm run seed               # Ejecutar seed de datos

# Calidad de Código
npm run lint               # Linter
npm run format             # Formatear código
```

## Modelo de Base de Datos

### Entidades Principales

#### 1. **Usuarios y Autenticación**

- `User`: Información básica del usuario
- `UserProfile`: Perfil extendido del usuario
- `UserAddress`: Direcciones de envío/facturación

#### 2. **Catálogo de Productos**

- `Product`: Productos principales
- `ProductVariant`: Variantes de productos (color, talla, etc.)
- `ProductOption`: Opciones de productos
- `ProductOptionValue`: Valores de opciones
- `ProductImage`: Imágenes de productos
- `ProductSpecification`: Especificaciones técnicas
- `Category`: Categorías jerárquicas
- `Brand`: Marcas de productos

#### 3. **Gestión de Inventario**

- `InventoryLocation`: Ubicaciones de almacén
- `InventoryLevel`: Niveles de stock por ubicación
- `InventoryMovement`: Movimientos de inventario

#### 4. **Sistema de Órdenes**

- `Order`: Órdenes de compra
- `OrderItem`: Items de las órdenes
- `Transaction`: Transacciones de pago

#### 5. **Carrito y Lista de Deseos**

- `Cart`: Carritos de compra
- `CartLineItem`: Items del carrito
- `Wishlist`: Listas de deseos
- `WishlistItem`: Items de la lista

#### 6. **Sistema de Reseñas**

- `ProductReview`: Reseñas de productos
- `ReviewVote`: Votos de utilidad en reseñas

#### 7. **Descuentos**

- `DiscountCode`: Códigos de descuento
- `DiscountCodeUsage`: Uso de códigos

### Enumeraciones

```typescript
enum Role {
  USER,
  ADMIN,
}
enum ProductStatus {
  DRAFT,
  ACTIVE,
  ARCHIVED,
}
enum OrderStatus {
  PENDING,
  CONFIRMED,
  PROCESSING,
  SHIPPED,
  DELIVERED,
  CANCELLED,
  REFUNDED,
}
enum FinancialStatus {
  PENDING,
  AUTHORIZED,
  PAID,
  PARTIALLY_PAID,
  REFUNDED,
  PARTIALLY_REFUNDED,
  VOIDED,
}
enum InventoryMovementType {
  ORDER,
  SALE,
  RESTOCK,
  ADJUSTMENT,
  RETURN,
}
```

## API Endpoints

### Base URL

- **Desarrollo**: `http://localhost:3000`
- **Documentación**: `http://localhost:3000/api/docs`

### Módulos de API

#### 1. **Autorización** (`/auth`)

- `POST /auth/register` - Registro de usuario
- `POST /auth/login` - Inicio de sesión

#### 2. **Usuarios** (`/users`)

- Gestión de perfiles de usuario
- Gestión de direcciones
- Configuraciones de usuario

#### 3. **Productos** (`/products`)

- `GET /products/get-all-products` - Listar productos (público)
- `GET /products/find-product/:id` - Obtener producto (público)
- `POST /products/add-product` - Crear producto (ADMIN)
- `PATCH /products/update-product/:id` - Actualizar producto (ADMIN)
- `DELETE /products/delete-product/:id` - Eliminar producto (ADMIN)

#### 4. **Categorías** (`/products`)

- `GET /products/get-all-categories` - Listar categorías
- `GET /products/find-category/:id` - Obtener categoría
- `POST /products/add-category` - Crear categoría (ADMIN)
- `PATCH /products/update-category/:id` - Actualizar categoría (ADMIN)
- `DELETE /products/delete-category/:id` - Eliminar categoría (ADMIN)

#### 5. **Marcas** (`/products`)

- `GET /products/get-all-brands` - Listar marcas
- `GET /products/find-brand/:id` - Obtener marca
- `POST /products/add-brand` - Crear marca (ADMIN)
- `PATCH /products/update-brand/:id` - Actualizar marca (ADMIN)
- `DELETE /products/delete-brand/:id` - Eliminar marca (ADMIN)

#### 6. **Carrito** (`/cart`)

- Gestión del carrito de compras
- Agregar/quitar items
- Actualizar cantidades

#### 7. **Órdenes** (`/orders`)

- Crear órdenes
- Gestión de estados
- Historial de órdenes

#### 8. **Inventario** (`/inventory`)

- Gestión de stock
- Movimientos de inventario
- Ubicaciones de almacén

#### 9. **Reseñas** (`/reviews`)

- Sistema de reseñas y calificaciones
- Votos de utilidad

#### 10. **Lista de Deseos** (`/wishlist`)

- Gestión de listas de deseos
- Agregar/quitar productos

## Autenticación y Autorización

### Sistema de Autenticación

- **JWT Tokens**: Tokens de acceso con expiración
- **Bearer Authentication**: Autenticación por header
- **Roles**: USER y ADMIN

### Guards Implementados

- `JwtAuthGuard`: Verificación de token JWT
- `RolesGuard`: Control de acceso basado en roles

### Decoradores Personalizados

- `@Public()`: Endpoints públicos (sin autenticación)
- `@Roles('ADMIN')`: Endpoints que requieren rol ADMIN
- `@CurrentUser()`: Obtener usuario actual del token

## Características Principales

### 1. **Gestión de Productos Completa**

- Productos con variantes (color, talla, etc.)
- Múltiples imágenes por producto
- Especificaciones técnicas
- SEO optimizado
- Categorización jerárquica

### 2. **Sistema de Inventario Avanzado**

- Múltiples ubicaciones de almacén
- Seguimiento de movimientos
- Políticas de inventario
- Stock disponible vs comprometido

### 3. **Carrito de Compras Persistente**

- Carrito por usuario o sesión
- Persistencia en base de datos
- Expiración automática

### 4. **Sistema de Órdenes Robusto**

- Estados de orden completos
- Seguimiento financiero
- Transacciones de pago
- Direcciones de envío/facturación

### 5. **Sistema de Reseñas**

- Calificaciones por estrellas
- Reseñas verificadas por compra
- Sistema de votos de utilidad
- Moderación de contenido

### 6. **Gestión de Archivos**

- Subida de imágenes para productos
- Validación de tipos de archivo
- Integración con Supabase Storage

## Configuración de Desarrollo

### Requisitos Previos

- Node.js 18+
- npm o yarn
- PostgreSQL (o cuenta Supabase)

### Instalación

```bash
# Clonar repositorio
git clone <repository-url>
cd pixelyte-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# Ejecutar migraciones
npx prisma migrate dev

# Ejecutar seed (opcional)
npm run seed

# Iniciar en modo desarrollo
npm run start:dev
```

### Base de Datos

```bash
# Generar cliente Prisma
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre-migracion

# Ver base de datos
npx prisma studio
```

## Documentación API

La documentación completa de la API está disponible en Swagger UI:

- **URL**: `http://localhost:3000/api/docs`
- **Características**:
  - Documentación interactiva
  - Ejemplos de requests/responses
  - Autenticación Bearer token
  - Agrupación por módulos
  - Esquemas de datos detallados

## Testing

### Tipos de Pruebas

- **Unitarias**: Jest para servicios y controladores
- **E2E**: Supertest para endpoints completos
- **Cobertura**: Reportes de cobertura de código

### Ejecutar Pruebas

```bash
# Pruebas unitarias
npm run test

# Pruebas E2E
npm run test:e2e

# Cobertura
npm run test:cov

# Modo watch
npm run test:watch
```

## Despliegue

### Preparación para Producción

```bash
# Compilar aplicación
npm run build

# Ejecutar en producción
npm run start:prod
```

### Variables de Entorno de Producción

- `NODE_ENV=production`
- `DATABASE_URL`: URL de base de datos de producción
- `JWT_SECRET`: Secreto para JWT tokens
- `PORT`: Puerto del servidor

## Seguridad

### Medidas Implementadas

- **Validación de entrada**: class-validator en todos los DTOs
- **Sanitización**: Whitelist de propiedades
- **Autenticación JWT**: Tokens seguros con expiración
- **Control de acceso**: Guards basados en roles
- **CORS**: Configuración de CORS habilitada
- **Validación de archivos**: Tipos y tamaños permitidos

### Recomendaciones Adicionales

- Usar HTTPS en producción
- Configurar rate limiting
- Implementar logging de seguridad
- Monitoreo de errores
- Backup regular de base de datos

## Mantenimiento

### Logs y Monitoreo

- Logs estructurados con NestJS Logger
- Manejo de errores centralizado
- Métricas de performance

### Actualizaciones

- Dependencias actualizadas regularmente
- Migraciones de base de datos versionadas
- Testing antes de despliegues

## Contacto y Soporte

- **Autor**: Manuel Perlera
- **Documentación API**: `/api/docs`
- **Repositorio**: [URL del repositorio]

---

_Esta documentación está actualizada a la fecha de creación del proyecto y debe mantenerse actualizada con los cambios futuros._
