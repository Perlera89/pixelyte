# Error Handling System

Este sistema de manejo de errores proporciona una forma consistente y estructurada de manejar errores en toda la aplicación NestJS.

## Componentes

### 1. DTOs de Respuesta de Error

- **ErrorResponseDto**: Estructura básica de respuesta de error
- **ValidationErrorResponseDto**: Para errores de validación con detalles por campo
- **PrismaErrorResponseDto**: Para errores específicos de Prisma

### 2. Códigos de Error

El enum `ErrorCodes` define códigos consistentes para diferentes tipos de errores:

```typescript
import { ErrorCodes } from './common/enums/error-codes.enum';

// Ejemplos de códigos disponibles
ErrorCodes.VALIDATION_ERROR;
ErrorCodes.RESOURCE_NOT_FOUND;
ErrorCodes.INSUFFICIENT_STOCK;
ErrorCodes.UNAUTHORIZED;
// ... y muchos más
```

### 3. Excepciones de Negocio

Excepciones personalizadas para lógica de negocio:

```typescript
import {
  BusinessException,
  InsufficientStockException,
  EmptyCartException,
} from './common/exceptions';

// Uso básico
throw new BusinessException(
  'Custom error message',
  ErrorCodes.VALIDATION_ERROR,
  HttpStatus.BAD_REQUEST,
  ['Detail 1', 'Detail 2'],
);

// Excepciones específicas
throw new InsufficientStockException('iPhone 14', 5);
throw new EmptyCartException();
```

### 4. Utilidad de Errores

La clase `ErrorUtil` proporciona métodos convenientes para lanzar errores comunes:

```typescript
import { ErrorUtil } from './common/utils/error.util';

// Lanzar error de recurso no encontrado
ErrorUtil.throwNotFound('Product', 'product-123');

// Lanzar error de recurso ya existente
ErrorUtil.throwAlreadyExists('User', 'email');

// Lanzar error de permisos insuficientes
ErrorUtil.throwInsufficientPermissions('delete products');

// Lanzar error de validación
ErrorUtil.throwValidationError('Invalid data', ['Field is required']);
```

### 5. Servicio de Logging

El `LoggerService` proporciona logging estructurado:

```typescript
import { LoggerService } from './common/services/logger.service';

constructor(private logger: LoggerService) {}

// Logging básico
this.logger.log('Operation completed', { userId: '123' });
this.logger.error('Error occurred', error.stack, { userId: '123' });

// Logging especializado
this.logger.logRequest('GET', '/api/products', 200, 150);
this.logger.logBusinessEvent('product_created', { productId: '123' });
this.logger.logSecurityEvent('failed_login', { ip: '192.168.1.1' });
```

### 6. Filtros de Excepción

#### AllExceptionsFilter

Maneja todos los tipos de errores de forma global:

- Errores HTTP estándar
- Errores de Prisma (P2002, P2003, P2025, etc.)
- Errores de validación
- Errores desconocidos

#### HttpExceptionFilter

Manejo específico para excepciones HTTP con logging apropiado.

## Configuración

### 1. En main.ts

```typescript
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggerService } from './common/services/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const loggerService = app.get(LoggerService);
  app.useGlobalFilters(new AllExceptionsFilter(loggerService));

  // ... resto de configuración
}
```

### 2. En módulos

El `LoggerService` está disponible globalmente a través del `CommonModule`.

## Uso en Servicios

```typescript
import { Injectable } from '@nestjs/common';
import { LoggerService } from '../common/services/logger.service';
import { ErrorUtil } from '../common/utils/error.util';
import { ErrorCodes } from '../common/enums/error-codes.enum';

@Injectable()
export class ProductsService {
  constructor(private logger: LoggerService) {}

  async getProduct(id: string) {
    try {
      const product = await this.prisma.product.findUnique({
        where: { id },
      });

      if (!product) {
        this.logger.logBusinessEvent('product_not_found', { productId: id });
        ErrorUtil.throwNotFound('Product', id);
      }

      return product;
    } catch (error) {
      this.logger.logError(error, { productId: id });
      throw error;
    }
  }
}
```

## Respuestas de Error

### Estructura Estándar

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

### Error de Validación

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

### Error de Prisma

```json
{
  "statusCode": 409,
  "message": "Resource already exists",
  "code": "UNIQUE_CONSTRAINT_VIOLATION",
  "prismaCode": "P2002",
  "field": "email",
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/users/register",
  "errorId": "err_1705312200000_abc123def"
}
```

## Logging

### Formato de Log

Todos los logs se formatean como JSON estructurado:

```json
{
  "timestamp": "2024-01-15T10:30:00.000Z",
  "level": "ERROR",
  "message": "Product not found",
  "context": {
    "errorId": "err_1705312200000_abc123def",
    "userId": "user-123",
    "method": "GET",
    "url": "/api/products/123",
    "type": "error",
    "errorName": "BusinessException"
  }
}
```

### Tipos de Log

- **request**: Logs de requests HTTP
- **error**: Logs de errores
- **business_event**: Eventos de negocio
- **security_event**: Eventos de seguridad

## Mejores Prácticas

1. **Usar ErrorUtil para errores comunes**: Proporciona consistencia y reduce código repetitivo.

2. **Loggear eventos de negocio**: Ayuda con el debugging y análisis.

3. **Incluir contexto relevante**: Siempre incluir información útil como userId, productId, etc.

4. **No exponer información sensible**: El sistema automáticamente redacta campos sensibles.

5. **Usar códigos de error específicos**: Facilita el manejo en el frontend.

6. **Manejar errores de Prisma apropiadamente**: El sistema convierte automáticamente códigos de Prisma a errores de negocio.

## Testing

El sistema incluye tests completos para:

- Filtros de excepción
- Excepciones de negocio
- Servicio de logging
- Utilidades de error

Ejecutar tests:

```bash
npm test -- --testPathPattern="common.*spec.ts"
```
