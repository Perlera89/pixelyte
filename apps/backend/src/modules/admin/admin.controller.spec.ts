import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { OrderStatus, ProductStatus, Role } from '@prisma/client';

describe('AdminController', () => {
  let controller: AdminController;
  let adminService: AdminService;

  const mockAdminService = {
    getDashboardMetrics: jest.fn(),
    getSalesChartData: jest.fn(),
    getProducts: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
    getOrders: jest.fn(),
    getOrder: jest.fn(),
    updateOrderStatus: jest.fn(),
    getUsers: jest.fn(),
    getUser: jest.fn(),
    updateUserStatus: jest.fn(),
    getCategories: jest.fn(),
    createCategory: jest.fn(),
    updateCategory: jest.fn(),
    deleteCategory: jest.fn(),
    getBrands: jest.fn(),
    createBrand: jest.fn(),
    updateBrand: jest.fn(),
    deleteBrand: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: AdminService,
          useValue: mockAdminService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .overrideGuard(RolesGuard)
      .useValue({ canActivate: jest.fn(() => true) })
      .compile();

    controller = module.get<AdminController>(AdminController);
    adminService = module.get<AdminService>(AdminService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const mockMetrics = {
        totalSales: 10000,
        totalOrders: 100,
        totalProducts: 50,
        totalUsers: 200,
        monthlySales: 2500,
        monthlyOrders: 25,
        lowStockProducts: 5,
        pendingOrders: 10,
      };

      mockAdminService.getDashboardMetrics.mockResolvedValue(mockMetrics);

      const result = await controller.getDashboardMetrics();

      expect(result).toEqual(mockMetrics);
      expect(mockAdminService.getDashboardMetrics).toHaveBeenCalled();
    });
  });

  describe('getSalesChartData', () => {
    it('should return sales chart data with default days', async () => {
      const mockChartData = [
        { date: '2024-01-01', sales: 1000, orders: 5 },
        { date: '2024-01-02', sales: 1500, orders: 7 },
      ];

      mockAdminService.getSalesChartData.mockResolvedValue(mockChartData);

      const result = await controller.getSalesChartData();

      expect(result).toEqual(mockChartData);
      expect(mockAdminService.getSalesChartData).toHaveBeenCalledWith(30);
    });

    it('should return sales chart data with custom days', async () => {
      const mockChartData = [{ date: '2024-01-01', sales: 1000, orders: 5 }];

      mockAdminService.getSalesChartData.mockResolvedValue(mockChartData);

      const result = await controller.getSalesChartData('7');

      expect(result).toEqual(mockChartData);
      expect(mockAdminService.getSalesChartData).toHaveBeenCalledWith(7);
    });
  });

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const mockQuery = { page: 1, limit: 20, search: 'test' };
      const mockResponse = {
        products: [
          {
            id: '1',
            name: 'Test Product',
            sku: 'TEST-001',
            category: { name: 'Test Category', slug: 'test-category' },
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockAdminService.getProducts.mockResolvedValue(mockResponse);

      const result = await controller.getProducts(mockQuery);

      expect(result).toEqual(mockResponse);
      expect(mockAdminService.getProducts).toHaveBeenCalledWith(mockQuery);
    });
  });

  describe('createProduct', () => {
    it('should create a new product', async () => {
      const createProductDto = {
        sku: 'TEST-001',
        name: 'Test Product',
        slug: 'test-product',
        categoryId: 'category-id',
        basePrice: 100,
      };
      const mockCreatedProduct = { id: '1', ...createProductDto };

      mockAdminService.createProduct.mockResolvedValue(mockCreatedProduct);

      const result = await controller.createProduct(createProductDto);

      expect(result).toEqual(mockCreatedProduct);
      expect(mockAdminService.createProduct).toHaveBeenCalledWith(
        createProductDto,
      );
    });
  });

  describe('updateProduct', () => {
    it('should update an existing product', async () => {
      const updateProductDto = { name: 'Updated Product', basePrice: 150 };
      const mockUpdatedProduct = { id: '1', ...updateProductDto };

      mockAdminService.updateProduct.mockResolvedValue(mockUpdatedProduct);

      const result = await controller.updateProduct('1', updateProductDto);

      expect(result).toEqual(mockUpdatedProduct);
      expect(mockAdminService.updateProduct).toHaveBeenCalledWith(
        '1',
        updateProductDto,
      );
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      const mockDeletedProduct = { id: '1', name: 'Deleted Product' };

      mockAdminService.deleteProduct.mockResolvedValue(mockDeletedProduct);

      const result = await controller.deleteProduct('1');

      expect(result).toEqual(mockDeletedProduct);
      expect(mockAdminService.deleteProduct).toHaveBeenCalledWith('1');
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders', async () => {
      const mockQuery = { page: 1, limit: 20, status: OrderStatus.PENDING };
      const mockResponse = {
        orders: [
          {
            id: '1',
            orderNumber: 'ORD-001',
            email: 'test@example.com',
            status: OrderStatus.PENDING,
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockAdminService.getOrders.mockResolvedValue(mockResponse);

      const result = await controller.getOrders(mockQuery);

      expect(result).toEqual(mockResponse);
      expect(mockAdminService.getOrders).toHaveBeenCalledWith(mockQuery);
    });
  });

  describe('getOrder', () => {
    it('should return order details', async () => {
      const mockOrder = {
        id: '1',
        orderNumber: 'ORD-001',
        email: 'test@example.com',
        status: OrderStatus.PENDING,
        orderItems: [],
        transactions: [],
      };

      mockAdminService.getOrder.mockResolvedValue(mockOrder);

      const result = await controller.getOrder('1');

      expect(result).toEqual(mockOrder);
      expect(mockAdminService.getOrder).toHaveBeenCalledWith('1');
    });
  });

  describe('updateOrderStatus', () => {
    it('should update order status', async () => {
      const updateOrderStatusDto = {
        status: OrderStatus.PROCESSING,
        notes: 'Order is being processed',
      };
      const mockUpdatedOrder = {
        id: '1',
        status: OrderStatus.PROCESSING,
        notes: 'Order is being processed',
      };

      mockAdminService.updateOrderStatus.mockResolvedValue(mockUpdatedOrder);

      const result = await controller.updateOrderStatus(
        '1',
        updateOrderStatusDto,
      );

      expect(result).toEqual(mockUpdatedOrder);
      expect(mockAdminService.updateOrderStatus).toHaveBeenCalledWith(
        '1',
        updateOrderStatusDto,
      );
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const mockQuery = { page: 1, limit: 20, role: Role.USER };
      const mockResponse = {
        users: [
          {
            id: '1',
            email: 'test@example.com',
            names: 'John',
            surnames: 'Doe',
            role: Role.USER,
            isActive: true,
          },
        ],
        pagination: { page: 1, limit: 20, total: 1, totalPages: 1 },
      };

      mockAdminService.getUsers.mockResolvedValue(mockResponse);

      const result = await controller.getUsers(mockQuery);

      expect(result).toEqual(mockResponse);
      expect(mockAdminService.getUsers).toHaveBeenCalledWith(mockQuery);
    });
  });

  describe('getUser', () => {
    it('should return user details', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        names: 'John',
        surnames: 'Doe',
        role: Role.USER,
        isActive: true,
        profile: null,
        addresses: [],
        _count: { productReview: 0 },
      };

      mockAdminService.getUser.mockResolvedValue(mockUser);

      const result = await controller.getUser('1');

      expect(result).toEqual(mockUser);
      expect(mockAdminService.getUser).toHaveBeenCalledWith('1');
    });
  });

  describe('updateUserStatus', () => {
    it('should update user status', async () => {
      const updateUserStatusDto = {
        isActive: false,
        reason: 'Account suspended',
      };
      const mockUpdatedUser = {
        id: '1',
        email: 'test@example.com',
        isActive: false,
      };

      mockAdminService.updateUserStatus.mockResolvedValue(mockUpdatedUser);

      const result = await controller.updateUserStatus(
        '1',
        updateUserStatusDto,
      );

      expect(result).toEqual(mockUpdatedUser);
      expect(mockAdminService.updateUserStatus).toHaveBeenCalledWith(
        '1',
        updateUserStatusDto,
      );
    });
  });

  describe('getCategories', () => {
    it('should return all categories', async () => {
      const mockCategories = [
        {
          id: '1',
          name: 'Test Category',
          slug: 'test-category',
          parent: null,
          children: [],
          _count: { products: 5 },
        },
      ];

      mockAdminService.getCategories.mockResolvedValue(mockCategories);

      const result = await controller.getCategories();

      expect(result).toEqual(mockCategories);
      expect(mockAdminService.getCategories).toHaveBeenCalled();
    });
  });

  describe('createCategory', () => {
    it('should create a new category', async () => {
      const createCategoryDto = {
        name: 'Test Category',
        slug: 'test-category',
        description: 'Test description',
      };
      const mockCreatedCategory = { id: '1', ...createCategoryDto };

      mockAdminService.createCategory.mockResolvedValue(mockCreatedCategory);

      const result = await controller.createCategory(createCategoryDto);

      expect(result).toEqual(mockCreatedCategory);
      expect(mockAdminService.createCategory).toHaveBeenCalledWith(
        createCategoryDto,
      );
    });
  });

  describe('updateCategory', () => {
    it('should update an existing category', async () => {
      const updateCategoryDto = { name: 'Updated Category' };
      const mockUpdatedCategory = { id: '1', ...updateCategoryDto };

      mockAdminService.updateCategory.mockResolvedValue(mockUpdatedCategory);

      const result = await controller.updateCategory('1', updateCategoryDto);

      expect(result).toEqual(mockUpdatedCategory);
      expect(mockAdminService.updateCategory).toHaveBeenCalledWith(
        '1',
        updateCategoryDto,
      );
    });
  });

  describe('deleteCategory', () => {
    it('should delete a category', async () => {
      const mockDeletedCategory = { id: '1', name: 'Deleted Category' };

      mockAdminService.deleteCategory.mockResolvedValue(mockDeletedCategory);

      const result = await controller.deleteCategory('1');

      expect(result).toEqual(mockDeletedCategory);
      expect(mockAdminService.deleteCategory).toHaveBeenCalledWith('1');
    });
  });

  describe('getBrands', () => {
    it('should return all brands', async () => {
      const mockBrands = [
        {
          id: '1',
          name: 'Test Brand',
          slug: 'test-brand',
          _count: { products: 3 },
        },
      ];

      mockAdminService.getBrands.mockResolvedValue(mockBrands);

      const result = await controller.getBrands();

      expect(result).toEqual(mockBrands);
      expect(mockAdminService.getBrands).toHaveBeenCalled();
    });
  });

  describe('createBrand', () => {
    it('should create a new brand', async () => {
      const createBrandDto = {
        name: 'Test Brand',
        slug: 'test-brand',
        description: 'Test description',
      };
      const mockCreatedBrand = { id: '1', ...createBrandDto };

      mockAdminService.createBrand.mockResolvedValue(mockCreatedBrand);

      const result = await controller.createBrand(createBrandDto);

      expect(result).toEqual(mockCreatedBrand);
      expect(mockAdminService.createBrand).toHaveBeenCalledWith(createBrandDto);
    });
  });

  describe('updateBrand', () => {
    it('should update an existing brand', async () => {
      const updateBrandDto = { name: 'Updated Brand' };
      const mockUpdatedBrand = { id: '1', ...updateBrandDto };

      mockAdminService.updateBrand.mockResolvedValue(mockUpdatedBrand);

      const result = await controller.updateBrand('1', updateBrandDto);

      expect(result).toEqual(mockUpdatedBrand);
      expect(mockAdminService.updateBrand).toHaveBeenCalledWith(
        '1',
        updateBrandDto,
      );
    });
  });

  describe('deleteBrand', () => {
    it('should delete a brand', async () => {
      const mockDeletedBrand = { id: '1', name: 'Deleted Brand' };

      mockAdminService.deleteBrand.mockResolvedValue(mockDeletedBrand);

      const result = await controller.deleteBrand('1');

      expect(result).toEqual(mockDeletedBrand);
      expect(mockAdminService.deleteBrand).toHaveBeenCalledWith('1');
    });
  });
});
