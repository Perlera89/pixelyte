import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { PrismaService } from '../../common/services/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('WishlistService', () => {
  let service: WishlistService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      findUnique: jest.fn(),
    },
    productVariant: {
      findUnique: jest.fn(),
    },
    wishlist: {
      findFirst: jest.fn(),
      create: jest.fn(),
    },
    wishlistItem: {
      findFirst: jest.fn(),
      create: jest.fn(),
      findMany: jest.fn(),
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    const userId = 'user-1';
    const addToWishlistDto = {
      productId: 'product-1',
      variantId: 'variant-1',
    };

    const mockProduct = {
      id: 'product-1',
      name: 'Test Product',
      isActive: true,
    };

    const mockVariant = {
      id: 'variant-1',
      name: 'Test Variant',
      isActive: true,
    };

    const mockWishlist = {
      id: 'wishlist-1',
      userId,
      name: 'Mi Lista de Deseos',
      isDefault: true,
    };

    it('should add item to wishlist successfully', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productVariant.findUnique.mockResolvedValue(
        mockVariant,
      );
      mockPrismaService.wishlist.findFirst.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.findFirst.mockResolvedValue(null);
      mockPrismaService.wishlistItem.create.mockResolvedValue({
        id: 'item-1',
        wishlistId: 'wishlist-1',
        productId: 'product-1',
        variantId: 'variant-1',
        product: mockProduct,
        variant: mockVariant,
      });

      const result = await service.addItem(userId, addToWishlistDto);

      expect(result).toBeDefined();
      expect(mockPrismaService.wishlistItem.create).toHaveBeenCalledWith({
        data: {
          wishlistId: 'wishlist-1',
          productId: 'product-1',
          variantId: 'variant-1',
        },
        include: expect.any(Object),
      });
    });

    it('should throw NotFoundException when product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.addItem(userId, addToWishlistDto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException when product is not active', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        isActive: false,
      });

      await expect(service.addItem(userId, addToWishlistDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException when item already exists in wishlist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productVariant.findUnique.mockResolvedValue(
        mockVariant,
      );
      mockPrismaService.wishlist.findFirst.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.findFirst.mockResolvedValue({
        id: 'existing-item',
      });

      await expect(service.addItem(userId, addToWishlistDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should create wishlist if it does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.productVariant.findUnique.mockResolvedValue(
        mockVariant,
      );
      mockPrismaService.wishlist.findFirst.mockResolvedValue(null);
      mockPrismaService.wishlist.create.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.findFirst.mockResolvedValue(null);
      mockPrismaService.wishlistItem.create.mockResolvedValue({
        id: 'item-1',
        wishlistId: 'wishlist-1',
        productId: 'product-1',
        variantId: 'variant-1',
        product: mockProduct,
        variant: mockVariant,
      });

      await service.addItem(userId, addToWishlistDto);

      expect(mockPrismaService.wishlist.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: 'Mi Lista de Deseos',
          isDefault: true,
        },
      });
    });
  });

  describe('getWishlist', () => {
    const userId = 'user-1';

    it('should return wishlist with items', async () => {
      const mockWishlistWithItems = {
        id: 'wishlist-1',
        userId,
        name: 'Mi Lista de Deseos',
        isDefault: true,
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            variantId: 'variant-1',
            addedAt: new Date(),
            product: {
              id: 'product-1',
              name: 'Test Product',
              productImages: [{ url: 'image.jpg', altText: 'Test' }],
              brand: { id: 'brand-1', name: 'Test Brand' },
            },
            variant: {
              id: 'variant-1',
              name: 'Test Variant',
              productImage: { url: 'variant.jpg', altText: 'Variant' },
            },
          },
        ],
      };

      mockPrismaService.wishlist.findFirst.mockResolvedValue(
        mockWishlistWithItems,
      );

      const result = await service.getWishlist(userId);

      expect(result).toEqual(mockWishlistWithItems);
    });

    it('should return empty items array when wishlist does not exist', async () => {
      mockPrismaService.wishlist.findFirst.mockResolvedValue(null);

      const result = await service.getWishlist(userId);

      expect(result).toEqual({ items: [] });
    });
  });

  describe('removeItem', () => {
    const userId = 'user-1';
    const removeFromWishlistDto = {
      productId: 'product-1',
      variantId: 'variant-1',
    };

    const mockWishlist = {
      id: 'wishlist-1',
      userId,
      name: 'Mi Lista de Deseos',
      isDefault: true,
    };

    it('should remove item from wishlist successfully', async () => {
      mockPrismaService.wishlist.findFirst.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.deleteMany.mockResolvedValue({ count: 1 });

      const result = await service.removeItem(userId, removeFromWishlistDto);

      expect(result).toEqual({
        message: 'Producto eliminado de la wishlist exitosamente',
      });
      expect(mockPrismaService.wishlistItem.deleteMany).toHaveBeenCalledWith({
        where: {
          wishlistId: 'wishlist-1',
          productId: 'product-1',
          variantId: 'variant-1',
        },
      });
    });

    it('should throw NotFoundException when wishlist does not exist', async () => {
      mockPrismaService.wishlist.findFirst.mockResolvedValue(null);

      await expect(
        service.removeItem(userId, removeFromWishlistDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when item does not exist', async () => {
      mockPrismaService.wishlist.findFirst.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.deleteMany.mockResolvedValue({ count: 0 });

      await expect(
        service.removeItem(userId, removeFromWishlistDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('clearWishlist', () => {
    const userId = 'user-1';

    const mockWishlist = {
      id: 'wishlist-1',
      userId,
      name: 'Mi Lista de Deseos',
      isDefault: true,
    };

    it('should clear wishlist successfully', async () => {
      mockPrismaService.wishlist.findFirst.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.deleteMany.mockResolvedValue({ count: 3 });

      const result = await service.clearWishlist(userId);

      expect(result).toEqual({
        message: 'Wishlist limpiada exitosamente',
      });
      expect(mockPrismaService.wishlistItem.deleteMany).toHaveBeenCalledWith({
        where: { wishlistId: 'wishlist-1' },
      });
    });

    it('should throw NotFoundException when wishlist does not exist', async () => {
      mockPrismaService.wishlist.findFirst.mockResolvedValue(null);

      await expect(service.clearWishlist(userId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('syncWishlist', () => {
    const userId = 'user-1';
    const syncWishlistDto = {
      items: [
        { productId: 'product-1', variantId: 'variant-1' },
        { productId: 'product-2' },
      ],
    };

    const mockWishlist = {
      id: 'wishlist-1',
      userId,
      name: 'Mi Lista de Deseos',
      isDefault: true,
    };

    it('should sync wishlist successfully', async () => {
      mockPrismaService.wishlist.findFirst.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.findMany.mockResolvedValue([]);
      mockPrismaService.product.findUnique
        .mockResolvedValueOnce({ id: 'product-1', isActive: true })
        .mockResolvedValueOnce({ id: 'product-2', isActive: true });
      mockPrismaService.productVariant.findUnique.mockResolvedValue({
        id: 'variant-1',
        isActive: true,
      });
      mockPrismaService.wishlistItem.create
        .mockResolvedValueOnce({
          id: 'item-1',
          productId: 'product-1',
          variantId: 'variant-1',
          addedAt: new Date(),
          product: {
            id: 'product-1',
            name: 'Product 1',
            productImages: [],
            brand: null,
          },
          variant: { id: 'variant-1', name: 'Variant 1', productImage: null },
        })
        .mockResolvedValueOnce({
          id: 'item-2',
          productId: 'product-2',
          variantId: null,
          addedAt: new Date(),
          product: {
            id: 'product-2',
            name: 'Product 2',
            productImages: [],
            brand: null,
          },
          variant: null,
        });

      const result = await service.syncWishlist(userId, syncWishlistDto);

      expect(result).toHaveProperty('wishlistId', 'wishlist-1');
      expect(result).toHaveProperty('items');
      expect(result).toHaveProperty('totalItems', 2);
      expect(result).toHaveProperty(
        'message',
        'Wishlist sincronizada exitosamente',
      );
    });

    it('should create wishlist if it does not exist during sync', async () => {
      mockPrismaService.wishlist.findFirst.mockResolvedValue(null);
      mockPrismaService.wishlist.create.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.findMany.mockResolvedValue([]);
      mockPrismaService.product.findUnique
        .mockResolvedValueOnce({ id: 'product-1', isActive: true })
        .mockResolvedValueOnce({ id: 'product-2', isActive: true });
      mockPrismaService.productVariant.findUnique.mockResolvedValue({
        id: 'variant-1',
        isActive: true,
      });
      mockPrismaService.wishlistItem.create
        .mockResolvedValueOnce({
          id: 'item-1',
          productId: 'product-1',
          variantId: 'variant-1',
          addedAt: new Date(),
          product: {
            id: 'product-1',
            name: 'Product 1',
            productImages: [],
            brand: null,
          },
          variant: { id: 'variant-1', name: 'Variant 1', productImage: null },
        })
        .mockResolvedValueOnce({
          id: 'item-2',
          productId: 'product-2',
          variantId: null,
          addedAt: new Date(),
          product: {
            id: 'product-2',
            name: 'Product 2',
            productImages: [],
            brand: null,
          },
          variant: null,
        });

      await service.syncWishlist(userId, syncWishlistDto);

      expect(mockPrismaService.wishlist.create).toHaveBeenCalledWith({
        data: {
          userId,
          name: 'Mi Lista de Deseos',
          isDefault: true,
        },
      });
    });
  });
});
