import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * Modelo de datos: Usuario
 */
export class UserModelDto {
  @ApiProperty({
    description: 'ID único del usuario',
    example: 'uuid-usuario',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Dirección de correo electrónico (única)',
    example: 'usuario@ejemplo.com',
    format: 'email',
  })
  email: string;

  @ApiProperty({
    description: 'Nombres del usuario',
    example: 'Juan Carlos',
    minLength: 2,
    maxLength: 100,
  })
  names: string;

  @ApiProperty({
    description: 'Apellidos del usuario',
    example: 'Pérez González',
    minLength: 2,
    maxLength: 100,
  })
  surnames: string;

  @ApiPropertyOptional({
    description: 'Número de teléfono',
    example: '+57 300 123 4567',
  })
  phone?: string;

  @ApiPropertyOptional({
    description: 'Fecha de nacimiento',
    example: '1990-01-15',
    format: 'date',
  })
  dateOfBirth?: string;

  @ApiProperty({
    description: 'Indica si el email ha sido verificado',
    example: true,
  })
  emailVerified: boolean;

  @ApiProperty({
    description: 'Rol del usuario en el sistema',
    example: 'USER',
    enum: ['USER', 'ADMIN', 'MODERATOR'],
  })
  role: string;

  @ApiProperty({
    description: 'Indica si el usuario está activo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación de la cuenta',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  updatedAt: string;
}

/**
 * Modelo de datos: Producto
 */
export class ProductModelDto {
  @ApiProperty({
    description: 'ID único del producto',
    example: 'uuid-producto',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'SKU único del producto',
    example: 'LAPTOP001',
    minLength: 3,
    maxLength: 50,
  })
  sku: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Gaming XYZ Pro',
    minLength: 3,
    maxLength: 200,
  })
  name: string;

  @ApiProperty({
    description: 'Slug único para URLs amigables',
    example: 'laptop-gaming-xyz-pro',
    pattern: '^[a-z0-9-]+$',
  })
  slug: string;

  @ApiProperty({
    description: 'Descripción corta del producto',
    example: 'Laptop para gaming de alto rendimiento con RTX 4080',
    maxLength: 500,
  })
  shortDescription: string;

  @ApiPropertyOptional({
    description: 'Descripción detallada del producto',
    example:
      'Esta laptop está diseñada específicamente para gaming profesional...',
  })
  longDescription?: string;

  @ApiProperty({
    description: 'ID de la marca del producto',
    example: 'uuid-marca',
    format: 'uuid',
  })
  brandId: string;

  @ApiProperty({
    description: 'ID de la categoría del producto',
    example: 'uuid-categoria',
    format: 'uuid',
  })
  categoryId: string;

  @ApiProperty({
    description: 'Precio base del producto',
    example: 1299.99,
    minimum: 0,
  })
  basePrice: number;

  @ApiPropertyOptional({
    description: 'Precio de comparación (precio original antes de descuento)',
    example: 1499.99,
    minimum: 0,
  })
  compareAtPrice?: number;

  @ApiPropertyOptional({
    description: 'Precio de costo para cálculos internos',
    example: 800.0,
    minimum: 0,
  })
  costPrice?: number;

  @ApiPropertyOptional({
    description: 'Peso del producto en gramos',
    example: 2500,
    minimum: 0,
  })
  weight?: number;

