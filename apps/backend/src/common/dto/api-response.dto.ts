import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Elementos por página',
    example: 12,
  })
  limit: number;

  @ApiProperty({
    description: 'Total de elementos',
    example: 150,
  })
  totalCount: number;

  @ApiProperty({
    description: 'Total de páginas',
    example: 13,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Indica si hay página siguiente',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Indica si hay página anterior',
    example: false,
  })
  hasPreviousPage: boolean;
}

export class ApiResponseDto<T> {
  @ApiProperty({
    description: 'Indica si la operación fue exitosa',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Mensaje descriptivo de la respuesta',
    example: 'Operación completada exitosamente',
  })
  message: string;

  @ApiProperty({
    description: 'Datos de la respuesta',
  })
  data: T;

  @ApiProperty({
    description: 'Timestamp de la respuesta',
    example: '2024-01-15T10:30:00.000Z',
  })
  timestamp: string;
}

export class PaginatedResponseDto<T> extends ApiResponseDto<T[]> {
  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

export class ProductResponseDto {
  @ApiProperty({
    description: 'ID único del producto',
    example: 'uuid-producto',
  })
  id: string;

  @ApiProperty({
    description: 'SKU del producto',
    example: 'LAPTOP001',
  })
  sku: string;

  @ApiProperty({
    description: 'Nombre del producto',
    example: 'Laptop Gaming XYZ',
  })
  name: string;

  @ApiProperty({
    description: 'Slug del producto',
    example: 'laptop-gaming-xyz',
  })
  slug: string;

  @ApiProperty({
    description: 'Descripción corta',
    example: 'Laptop para gaming de alto rendimiento',
  })
  shortDescription: string;

  @ApiProperty({
    description: 'Precio base del producto',
    example: 1299.99,
  })
  basePrice: number;

