import { Test, TestingModule } from '@nestjs/testing';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto, SyncCartDto } from './dto/cart.dto';

describe('CartController', () => {
  let controller: CartController;
  let cartService: CartService;

  const mockCartService = {
    getUserCart: jest.fn(),
    addItemToUserCart: jest.fn(),
    updateUserCartItem: jest.fn(),
    removeUserCartItem: jest.fn(),
    clearUserCart: jest.fn(),
    syncUserCart: jest.fn(),
    // Legacy methods
    createCart: jest.fn(),
    findCart: jest.fn(),
    getCartSummary: jest.fn(),
    addItemToCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeCartItem: jest.fn(),
    clearCart: jest.fn(),
    cleanExpiredCarts: jest.fn(),
  };

  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CartController>(CartController);
    cartService = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserCart', () => {
    it('should return user cart', async () => {
      const mockCart = {
        id: 'cart-123',
        items: [],
        totalItems: 0,
        subtotal: 0,
        currency: 'USD',
      };

      mockCartService.getUserCart.mockResolvedValue(mockCart);

      const result = await controller.getUserCart(mockUser);

      expect(cartService.getUserCart).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockCart);
    });
  });

  describe('addItemToUserCart', () => {
    it('should add item to user cart', async () => {
      const addToCartDto: AddToCartDto = {
        variantId: 'variant-123',
        quantity: 2,
      };

      const mockCartItem = {
        id: 'item-123',
        variantId: 'variant-123',
        quantity: 2,
        price: 99.99,
        total: 199.98,
      };

      mockCartService.addItemToUserCart.mockResolvedValue(mockCartItem);

      const result = await controller.addItemToUserCart(mockUser, addToCartDto);

      expect(cartService.addItemToUserCart).toHaveBeenCalledWith(
        'user-123',
        addToCartDto,
      );
      expect(result).toEqual(mockCartItem);
    });
  });

  describe('updateUserCartItem', () => {
    it('should update cart item', async () => {
      const itemId = 'item-123';
      const updateCartItemDto: UpdateCartItemDto = {
        quantity: 3,
      };

      const mockUpdatedItem = {
        id: 'item-123',
        quantity: 3,
        price: 99.99,
        total: 299.97,
      };

      mockCartService.updateUserCartItem.mockResolvedValue(mockUpdatedItem);

      const result = await controller.updateUserCartItem(
        mockUser,
        itemId,
        updateCartItemDto,
      );

      expect(cartService.updateUserCartItem).toHaveBeenCalledWith(
        'user-123',
        itemId,
        updateCartItemDto,
      );
      expect(result).toEqual(mockUpdatedItem);
    });
  });

  describe('removeUserCartItem', () => {
    it('should remove cart item', async () => {
      const itemId = 'item-123';
      const mockResponse = { message: 'Item eliminado exitosamente' };

      mockCartService.removeUserCartItem.mockResolvedValue(mockResponse);

      const result = await controller.removeUserCartItem(mockUser, itemId);

      expect(cartService.removeUserCartItem).toHaveBeenCalledWith(
        'user-123',
        itemId,
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('clearUserCart', () => {
    it('should clear user cart', async () => {
      const mockResponse = { message: 'Carrito vaciado exitosamente' };

      mockCartService.clearUserCart.mockResolvedValue(mockResponse);

      const result = await controller.clearUserCart(mockUser);

      expect(cartService.clearUserCart).toHaveBeenCalledWith('user-123');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('syncCart', () => {
    it('should sync cart with local data', async () => {
      const syncCartDto: SyncCartDto = {
        items: [
          { variantId: 'variant-1', quantity: 2 },
          { variantId: 'variant-2', quantity: 1 },
        ],
      };

      const mockSyncResponse = {
        cartId: 'cart-123',
        items: [
          { variantId: 'variant-1', quantity: 2 },
          { variantId: 'variant-2', quantity: 1 },
        ],
        totalItems: 3,
        subtotal: 150.0,
        currency: 'USD',
        message: 'Carrito sincronizado exitosamente',
      };

      mockCartService.syncUserCart.mockResolvedValue(mockSyncResponse);

      const result = await controller.syncCart(mockUser, syncCartDto);

      expect(cartService.syncUserCart).toHaveBeenCalledWith(
        'user-123',
        syncCartDto,
      );
      expect(result).toEqual(mockSyncResponse);
    });
  });

  // Test legacy endpoints still work
  describe('Legacy endpoints', () => {
    it('should create cart (legacy)', async () => {
      const createCartDto = { userId: 'user-123' };
      const mockCart = { id: 'cart-123', userId: 'user-123' };

      mockCartService.createCart.mockResolvedValue(mockCart);

      const result = await controller.createCart(createCartDto);

      expect(cartService.createCart).toHaveBeenCalledWith(createCartDto);
      expect(result).toEqual(mockCart);
    });

    it('should find cart (legacy)', async () => {
      const userId = 'user-123';
      const mockCart = { id: 'cart-123', userId };

      mockCartService.findCart.mockResolvedValue(mockCart);

      const result = await controller.findCart(userId);

      expect(cartService.findCart).toHaveBeenCalledWith(userId, undefined);
      expect(result).toEqual(mockCart);
    });
  });
});
