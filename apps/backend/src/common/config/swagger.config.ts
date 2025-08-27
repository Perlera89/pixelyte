import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('Pixelyte Backend API')
  .setDescription(
    `
## Descripción

Un backend completo desarrollado con NestJS para gestión de ecommerce. Esta API proporciona todas las funcionalidades necesarias para una plataforma de ventas en línea moderna.

## Características principales

- 🔐 **Autenticación JWT**: Sistema completo de autenticación y autorización
- 🛍️ **Gestión de productos**: Catálogo completo con filtros avanzados y búsqueda
- 🛒 **Carrito persistente**: Sincronización entre localStorage y servidor
- 📦 **Proceso de checkout**: Validación de stock y procesamiento de pagos
- ❤️ **Lista de deseos**: Gestión persistente de productos favoritos
- 👤 **Gestión de usuarios**: Perfiles, direcciones y preferencias
- 🏪 **Panel de administración**: Gestión completa de productos, órdenes y usuarios
- 📊 **Métricas y reportes**: Dashboard con estadísticas de ventas

## Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. Para acceder a endpoints protegidos:

1. **Registrarse o iniciar sesión** para obtener un token
2. **Incluir el token** en el header: \`Authorization: Bearer <token>\`
3. Los tokens **expiran en 24 horas** y pueden ser renovados

### Ejemplo de uso:

\`\`\`javascript
// 1. Login
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'usuario@ejemplo.com', 
    password: 'password123' 
  })
});
const { token } = await response.json();

// 2. Usar token en requests posteriores
const protectedResponse = await fetch('/api/users/profile', {
  headers: { 'Authorization': \`Bearer \${token}\` }
});
\`\`\`

## Códigos de respuesta

| Código | Descripción |
|--------|-------------|
| **200** | Operación exitosa |
| **201** | Recurso creado exitosamente |
| **204** | Operación exitosa sin contenido |
| **400** | Datos de entrada inválidos |
| **401** | No autenticado |
| **403** | Sin permisos suficientes |
| **404** | Recurso no encontrado |
| **409** | Conflicto (ej: email duplicado) |
| **500** | Error interno del servidor |

## Paginación

Los endpoints que devuelven listas utilizan paginación estándar:

\`\`\`json
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
\`\`\`

## Filtros y búsqueda

Los productos soportan filtros avanzados:

- **Categoría**: \`category=laptops\`
- **Marca**: \`brand=techbrand\`
- **Precio**: \`minPrice=100&maxPrice=1000\`
- **Stock**: \`inStock=true\`
- **Destacados**: \`isFeatured=true\`
- **Ordenamiento**: \`sortBy=price&sortOrder=asc\`
- **Búsqueda**: \`search=gaming laptop\`

## Manejo de errores

Todos los errores siguen un formato consistente:

\`\`\`json
{
  "statusCode": 400,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": ["email must be a valid email"],
  "timestamp": "2024-01-15T10:30:00.000Z",
  "path": "/api/auth/register"
}
\`\`\`

## Roles de usuario

| Rol | Descripción |
|-----|-------------|
| **USER** | Usuario regular con acceso a funciones básicas |
| **ADMIN** | Administrador con acceso completo al sistema |
| **MODERATOR** | Moderador con permisos limitados de administración |

## Límites de rate limiting

- **100 requests por 15 minutos** por IP
- **Endpoints de autenticación**: 5 intentos por 15 minutos
- **Uploads de archivos**: 10 MB máximo por archivo

## Soporte

Para soporte técnico o reportar bugs:
- **Email**: dev@pixelyte.com
- **Documentación**: https://docs.pixelyte.com
- **GitHub**: https://github.com/pixelyte/backend
  `,
  )
  .setVersion('1.0')
  .setContact(
    'Equipo de desarrollo Pixelyte',
    'https://pixelyte.com',
    'dev@pixelyte.com',
  )
  .setLicense('MIT', 'https://opensource.org/licenses/MIT')
  .addServer('http://localhost:4000', 'Servidor de desarrollo')
  .addServer('https://api.pixelyte.com', 'Servidor de producción')
  .addTag('1. Autorización', '🔐 Autenticación y autorización con JWT')
  .addTag('2. Usuarios', '👤 Gestión de usuarios y perfiles')
  .addTag('3. Direcciones de usuario', '📍 Gestión de direcciones de usuario')
  .addTag('4. Perfil de usuario', '👤 Gestión de perfil de usuario')
  .addTag('5. Productos', '🛍️ Catálogo de productos con filtros y búsqueda')
  .addTag('6. Categorías', '📂 Gestión de categorías de productos')
  .addTag('7. Marcas', '🏷️ Gestión de marcas de productos')
  .addTag('8. Inventario', '📦 Gestión de inventario y stock')
  .addTag(
    '9. Ubicaciones de inventario',
    '🏪 Gestión de ubicaciones de inventario',
  )
  .addTag('10. Niveles de inventario', '📊 Gestión de niveles de inventario')
  .addTag(
    '11. Movimientos de inventario',
    '📈 Gestión de movimientos de inventario',
  )
  .addTag('12. Carrito', '🛒 Carrito de compras persistente')
  .addTag('12. Wishlist', '❤️ Lista de deseos persistente')
  .addTag('13. Reseñas', '⭐ Sistema de reseñas y votaciones')
  .addTag('14. Órdenes', '📦 Sistema de órdenes y transacciones')
  .addTag('Admin', '🔧 Panel de administración completo')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'JWT',
      description: 'Ingresa tu JWT token obtenido del login',
      in: 'header',
    },
    'JWT-auth',
  )
  .build();

