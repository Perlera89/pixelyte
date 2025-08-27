import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { PrismaService } from '../../common/services/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { OrderStatus, ProductStatus, Role } from '@prisma/client';

describe('AdminService', () => {
  let service: AdminService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    order: {
      aggregate: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    product: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    productVariant: {
      count: jest.fn(),
    },
    user: {
      count: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    category: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    brand: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    wishlistItem: {
      deleteMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AdminService>(AdminService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const mockMetrics = {
        _sum: { totalPrice: 10000 },
      };

      mockPrismaService.order.aggregate.mockResolvedValueOnce(mockMetrics);
      mockPrismaService.order.aggregate.mockResolvedValueOnce(mockMetrics);
      mockPrismaService.order.count.mockResolvedValueOnce(100);
      mockPrismaService.product.count.mockResolvedValueOnce(50);
      mockPrismaService.user.count.mockResolvedValueOnce(200);
      mockPrismaService.order.count.mockResolvedValueOnce(25);
      mockPrismaService.productVariant.count.mockResolvedValueOnce(5);
      mockPrismaService.order.count.mockResolvedValueOnce(10);

      const result = await service.getDashboardMetrics();

      expect(result).toEqual({
        totalSales: 10000,
        totalOrders: 100,
        totalProducts: 50,
        totalUsers: 200,
        monthlySales: 10000,
        monthlyOrders: 25,
        lowStockProducts: 5,
        pendingOrders: 10,
      });
    });
  });

  describe('getSalesChartData', () => {
    it('should return sales chart data', async () => {
      const mockSalesData = [
        {
          createdAt: new Date('2024-01-01'),
          _sum: { totalPrice: 1000 },
          _count: { id: 5 },
        },
        {
          createdAt: new Date('2024-01-01'),
          _sum: { totalPrice: 500 },
          _count: { id: 2 },
        },
      ];

      mockPrismaService.order.groupBy.mockResolvedValue(mockSalesData);

      const result = await service.getSalesChartData(30);

      expect(result).toEqual([
        {
          date: '2024-01-01',
          sales: 1500,
          orders: 7,
        },
      ]);
    });
  });

  describe('getProducts', () => {
    it('should return paginated products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          sku: 'TEST-001',
          category: { name: 'Test Category', slug: 'test-category' },
          brand: { name: 'Test Brand', slug: 'test-brand' },
          productImages: [{ url: 'test.jpg', altText: 'Test' }],
          variants: [
            { id: '1', sku: 'TEST-001-V1', price: 100, inventoryQuantity: 10 },
          ],
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(1);

      const result = await service.getProducts({ page: 1, limit: 20 });

      expect(result).toEqual({
        products: mockProducts,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('createProduct', () => {
    const createProductDto = {
      sku: 'TEST-001',
      name: 'Test Product',
      slug: 'test-product',
      categoryId: 'category-id',
      basePrice: 100,
    };

    it('should create a product successfully', async () => {
      const mockCategory = { id: 'category-id', name: 'Test Category' };
      const mockCreatedProduct = { id: '1', ...createProductDto };

      mockPrismaService.product.findUnique.mockResolvedValueOnce(null); // SKU check
      mockPrismaService.product.findUnique.mockResolvedValueOnce(null); // Slug check
      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.create.mockResolvedValue(mockCreatedProduct);

      const result = await service.createProduct(createProductDto);

      expect(result).toEqual(mockCreatedProduct);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: createProductDto,
        include: {
          category: { select: { name: true, slug: true } },
          brand: { select: { name: true, slug: true } },
        },
      });
    });

    it('should throw BadRequestException if SKU already exists', async () => {
      const existingProduct = { id: '1', sku: 'TEST-001' };
      mockPrismaService.product.findUnique.mockResolvedValue(existingProduct);

      await expect(service.createProduct(createProductDto)).rejects.toThrow(
        new BadRequestException('El SKU ya existe'),
      );
    });

    it('should throw NotFoundException if category does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValueOnce(null); // SKU check
      mockPrismaService.product.findUnique.mockResolvedValueOnce(null); // Slug check
      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(service.createProduct(createProductDto)).rejects.toThrow(
        new NotFoundException('Categoría no encontrada'),
      );
    });
  });

  describe('updateProduct', () => {
    const updateProductDto = {
      name: 'Updated Product',
      basePrice: 150,
    };

    it('should update a product successfully', async () => {
      const mockProduct = { id: '1', name: 'Test Product' };
      const mockUpdatedProduct = { ...mockProduct, ...updateProductDto };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.update.mockResolvedValue(mockUpdatedProduct);

      const result = await service.updateProduct('1', updateProductDto);

      expect(result).toEqual(mockUpdatedProduct);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(
        service.updateProduct('1', updateProductDto),
      ).rejects.toThrow(new NotFoundException('Producto no encontrado'));
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product successfully', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        orderItems: [],
        wishlistItems: [],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.deleteProduct('1');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if product does not exist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.deleteProduct('1')).rejects.toThrow(
        new NotFoundException('Producto no encontrado'),
      );
    });

    it('should throw BadRequestException if product has orders', async () => {
      const mockProduct = {
        id: '1',
        name: 'Test Product',
        orderItems: [{ id: '1' }],
        wishlistItems: [],
      };

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      await expect(service.deleteProduct('1')).rejects.toThrow(
        new BadRequestException(
          'No se puede eliminar el producto porque tiene órdenes asociadas. Considere desactivarlo en su lugar.',
        ),
      );
    });
  });

  describe('getOrders', () => {
    it('should return paginated orders', async () => {
      const mockOrders = [
        {
          id: '1',
          orderNumber: 'ORD-001',
          email: 'test@example.com',
          status: OrderStatus.PENDING,
          orderItems: [],
        },
      ];

      mockPrismaService.order.findMany.mockResolvedValue(mockOrders);
      mockPrismaService.order.count.mockResolvedValue(1);

      const result = await service.getOrders({ page: 1, limit: 20 });

      expect(result).toEqual({
        orders: mockOrders,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('updateOrderStatus', () => {
    const updateOrderStatusDto = {
      status: OrderStatus.PROCESSING,
      notes: 'Order is being processed',
    };

    it('should update order status successfully', async () => {
      const mockOrder = {
        id: '1',
        status: OrderStatus.PENDING,
        processedAt: null,
      };
      const mockUpdatedOrder = {
        ...mockOrder,
        status: OrderStatus.PROCESSING,
        processedAt: new Date(),
        notes: 'Order is being processed',
      };

      mockPrismaService.order.findUnique.mockResolvedValue(mockOrder);
      mockPrismaService.order.update.mockResolvedValue(mockUpdatedOrder);

      const result = await service.updateOrderStatus('1', updateOrderStatusDto);

      expect(result).toEqual(mockUpdatedOrder);
      expect(mockPrismaService.order.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: {
          status: OrderStatus.PROCESSING,
          notes: 'Order is being processed',
          processedAt: expect.any(Date),
        },
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      mockPrismaService.order.findUnique.mockResolvedValue(null);

      await expect(
        service.updateOrderStatus('1', updateOrderStatusDto),
      ).rejects.toThrow(new NotFoundException('Orden no encontrada'));
    });
  });

  describe('getUsers', () => {
    it('should return paginated users', async () => {
      const mockUsers = [
        {
          id: '1',
          email: 'test@example.com',
          names: 'John',
          surnames: 'Doe',
          role: Role.USER,
          isActive: true,
          emailVerified: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          profile: null,
          _count: { productReview: 0 },
        },
      ];

      mockPrismaService.user.findMany.mockResolvedValue(mockUsers);
      mockPrismaService.user.count.mockResolvedValue(1);

      const result = await service.getUsers({ page: 1, limit: 20 });

      expect(result).toEqual({
        users: mockUsers,
        pagination: {
          page: 1,
          limit: 20,
          total: 1,
          totalPages: 1,
        },
      });
    });
  });

  describe('updateUserStatus', () => {
    const updateUserStatusDto = {
      isActive: false,
      reason: 'Account suspended',
    };

    it('should update user status successfully', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        isActive: true,
      };
      const mockUpdatedUser = {
        ...mockUser,
        isActive: false,
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);
      mockPrismaService.user.update.mockResolvedValue(mockUpdatedUser);

      const result = await service.updateUserStatus('1', updateUserStatusDto);

      expect(result).toEqual(mockUpdatedUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.updateUserStatus('1', updateUserStatusDto),
      ).rejects.toThrow(new NotFoundException('Usuario no encontrado'));
    });
  });

  describe('createCategory', () => {
    const createCategoryDto = {
      name: 'Test Category',
      slug: 'test-category',
      description: 'Test description',
    };

    it('should create a category successfully', async () => {
      const mockCreatedCategory = { id: '1', ...createCategoryDto };

      mockPrismaService.category.findUnique.mockResolvedValue(null); // Slug check
      mockPrismaService.category.create.mockResolvedValue(mockCreatedCategory);

      const result = await service.createCategory(createCategoryDto);

      expect(result).toEqual(mockCreatedCategory);
    });

    it('should throw BadRequestException if slug already exists', async () => {
      const existingCategory = { id: '1', slug: 'test-category' };
      mockPrismaService.category.findUnique.mockResolvedValue(existingCategory);

      await expect(service.createCategory(createCategoryDto)).rejects.toThrow(
        new BadRequestException('El slug ya existe'),
      );
    });
  });

  describe('createBrand', () => {
    const createBrandDto = {
      name: 'Test Brand',
      slug: 'test-brand',
      description: 'Test description',
    };

    it('should create a brand successfully', async () => {
      const mockCreatedBrand = { id: '1', ...createBrandDto };

      mockPrismaService.brand.findUnique.mockResolvedValueOnce(null); // Name check
      mockPrismaService.brand.findUnique.mockResolvedValueOnce(null); // Slug check
      mockPrismaService.brand.create.mockResolvedValue(mockCreatedBrand);

      const result = await service.createBrand(createBrandDto);

      expect(result).toEqual(mockCreatedBrand);
    });

    it('should throw BadRequestException if name already exists', async () => {
      const existingBrand = { id: '1', name: 'Test Brand' };
      mockPrismaService.brand.findUnique.mockResolvedValue(existingBrand);

      await expect(service.createBrand(createBrandDto)).rejects.toThrow(
        new BadRequestException('El nombre de la marca ya existe'),
      );
    });
  });
});
