import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

describe('OrdersController', () => {
  let controller: OrdersController;
  let ordersService: OrdersService;

  const mockOrdersService = {
    processCheckout: jest.fn(),
    findOrdersByUser: jest.fn(),
    findUserOrder: jest.fn(),
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    cancelOrder: jest.fn(),
    findOrdersByStatus: jest.fn(),
    getOrderStats: jest.fn(),
    createTransaction: jest.fn(),
    findTransactionsByOrder: jest.fn(),
    updateTransaction: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OrdersController],
      providers: [
        {
          provide: OrdersService,
          useValue: mockOrdersService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .compile();

    controller = module.get<OrdersController>(OrdersController);
    ordersService = module.get<OrdersService>(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('checkout', () => {
    const mockUser = { id: 'user-123', email: 'test@example.com' };
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

    it('should successfully process checkout', async () => {
      const mockOrderSummary = {
        id: 'order-123',
        orderNumber: '202412250001',
        status: 'CONFIRMED',
        totalPrice: 200,
        createdAt: '2024-12-25T10:30:00Z',
        paymentStatus: 'SUCCESS',
        items: [],
      };

      mockOrdersService.processCheckout.mockResolvedValue(mockOrderSummary);

      const result = await controller.checkout(mockUser, mockCheckoutDto);

      expect(result).toEqual(mockOrderSummary);
      expect(mockOrdersService.processCheckout).toHaveBeenCalledWith(
        mockUser.id,
        mockCheckoutDto,
      );
    });

    it('should handle checkout errors', async () => {
      mockOrdersService.processCheckout.mockRejectedValue(
        new BadRequestException('El carrito está vacío'),
      );

      await expect(
        controller.checkout(mockUser, mockCheckoutDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getMyOrders', () => {
    const mockUser = { id: 'user-123' };
    const mockPaginationOptions = { page: 1, limit: 10 };

    it('should return user orders', async () => {
      const mockOrdersResponse = {
        data: [
          { id: 'order-1', orderNumber: '202412250001' },
          { id: 'order-2', orderNumber: '202412250002' },
        ],
        totalCount: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockOrdersService.findOrdersByUser.mockResolvedValue(mockOrdersResponse);

      const result = await controller.getMyOrders(
        mockUser,
        mockPaginationOptions,
      );

      expect(result).toEqual(mockOrdersResponse);
      expect(mockOrdersService.findOrdersByUser).toHaveBeenCalledWith(
        mockUser.id,
        mockPaginationOptions,
      );
    });
  });

  describe('getMyOrder', () => {
    const mockUser = { id: 'user-123' };
    const mockOrderId = 'order-123';

    it('should return specific user order', async () => {
      const mockOrder = {
        id: mockOrderId,
        orderNumber: '202412250001',
        userId: mockUser.id,
        orderItems: [],
        transactions: [],
      };

      mockOrdersService.findUserOrder.mockResolvedValue(mockOrder);

      const result = await controller.getMyOrder(mockUser, mockOrderId);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.findUserOrder).toHaveBeenCalledWith(
        mockUser.id,
        mockOrderId,
      );
    });

    it('should handle order not found', async () => {
      mockOrdersService.findUserOrder.mockRejectedValue(
        new NotFoundException('Orden no encontrada'),
      );

      await expect(
        controller.getMyOrder(mockUser, mockOrderId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('create (admin)', () => {
    const mockCreateOrderDto = {
      email: 'test@example.com',
      billingAddress: {},
      shippingAddress: {},
      items: [],
    };

    it('should create order', async () => {
      const mockOrder = {
        id: 'order-123',
        orderNumber: '202412250001',
      };

      mockOrdersService.create.mockResolvedValue(mockOrder);

      const result = await controller.create(mockCreateOrderDto);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.create).toHaveBeenCalledWith(mockCreateOrderDto);
    });
  });

  describe('findAll', () => {
    const mockPaginationOptions = { page: 1, limit: 10 };

    it('should return all orders', async () => {
      const mockOrdersResponse = {
        data: [{ id: 'order-1' }, { id: 'order-2' }],
        pagination: {
          page: 1,
          limit: 10,
          total: 2,
          totalPages: 1,
        },
      };

      mockOrdersService.findAll.mockResolvedValue(mockOrdersResponse);

      const result = await controller.findAll(mockPaginationOptions);

      expect(result).toEqual(mockOrdersResponse);
      expect(mockOrdersService.findAll).toHaveBeenCalledWith(
        mockPaginationOptions,
      );
    });
  });

  describe('findOne', () => {
    const mockOrderId = 'order-123';

    it('should return specific order', async () => {
      const mockOrder = {
        id: mockOrderId,
        orderNumber: '202412250001',
      };

      mockOrdersService.findOne.mockResolvedValue(mockOrder);

      const result = await controller.findOne(mockOrderId);

      expect(result).toEqual(mockOrder);
      expect(mockOrdersService.findOne).toHaveBeenCalledWith(mockOrderId);
    });
  });

  describe('update', () => {
    const mockOrderId = 'order-123';
    const mockUpdateOrderDto = {
      status: 'SHIPPED',
    };

    it('should update order', async () => {
      const mockUpdatedOrder = {
        id: mockOrderId,
        status: 'SHIPPED',
      };

      mockOrdersService.update.mockResolvedValue(mockUpdatedOrder);

      const result = await controller.update(mockOrderId, mockUpdateOrderDto);

      expect(result).toEqual(mockUpdatedOrder);
      expect(mockOrdersService.update).toHaveBeenCalledWith(
        mockOrderId,
        mockUpdateOrderDto,
      );
    });
  });

  describe('cancelOrder', () => {
    const mockOrderId = 'order-123';

    it('should cancel order', async () => {
      const mockCancelledOrder = {
        id: mockOrderId,
        status: 'CANCELLED',
      };

      mockOrdersService.cancelOrder.mockResolvedValue(mockCancelledOrder);

      const result = await controller.cancelOrder(mockOrderId);

      expect(result).toEqual(mockCancelledOrder);
      expect(mockOrdersService.cancelOrder).toHaveBeenCalledWith(mockOrderId);
    });
  });
});