export const swaggerOptions = {
  customSiteTitle: 'Pixelyte API Documentation',
  customfavIcon: '/favicon.ico',
  customCssUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui.min.css',
  customJs: [
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-bundle.js',
    'https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/4.15.5/swagger-ui-standalone-preset.js',
  ],
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'none',
    filter: true,
    showExtensions: true,
    showCommonExtensions: true,
    tryItOutEnabled: true,
    requestInterceptor: (req: any) => {
      console.log('Swagger request:', req.url);
      return req;
    },
    responseInterceptor: (res: any) => {
      console.log('Swagger response:', res.status);
      return res;
    },
  },
  customCss: `
    .swagger-ui .topbar { display: none }
    .swagger-ui .info { margin: 50px 0 }
    .swagger-ui .info .title { 
      color: #3b82f6; 
      font-size: 36px;
      font-weight: bold;
    }
    .swagger-ui .info .description { 
      font-size: 14px; 
      line-height: 1.6;
    }
    .swagger-ui .scheme-container { 
      background: #f8fafc; 
      padding: 15px; 
      border-radius: 8px;
      border: 1px solid #e2e8f0;
    }
    .swagger-ui .auth-wrapper {
      padding: 20px;
      border: 1px solid #3b82f6;
      border-radius: 8px;
      background: #eff6ff;
    }
    .swagger-ui .opblock.opblock-post {
      border-color: #10b981;
      background: rgba(16, 185, 129, 0.1);
    }
    .swagger-ui .opblock.opblock-get {
      border-color: #3b82f6;
      background: rgba(59, 130, 246, 0.1);
    }
    .swagger-ui .opblock.opblock-put {
      border-color: #f59e0b;
      background: rgba(245, 158, 11, 0.1);
    }
    .swagger-ui .opblock.opblock-delete {
      border-color: #ef4444;
      background: rgba(239, 68, 68, 0.1);
    }
    .swagger-ui .opblock-tag {
      font-size: 18px;
      font-weight: bold;
      color: #1f2937;
      border-bottom: 2px solid #e5e7eb;
      padding-bottom: 10px;
      margin-bottom: 20px;
    }
    .swagger-ui .parameter__name {
      font-weight: bold;
      color: #374151;
    }
    .swagger-ui .response-col_status {
      font-weight: bold;
    }
    .swagger-ui .response-col_status.response-200 {
      color: #10b981;
    }
    .swagger-ui .response-col_status.response-201 {
      color: #10b981;
    }
    .swagger-ui .response-col_status.response-400 {
      color: #f59e0b;
    }
    .swagger-ui .response-col_status.response-401 {
      color: #ef4444;
    }
    .swagger-ui .response-col_status.response-404 {
      color: #ef4444;
    }
    .swagger-ui .response-col_status.response-500 {
      color: #7c2d12;
    }
  `,
};