  @ApiPropertyOptional({
    description: 'Dimensiones del producto en cm',
    example: { length: 35, width: 25, height: 3 },
  })
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };

  @ApiProperty({
    description: 'Indica si el producto requiere envío físico',
    example: true,
  })
  requiresShipping: boolean;

  @ApiProperty({
    description: 'Indica si es un producto digital',
    example: false,
  })
  isDigital: boolean;

  @ApiProperty({
    description: 'Indica si el producto está destacado',
    example: true,
  })
  isFeatured: boolean;

  @ApiProperty({
    description: 'Indica si el producto está activo',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Estado del producto',
    example: 'ACTIVE',
    enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
  })
  status: string;

  @ApiPropertyOptional({
    description: 'Título SEO para motores de búsqueda',
    example: 'Laptop Gaming XYZ Pro - La mejor para profesionales',
    maxLength: 60,
  })
  seoTitle?: string;

  @ApiPropertyOptional({
    description: 'Descripción SEO para motores de búsqueda',
    example: 'Descubre la laptop gaming más avanzada del mercado con RTX 4080',
    maxLength: 160,
  })
  seoDescription?: string;

  @ApiProperty({
    description: 'Fecha de creación del producto',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  updatedAt: string;
}

/**
 * Modelo de datos: Categoría
 */
export class CategoryModelDto {
  @ApiProperty({
    description: 'ID único de la categoría',
    example: 'uuid-categoria',
    format: 'uuid',
  })
  id: string;

  @ApiPropertyOptional({
    description: 'ID de la categoría padre (para subcategorías)',
    example: 'uuid-categoria-padre',
    format: 'uuid',
  })
  parentId?: string;

  @ApiProperty({
    description: 'Nombre de la categoría',
    example: 'Laptops',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    description: 'Slug único para URLs amigables',
    example: 'laptops',
    pattern: '^[a-z0-9-]+$',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción de la categoría',
    example: 'Computadoras portátiles para trabajo, gaming y uso personal',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'Icono de la categoría',
    example: 'laptop-icon',
  })
  icon?: string;

  @ApiPropertyOptional({
    description: 'URL de la imagen de la categoría',
    example: 'https://example.com/categories/laptops.jpg',
  })
  imageUrl?: string;

  @ApiProperty({
    description: 'Orden de visualización',
    example: 1,
    minimum: 0,
  })
  sortOrder: number;

  @ApiProperty({
    description: 'Indica si la categoría está activa',
    example: true,
  })
  isActive: boolean;

  @ApiPropertyOptional({
    description: 'Título SEO',
    example: 'Laptops - Las mejores computadoras portátiles',
    maxLength: 60,
  })
  seoTitle?: string;

  @ApiPropertyOptional({
    description: 'Descripción SEO',
    example:
      'Encuentra las mejores laptops para trabajo, gaming y uso personal',
    maxLength: 160,
  })
  seoDescription?: string;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  updatedAt: string;
}

/**
 * Modelo de datos: Marca
 */
export class BrandModelDto {
  @ApiProperty({
    description: 'ID único de la marca',
    example: 'uuid-marca',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Nombre de la marca',
    example: 'TechBrand',
    minLength: 2,
    maxLength: 100,
  })
  name: string;

  @ApiProperty({
    description: 'Slug único para URLs amigables',
    example: 'techbrand',
    pattern: '^[a-z0-9-]+$',
  })
  slug: string;

  @ApiPropertyOptional({
    description: 'Descripción de la marca',
    example: 'Marca líder en tecnología y gaming',
  })
  description?: string;

  @ApiPropertyOptional({
    description: 'URL del sitio web oficial',
    example: 'https://www.techbrand.com',
    format: 'uri',
  })
  websiteUrl?: string;

  @ApiPropertyOptional({
    description: 'URL del logo de la marca',
    example: 'https://example.com/brands/techbrand-logo.png',
  })
  logoUrl?: string;

  @ApiProperty({
    description: 'Indica si la marca está activa',
    example: true,
  })
  isActive: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  updatedAt: string;
}

/**
 * Modelo de datos: Orden
 */
export class OrderModelDto {
  @ApiProperty({
    description: 'ID único de la orden',
    example: 'uuid-orden',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'Número de orden único y legible',
    example: '202412250001',
    pattern: '^[0-9]{12}$',
  })
  orderNumber: string;

  @ApiProperty({
    description: 'ID del usuario que realizó la orden',
    example: 'uuid-usuario',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'Estado actual de la orden',
    example: 'PENDING',
    enum: [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
      'REFUNDED',
    ],
  })
  status: string;

  @ApiProperty({
    description: 'Subtotal de productos (sin envío ni impuestos)',
    example: 1199.99,
    minimum: 0,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Costo de envío',
    example: 100.0,
    minimum: 0,
  })
  shippingCost: number;

  @ApiProperty({
    description: 'Impuestos aplicados',
    example: 0.0,
    minimum: 0,
  })
  tax: number;

  @ApiProperty({
    description: 'Descuentos aplicados',
    example: 50.0,
    minimum: 0,
  })
  discount: number;

  @ApiProperty({
    description: 'Total final de la orden',
    example: 1249.99,
    minimum: 0,
  })
  totalPrice: number;

  @ApiProperty({
    description: 'Moneda de la transacción',
    example: 'USD',
    enum: ['USD', 'EUR', 'COP', 'MXN'],
  })
  currency: string;

  @ApiProperty({
    description: 'Dirección de envío completa',
    example: {
      country: 'Colombia',
      stateProvince: 'Cundinamarca',
      city: 'Bogotá',
      postalCode: '110111',
      address: 'Calle 123 #45-67',
      addressLine: 'Apartamento 101',
      fullName: 'Juan Pérez',
      phone: '+57 300 123 4567',
    },
  })
  shippingAddress: {
    country: string;
    stateProvince: string;
    city: string;
    postalCode: string;
    address: string;
    addressLine?: string;
    fullName?: string;
    phone?: string;
  };

  @ApiProperty({
    description: 'Dirección de facturación completa',
    example: {
      country: 'Colombia',
      stateProvince: 'Cundinamarca',
      city: 'Bogotá',
      postalCode: '110111',
      address: 'Calle 123 #45-67',
      fullName: 'Juan Pérez',
    },
  })
  billingAddress: {
    country: string;
    stateProvince: string;
    city: string;
    postalCode: string;
    address: string;
    addressLine?: string;
    fullName?: string;
  };

  @ApiPropertyOptional({
    description: 'Notas adicionales de la orden',
    example: 'Entregar en horario de oficina',
  })
  notes?: string;

  @ApiProperty({
    description: 'Fecha de creación de la orden',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  updatedAt: string;
}

/**
 * Modelo de datos: Item de Carrito
 */
export class CartItemModelDto {
  @ApiProperty({
    description: 'ID único del item en el carrito',
    example: 'uuid-cart-item',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'ID del carrito al que pertenece',
    example: 'uuid-carrito',
    format: 'uuid',
  })
  cartId: string;

  @ApiProperty({
    description: 'ID de la variante del producto',
    example: 'uuid-variante',
    format: 'uuid',
  })
  variantId: string;

  @ApiProperty({
    description: 'Cantidad del producto en el carrito',
    example: 2,
    minimum: 1,
    maximum: 99,
  })
  quantity: number;

  @ApiProperty({
    description: 'Precio unitario al momento de agregar al carrito',
    example: 1299.99,
    minimum: 0,
  })
  unitPrice: number;

  @ApiProperty({
    description: 'Precio total del item (unitPrice * quantity)',
    example: 2599.98,
    minimum: 0,
  })
  totalPrice: number;

  @ApiPropertyOptional({
    description: 'Propiedades adicionales del item (personalizaciones, etc.)',
    example: { color: 'Negro', memoria: '16GB' },
  })
  properties?: Record<string, any>;

  @ApiProperty({
    description: 'Fecha de creación del item',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  updatedAt: string;
}

/**
 * Modelo de datos: Dirección de Usuario
 */
export class UserAddressModelDto {
  @ApiProperty({
    description: 'ID único de la dirección',
    example: 'uuid-direccion',
    format: 'uuid',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: 'uuid-usuario',
    format: 'uuid',
  })
  userId: string;

  @ApiProperty({
    description: 'País',
    example: 'Colombia',
    minLength: 2,
    maxLength: 100,
  })
  country: string;

  @ApiProperty({
    description: 'Estado o provincia',
    example: 'Cundinamarca',
    minLength: 2,
    maxLength: 100,
  })
  stateProvince: string;

  @ApiProperty({
    description: 'Ciudad',
    example: 'Bogotá',
    minLength: 2,
    maxLength: 100,
  })
  city: string;

  @ApiProperty({
    description: 'Código postal',
    example: '110111',
    minLength: 3,
    maxLength: 20,
  })
  postalCode: string;

  @ApiProperty({
    description: 'Dirección principal',
    example: 'Calle 123 #45-67',
    minLength: 5,
    maxLength: 200,
  })
  address: string;

  @ApiPropertyOptional({
    description: 'Línea adicional de dirección',
    example: 'Apartamento 101',
    maxLength: 200,
  })
  addressLine?: string;

  @ApiProperty({
    description: 'Indica si es la dirección predeterminada',
    example: true,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
    format: 'date-time',
  })
  updatedAt: string;
}
