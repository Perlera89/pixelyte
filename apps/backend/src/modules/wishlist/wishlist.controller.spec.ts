import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('WishlistController', () => {
  let controller: WishlistController;
  let service: WishlistService;

  const mockWishlistService = {
    addItem: jest.fn(),
    getWishlist: jest.fn(),
    removeItem: jest.fn(),
    clearWishlist: jest.fn(),
    syncWishlist: jest.fn(),
  };

  const mockUser = { id: 'user-1', email: 'test@example.com' };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [
        {
          provide: WishlistService,
          useValue: mockWishlistService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<WishlistController>(WishlistController);
    service = module.get<WishlistService>(WishlistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addItem', () => {
    it('should add item to wishlist', async () => {
      const addToWishlistDto = {
        productId: 'product-1',
        variantId: 'variant-1',
      };

      const expectedResult = {
        id: 'item-1',
        productId: 'product-1',
        variantId: 'variant-1',
      };

      mockWishlistService.addItem.mockResolvedValue(expectedResult);

      const result = await controller.addItem(addToWishlistDto, mockUser);

      expect(result).toEqual(expectedResult);
      expect(service.addItem).toHaveBeenCalledWith('user-1', addToWishlistDto);
    });
  });

  describe('getWishlist', () => {
    it('should return user wishlist', async () => {
      const expectedResult = {
        id: 'wishlist-1',
        items: [
          {
            id: 'item-1',
            productId: 'product-1',
            product: { name: 'Test Product' },
          },
        ],
      };

      mockWishlistService.getWishlist.mockResolvedValue(expectedResult);

      const result = await controller.getWishlist(mockUser);

      expect(result).toEqual(expectedResult);
      expect(service.getWishlist).toHaveBeenCalledWith('user-1');
    });
  });

  describe('removeItem', () => {
    it('should remove item from wishlist by productId', async () => {
      const productId = 'product-1';
      const expectedResult = {
        message: 'Producto eliminado de la wishlist exitosamente',
      };

      mockWishlistService.removeItem.mockResolvedValue(expectedResult);

      const result = await controller.removeItem(productId, mockUser);

      expect(result).toEqual(expectedResult);
      expect(service.removeItem).toHaveBeenCalledWith('user-1', { productId });
    });
  });

  describe('removeSpecificItem', () => {
    it('should remove specific item from wishlist', async () => {
      const removeFromWishlistDto = {
        productId: 'product-1',
        variantId: 'variant-1',
      };

      const expectedResult = {
        message: 'Producto eliminado de la wishlist exitosamente',
      };

      mockWishlistService.removeItem.mockResolvedValue(expectedResult);

      const result = await controller.removeSpecificItem(
        removeFromWishlistDto,
        mockUser,
      );

      expect(result).toEqual(expectedResult);
      expect(service.removeItem).toHaveBeenCalledWith(
        'user-1',
        removeFromWishlistDto,
      );
    });
  });

  describe('clearWishlist', () => {
    it('should clear user wishlist', async () => {
      const expectedResult = {
        message: 'Wishlist limpiada exitosamente',
      };

      mockWishlistService.clearWishlist.mockResolvedValue(expectedResult);

      const result = await controller.clearWishlist(mockUser);

      expect(result).toEqual(expectedResult);
      expect(service.clearWishlist).toHaveBeenCalledWith('user-1');
    });
  });

  describe('syncWishlist', () => {
    it('should sync wishlist with local data', async () => {
      const syncWishlistDto = {
        items: [
          { productId: 'product-1', variantId: 'variant-1' },
          { productId: 'product-2' },
        ],
      };

      const expectedResult = {
        wishlistId: 'wishlist-1',
        items: [
          { id: 'item-1', productId: 'product-1' },
          { id: 'item-2', productId: 'product-2' },
        ],
        totalItems: 2,
        message: 'Wishlist sincronizada exitosamente',
      };

      mockWishlistService.syncWishlist.mockResolvedValue(expectedResult);

      const result = await controller.syncWishlist(mockUser, syncWishlistDto);

      expect(result).toEqual(expectedResult);
      expect(service.syncWishlist).toHaveBeenCalledWith(
        'user-1',
        syncWishlistDto,
      );
    });
  });
});
