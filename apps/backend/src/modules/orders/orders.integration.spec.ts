import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { OrdersModule } from './orders.module';
import { PrismaService } from '../../common/services/prisma.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('OrdersController (Integration)', () => {
  let app: INestApplication;
  let prismaService: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
    cart: {
      findFirst: jest.fn(),
    },
    order: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
      aggregate: jest.fn(),
    },
    transaction: {
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
    },
    productVariant: {
      update: jest.fn(),
    },
    inventoryLocation: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    inventoryMovement: {
      create: jest.fn(),
    },
    inventoryLevel: {
      upsert: jest.fn(),
    },
    cartLineItem: {
      deleteMany: jest.fn(),
    },
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [OrdersModule],
    })
      .overrideProvider(PrismaService)
      .useValue(mockPrismaService)
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);

    // Mock user in request
    app.use((req, res, next) => {
      req.user = { id: 'user-123', email: 'test@example.com' };
      next();
    });

    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /orders/checkout', () => {
    const checkoutDto = {
      shippingAddress: {
        country: 'Colombia',
        stateProvince: 'Cundinamarca',
        city: 'Bogotá',
        postalCode: '110111',
        address: 'Calle 123 #45-67',
      },
      billingAddress: {
        country: 'Colombia',
        stateProvince: 'Cundinamarca',
        city: 'Bogotá',
        postalCode: '110111',
        address: 'Calle 123 #45-67',
      },
      paymentMethod: {
        type: 'credit_card',
        details: { last4: '1234', brand: 'visa' },
      },
    };

    it('should successfully process checkout', async () => {
      const mockUser = {
        email: 'test@example.com',
        names: 'Juan',
        surnames: 'Pérez',
      };

      const mockCart = {
        id: 'cart-123',
        lineItems: [
          {
            id: 'item-1',
            variantId: 'variant-1',
            quantity: 2,
            variant: {
              id: 'variant-1',
              productId: 'product-1',
              price: { toNumber: () => 100 },
              title: 'Variant 1',
              sku: 'SKU001',
              isActive: true,
              inventoryPolicy: 'DENY',
              inventoryQuantity: 10,
              product: {
                id: 'product-1',
                name: 'Test Product',
                isActive: true,
                brand: { name: 'Test Brand' },
                productImages: [{ url: 'image.jpg' }],
              },
            },
          },
        ],
      };

      const mockOrder = {
        id: 'order-123',
        orderNumber: '202412250001',
        status: 'PENDING',
        totalPrice: { toNumber: () => 200 },
        createdAt: new Date(),
        orderItems: [
          {
            id: 'item-1',
            title: 'Test Product',
            variantTitle: 'Variant 1',
            quantity: 2,
            price: { toNumber: () => 100 },
            product: {
              productImages: [{ url: 'image.jpg' }],
            },
          },
        ],
      };

      const mockTransaction = {
        id: 'transaction-123',
      };

      const mockLocation = {
        id: 'location-123',
        name: 'Almacén Principal',
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.order.create.mockResolvedValue(mockOrder);
      mockPrismaService.transaction.create.mockResolvedValue(mockTransaction);
      mockPrismaService.transaction.update.mockResolvedValue(mockTransaction);
      mockPrismaService.inventoryLocation.findFirst.mockResolvedValue(
        mockLocation,
      );
      mockPrismaService.order.update.mockResolvedValue(mockOrder);

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .send(checkoutDto)
        .expect(201);

      expect(response.body).toHaveProperty('id', 'order-123');
      expect(response.body).toHaveProperty('orderNumber', '202412250001');
      expect(response.body).toHaveProperty('paymentStatus', 'SUCCESS');
    });

    it('should return 400 when cart is empty', async () => {
      mockPrismaService.cart.findFirst.mockResolvedValue(null);

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .send(checkoutDto)
        .expect(400);

      expect(response.body.message).toContain('carrito está vacío');
    });

    it('should return 400 when insufficient stock', async () => {
      const mockCart = {
        id: 'cart-123',
        lineItems: [
          {
            id: 'item-1',
            variantId: 'variant-1',
            quantity: 15, // More than available
            variant: {
              id: 'variant-1',
              productId: 'product-1',
              price: { toNumber: () => 100 },
              title: 'Variant 1',
              sku: 'SKU001',
              isActive: true,
              inventoryPolicy: 'DENY',
              inventoryQuantity: 10, // Only 10 available
              product: {
                id: 'product-1',
                name: 'Test Product',
                isActive: true,
                brand: { name: 'Test Brand' },
                productImages: [{ url: 'image.jpg' }],
              },
            },
          },
        ],
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);

      const response = await request(app.getHttpServer())
        .post('/orders/checkout')
        .send(checkoutDto)
        .expect(400);

      expect(response.body.message).toContain('Stock insuficiente');
    });
  });

  describe('GET /orders/my-orders', () => {
    it('should return user orders', async () => {
      const mockOrders = [
        {
          id: 'order-1',
          orderNumber: '202412250001',
          status: 'DELIVERED',
          totalPrice: { toNumber: () => 200 },
          createdAt: new Date(),
          orderItems: [],
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
      mockPrismaService.order.count.mockResolvedValue(1);

      const response = await request(app.getHttpServer())
        .get('/orders/my-orders')
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1);
      expect(response.body).toHaveProperty('totalCount', 1);
    });

    it('should support pagination', async () => {
      mockPrismaService.order.findMany.mockResolvedValue([]);
      mockPrismaService.order.count.mockResolvedValue(0);

      const response = await request(app.getHttpServer())
        .get('/orders/my-orders?page=2&limit=5')
        .expect(200);

      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 5, // (page - 1) * limit
          take: 5,
        }),
      );
    });
  });

  describe('GET /orders/my-orders/:id', () => {
    it('should return specific user order', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 'user-123',
        orderNumber: '202412250001',
        orderItems: [],
        transactions: [],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const response = await request(app.getHttpServer())
        .get('/orders/my-orders/order-123')
        .expect(200);

      expect(response.body).toHaveProperty('id', 'order-123');
      expect(response.body).toHaveProperty('orderNumber', '202412250001');
    });

    it('should return 404 when order not found', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await request(app.getHttpServer())
        .get('/orders/my-orders/nonexistent-order')
        .expect(404);
    });

    it('should return 403 when order belongs to different user', async () => {
      const mockOrder = {
        id: 'order-123',
        userId: 'different-user', // Different user
        orderNumber: '202412250001',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await request(app.getHttpServer())
        .get('/orders/my-orders/order-123')
        .expect(403);
    });
  });
});
