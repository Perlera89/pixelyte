import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { PrismaService } from '../../common/services/prisma.service';

describe('OrdersService', () => {
  let service: OrdersService;
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
    orderItem: {
      create: jest.fn(),
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

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('processCheckout', () => {
    const mockUserId = 'user-123';
    const mockCheckoutDto = {
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

    it('should throw BadRequestException when cart is empty', async () => {
      mockPrismaService.cart.findFirst.mockResolvedValue(null);

      await expect(
        service.processCheckout(mockUserId, mockCheckoutDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when cart has no items', async () => {
      mockPrismaService.cart.findFirst.mockResolvedValue({ lineItems: [] });

      await expect(
        service.processCheckout(mockUserId, mockCheckoutDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when product is not active', async () => {
      const inactiveCart = {
        ...mockCart,
        lineItems: [
          {
            ...mockCart.lineItems[0],
            variant: {
              ...mockCart.lineItems[0].variant,
              product: {
                ...mockCart.lineItems[0].variant.product,
                isActive: false,
              },
            },
          },
        ],
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(inactiveCart);

      await expect(
        service.processCheckout(mockUserId, mockCheckoutDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException when insufficient stock', async () => {
      const lowStockCart = {
        ...mockCart,
        lineItems: [
          {
            ...mockCart.lineItems[0],
            quantity: 15, // More than available (10)
          },
        ],
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(lowStockCart);

      await expect(
        service.processCheckout(mockUserId, mockCheckoutDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should successfully process checkout with valid data', async () => {
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

      const result = await service.processCheckout(mockUserId, mockCheckoutDto);

      expect(result).toHaveProperty('id', 'order-123');
      expect(result).toHaveProperty('orderNumber', '202412250001');
      expect(result).toHaveProperty('paymentStatus', 'SUCCESS');
      expect(mockPrismaService.productVariant.update).toHaveBeenCalled();
      expect(mockPrismaService.inventoryMovement.create).toHaveBeenCalled();
      expect(mockPrismaService.cartLineItem.deleteMany).toHaveBeenCalled();
    });
  });

  describe('findUserOrder', () => {
    const mockUserId = 'user-123';
    const mockOrderId = 'order-123';

    it('should throw NotFoundException when order does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.findUserOrder(mockUserId, mockOrderId),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when order belongs to different user', async () => {
      const mockOrder = {
        id: mockOrderId,
        userId: 'different-user',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      await expect(
        service.findUserOrder(mockUserId, mockOrderId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should return order when user owns it', async () => {
      const mockOrder = {
        id: mockOrderId,
        userId: mockUserId,
        orderItems: [],
        transactions: [],
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);

      const result = await service.findUserOrder(mockUserId, mockOrderId);

      expect(result).toEqual(mockOrder);
    });
  });

  describe('findOrdersByUser', () => {
    const mockUserId = 'user-123';
    const mockPaginationOptions = { page: 1, limit: 10 };

    it('should return paginated user orders', async () => {
      const mockOrders = [
        { id: 'order-1', userId: mockUserId },
        { id: 'order-2', userId: mockUserId },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
      mockPrismaService.order.count.mockResolvedValue(2);

      const result = await service.findOrdersByUser(
        mockUserId,
        mockPaginationOptions,
      );

      expect(result).toHaveProperty('data', mockOrders);
      expect(result).toHaveProperty('totalCount', 2);
      expect(result).toHaveProperty('page', 1);
      expect(result).toHaveProperty('limit', 10);
      expect(mockPrismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: mockUserId },
        }),
      );
    });
  });
});