  @ApiProperty({
    description: 'Precio de comparación (precio original)',
    example: 1499.99,
    required: false,
  })
  compareAtPrice?: number;

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
    description: 'Información de la marca',
    example: {
      id: 'uuid-marca',
      name: 'TechBrand',
      slug: 'techbrand',
    },
  })
  brand: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiProperty({
    description: 'Información de la categoría',
    example: {
      id: 'uuid-categoria',
      name: 'Laptops',
      slug: 'laptops',
    },
  })
  category: {
    id: string;
    name: string;
    slug: string;
  };

  @ApiProperty({
    description: 'Imágenes del producto',
    type: 'array',
    example: [
      {
        id: 'uuid-imagen',
        url: 'https://example.com/image1.jpg',
        altText: 'Laptop vista frontal',
        isPrimary: true,
      },
    ],
  })
  productImages: Array<{
    id: string;
    url: string;
    altText: string;
    isPrimary: boolean;
  }>;

  @ApiProperty({
    description: 'Stock disponible',
    example: 25,
  })
  stock: number;

  @ApiProperty({
    description: 'Rating promedio del producto',
    example: 4.5,
  })
  averageRating: number;

  @ApiProperty({
    description: 'Número total de reseñas',
    example: 128,
  })
  reviewCount: number;

  @ApiProperty({
    description: 'Fecha de creación',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;
}

export class CartResponseDto {
  @ApiProperty({
    description: 'ID único del carrito',
    example: 'uuid-carrito',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: 'uuid-usuario',
  })
  userId: string;

  @ApiProperty({
    description: 'Items en el carrito',
    type: 'array',
    example: [
      {
        id: 'uuid-item',
        variantId: 'uuid-variante',
        quantity: 2,
        unitPrice: 1299.99,
        totalPrice: 2599.98,
        product: {
          id: 'uuid-producto',
          name: 'Laptop Gaming XYZ',
          slug: 'laptop-gaming-xyz',
          basePrice: 1299.99,
          productImages: [
            {
              url: 'https://example.com/image1.jpg',
              altText: 'Laptop vista frontal',
              isPrimary: true,
            },
          ],
        },
      },
    ],
  })
  items: Array<{
    id: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      productImages: Array<{
        url: string;
        altText: string;
        isPrimary: boolean;
      }>;
    };
  }>;

  @ApiProperty({
    description: 'Subtotal del carrito',
    example: 2599.98,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Total de items en el carrito',
    example: 2,
  })
  itemCount: number;

  @ApiProperty({
    description: 'Fecha de creación del carrito',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;
}

export class OrderResponseDto {
  @ApiProperty({
    description: 'ID único de la orden',
    example: 'uuid-orden',
  })
  id: string;

  @ApiProperty({
    description: 'Número de orden único',
    example: '202412250001',
  })
  orderNumber: string;

  @ApiProperty({
    description: 'Estado de la orden',
    example: 'PENDING',
    enum: [
      'PENDING',
      'CONFIRMED',
      'PROCESSING',
      'SHIPPED',
      'DELIVERED',
      'CANCELLED',
    ],
  })
  status: string;

  @ApiProperty({
    description: 'Total de la orden',
    example: 1299.99,
  })
  totalPrice: number;

  @ApiProperty({
    description: 'Subtotal de productos',
    example: 1199.99,
  })
  subtotal: number;

  @ApiProperty({
    description: 'Costo de envío',
    example: 100.0,
  })
  shippingCost: number;

  @ApiProperty({
    description: 'Impuestos',
    example: 0.0,
  })
  tax: number;

  @ApiProperty({
    description: 'Items de la orden',
    type: 'array',
    example: [
      {
        id: 'uuid-item',
        productId: 'uuid-producto',
        variantId: 'uuid-variante',
        quantity: 1,
        unitPrice: 1199.99,
        totalPrice: 1199.99,
        product: {
          name: 'Laptop Gaming XYZ',
          slug: 'laptop-gaming-xyz',
          sku: 'LAPTOP001',
        },
      },
    ],
  })
  items: Array<{
    id: string;
    productId: string;
    variantId: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    product: {
      name: string;
      slug: string;
      sku: string;
    };
  }>;

  @ApiProperty({
    description: 'Dirección de envío',
    example: {
      country: 'Colombia',
      stateProvince: 'Cundinamarca',
      city: 'Bogotá',
      postalCode: '110111',
      address: 'Calle 123 #45-67',
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
    description: 'Fecha de creación de la orden',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;
}

export class WishlistResponseDto {
  @ApiProperty({
    description: 'ID único de la wishlist',
    example: 'uuid-wishlist',
  })
  id: string;

  @ApiProperty({
    description: 'ID del usuario propietario',
    example: 'uuid-usuario',
  })
  userId: string;

  @ApiProperty({
    description: 'Items en la wishlist',
    type: 'array',
    example: [
      {
        id: 'uuid-item',
        productId: 'uuid-producto',
        variantId: 'uuid-variante',
        product: {
          id: 'uuid-producto',
          name: 'Laptop Gaming XYZ',
          slug: 'laptop-gaming-xyz',
          basePrice: 1299.99,
          compareAtPrice: 1499.99,
          productImages: [
            {
              url: 'https://example.com/image1.jpg',
              altText: 'Laptop vista frontal',
              isPrimary: true,
            },
          ],
          brand: {
            name: 'TechBrand',
          },
          category: {
            name: 'Laptops',
          },
        },
        addedAt: '2024-01-15T10:30:00.000Z',
      },
    ],
  })
  items: Array<{
    id: string;
    productId: string;
    variantId?: string;
    product: {
      id: string;
      name: string;
      slug: string;
      basePrice: number;
      compareAtPrice?: number;
      productImages: Array<{
        url: string;
        altText: string;
        isPrimary: boolean;
      }>;
      brand: {
        name: string;
      };
      category: {
        name: string;
      };
    };
    addedAt: string;
  }>;

  @ApiProperty({
    description: 'Total de items en la wishlist',
    example: 5,
  })
  totalItems: number;

  @ApiProperty({
    description: 'Fecha de creación de la wishlist',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Fecha de última actualización',
    example: '2024-01-15T10:30:00.000Z',
  })
  updatedAt: string;
}
