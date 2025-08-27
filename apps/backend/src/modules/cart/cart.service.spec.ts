import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { PrismaService } from '../../common/services/prisma.service';
import { AddToCartDto, SyncCartDto } from './dto/cart.dto';

describe('CartService', () => {
  let service: CartService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    cart: {
      findFirst: jest.fn(),
      create: jest.fn(),
      deleteMany: jest.fn(),
    },
    cartLineItem: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      deleteMany: jest.fn(),
      upsert: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCart', () => {
    it('should return existing cart for user', async () => {
      const userId = 'user-123';
      const mockCart = {
        id: 'cart-123',
        userId,
        currency: 'USD',
        lineItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);

      const result = await service.getUserCart(userId);

      expect(mockPrismaService.cart.findFirst).toHaveBeenCalledWith({
        where: { userId },
        include: {
          lineItems: {
            include: {
              variant: {
                include: {
                  product: {
                    include: {
                      productImages: {
                        where: { isPrimary: true },
                        take: 1,
                      },
                      brand: true,
                    },
                  },
                  productImage: true,
                },
              },
            },
          },
        },
      });

      expect(result).toEqual({
        id: 'cart-123',
        items: [],
        totalItems: 0,
        subtotal: 0,
        currency: 'USD',
        createdAt: mockCart.createdAt,
        updatedAt: mockCart.updatedAt,
      });
    });

    it('should create new cart if none exists', async () => {
      const userId = 'user-123';
      const mockNewCart = {
        id: 'cart-new',
        userId,
        currency: 'USD',
        lineItems: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        expiresAt: new Date(),
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(null);
      mockPrismaService.cart.create.mockResolvedValue(mockNewCart);

      const result = await service.getUserCart(userId);

      expect(mockPrismaService.cart.create).toHaveBeenCalled();
      expect(result.id).toBe('cart-new');
    });
  });

  describe('addItemToUserCart', () => {
    const userId = 'user-123';
    const addToCartDto: AddToCartDto = {
      variantId: 'variant-123',
      quantity: 2,
    };

    it('should add new item to cart successfully', async () => {
      const mockCart = { id: 'cart-123', userId };
      const mockVariant = {
        id: 'variant-123',
        isActive: true,
        inventoryPolicy: 'DENY',
        inventoryQuantity: 10,
        price: { toNumber: () => 99.99 },
        product: { id: 'product-123', isActive: true },
      };
      const mockNewItem = {
        id: 'item-123',
        cartId: 'cart-123',
        variantId: 'variant-123',
        quantity: 2,
        variant: {
          ...mockVariant,
          product: {
            ...mockVariant.product,
            name: 'Test Product',
            slug: 'test-product',
            productImages: [{ url: 'image.jpg' }],
            brand: { name: 'Test Brand' },
          },
        },
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.productVariant.findUnique.mockResolvedValue(
        mockVariant,
      );
      mockPrismaService.cartLineItem.findUnique.mockResolvedValue(null);
      mockPrismaService.cartLineItem.create.mockResolvedValue(mockNewItem);

      const result = await service.addItemToUserCart(userId, addToCartDto);

      expect(mockPrismaService.cartLineItem.create).toHaveBeenCalledWith({
        data: {
          cartId: 'cart-123',
          ...addToCartDto,
        },
        include: expect.any(Object),
      });

      expect(result).toEqual({
        id: 'item-123',
        variantId: 'variant-123',
        quantity: 2,
        price: 99.99,
        total: 199.98,
        properties: undefined,
        product: {
          id: 'product-123',
          name: 'Test Product',
          slug: 'test-product',
          image: 'image.jpg',
          brand: 'Test Brand',
        },
        variant: {
          id: 'variant-123',
          title: undefined,
          sku: undefined,
          inventoryQuantity: 10,
          inventoryPolicy: 'DENY',
        },
      });
    });

    it('should throw error when variant not found', async () => {
      const mockCart = { id: 'cart-123', userId };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.productVariant.findUnique.mockResolvedValue(null);

      await expect(
        service.addItemToUserCart(userId, addToCartDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when insufficient stock', async () => {
      const mockCart = { id: 'cart-123', userId };
      const mockVariant = {
        id: 'variant-123',
        isActive: true,
        inventoryPolicy: 'DENY',
        inventoryQuantity: 1, // Less than requested quantity
        product: { isActive: true },
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.productVariant.findUnique.mockResolvedValue(
        mockVariant,
      );

      await expect(
        service.addItemToUserCart(userId, addToCartDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update existing item quantity', async () => {
      const mockCart = { id: 'cart-123', userId };
      const mockVariant = {
        id: 'variant-123',
        isActive: true,
        inventoryPolicy: 'DENY',
        inventoryQuantity: 10,
        price: { toNumber: () => 99.99 },
        product: { isActive: true },
      };
      const existingItem = {
        id: 'item-123',
        quantity: 1,
      };
      const updatedItem = {
        id: 'item-123',
        quantity: 3, // 1 + 2
        variant: {
          ...mockVariant,
          product: {
            ...mockVariant.product,
            name: 'Test Product',
            slug: 'test-product',
            productImages: [{ url: 'image.jpg' }],
            brand: { name: 'Test Brand' },
          },
        },
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.productVariant.findUnique.mockResolvedValue(
        mockVariant,
      );
      mockPrismaService.cartLineItem.findUnique.mockResolvedValue(existingItem);
      mockPrismaService.cartLineItem.update.mockResolvedValue(updatedItem);

      const result = await service.addItemToUserCart(userId, addToCartDto);

      expect(mockPrismaService.cartLineItem.update).toHaveBeenCalledWith({
        where: { id: 'item-123' },
        data: {
          quantity: 3,
          properties: undefined,
        },
        include: expect.any(Object),
      });

      expect(result.quantity).toBe(3);
    });
  });

  describe('syncUserCart', () => {
    const userId = 'user-123';
    const syncCartDto: SyncCartDto = {
      items: [
        { variantId: 'variant-1', quantity: 2 },
        { variantId: 'variant-2', quantity: 1 },
      ],
    };

    it('should sync cart successfully', async () => {
      const mockCart = { id: 'cart-123', userId, currency: 'USD' };
      const mockVariant1 = {
        id: 'variant-1',
        isActive: true,
        inventoryPolicy: 'DENY',
        inventoryQuantity: 10,
        price: { toNumber: () => 50.0 },
        product: { isActive: true },
      };
      const mockVariant2 = {
        id: 'variant-2',
        isActive: true,
        inventoryPolicy: 'DENY',
        inventoryQuantity: 5,
        price: { toNumber: () => 25.0 },
        product: { isActive: true },
      };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.cartLineItem.findMany.mockResolvedValue([]);
      mockPrismaService.productVariant.findUnique
        .mockResolvedValueOnce(mockVariant1)
        .mockResolvedValueOnce(mockVariant2);

      const mockUpsertedItem1 = {
        id: 'item-1',
        variantId: 'variant-1',
        quantity: 2,
        variant: {
          ...mockVariant1,
          product: {
            ...mockVariant1.product,
            name: 'Product 1',
            slug: 'product-1',
            productImages: [{ url: 'image1.jpg' }],
            brand: { name: 'Brand 1' },
          },
        },
      };
      const mockUpsertedItem2 = {
        id: 'item-2',
        variantId: 'variant-2',
        quantity: 1,
        variant: {
          ...mockVariant2,
          product: {
            ...mockVariant2.product,
            name: 'Product 2',
            slug: 'product-2',
            productImages: [{ url: 'image2.jpg' }],
            brand: { name: 'Brand 2' },
          },
        },
      };

      mockPrismaService.cartLineItem.upsert
        .mockResolvedValueOnce(mockUpsertedItem1)
        .mockResolvedValueOnce(mockUpsertedItem2);

      const result = await service.syncUserCart(userId, syncCartDto);

      expect(result).toEqual({
        cartId: 'cart-123',
        items: expect.arrayContaining([
          expect.objectContaining({ variantId: 'variant-1', quantity: 2 }),
          expect.objectContaining({ variantId: 'variant-2', quantity: 1 }),
        ]),
        totalItems: 3,
        subtotal: 125.0, // (50 * 2) + (25 * 1)
        currency: 'USD',
        message: 'Carrito sincronizado exitosamente',
      });
    });
  });

  describe('removeUserCartItem', () => {
    const userId = 'user-123';
    const itemId = 'item-123';

    it('should remove item successfully', async () => {
      const mockItem = {
        id: itemId,
        cart: { userId },
      };

      mockPrismaService.cartLineItem.findUnique.mockResolvedValue(mockItem);
      mockPrismaService.cartLineItem.delete.mockResolvedValue(mockItem);

      const result = await service.removeUserCartItem(userId, itemId);

      expect(mockPrismaService.cartLineItem.delete).toHaveBeenCalledWith({
        where: { id: itemId },
      });

      expect(result).toEqual({ message: 'Item eliminado exitosamente' });
    });

    it('should throw error when item not found', async () => {
      mockPrismaService.cartLineItem.findUnique.mockResolvedValue(null);

      await expect(service.removeUserCartItem(userId, itemId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error when user does not own item', async () => {
      const mockItem = {
        id: itemId,
        cart: { userId: 'other-user' },
      };

      mockPrismaService.cartLineItem.findUnique.mockResolvedValue(mockItem);

      await expect(service.removeUserCartItem(userId, itemId)).rejects.toThrow(
        ForbiddenException,
      );
    });
  });

  describe('clearUserCart', () => {
    const userId = 'user-123';

    it('should clear cart successfully', async () => {
      const mockCart = { id: 'cart-123', userId };

      mockPrismaService.cart.findFirst.mockResolvedValue(mockCart);
      mockPrismaService.cartLineItem.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.clearUserCart(userId);

      expect(mockPrismaService.cartLineItem.deleteMany).toHaveBeenCalledWith({
        where: { cartId: 'cart-123' },
      });

      expect(result).toEqual({ message: 'Carrito vaciado exitosamente' });
    });
  });
});
