import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { PrismaService } from '../../common/services/prisma.service';
import { SupabaseService } from '../../common/services/supabase.service';

describe('ProductsController', () => {
  let controller: ProductsController;
  let service: ProductsService;

  const mockProductsService = {
    getFeaturedProducts: jest.fn(),
    searchProductsWithFilters: jest.fn(),
    searchProducts: jest.fn(),
    getProductsByCategory: jest.fn(),
    getRelatedProducts: jest.fn(),
    findOneProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsService,
          useValue: mockProductsService,
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: SupabaseService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
    service = module.get<ProductsService>(ProductsService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getFeaturedProducts', () => {
    it('should return featured products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Test Product',
          slug: 'test-product',
          basePrice: 100,
          isFeatured: true,
        },
      ];

      mockProductsService.getFeaturedProducts.mockResolvedValue(mockProducts);

      const result = await controller.getFeaturedProducts(12);

      expect(service.getFeaturedProducts).toHaveBeenCalledWith(12);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('searchProductsWithFilters', () => {
    it('should search products with filters', async () => {
      const mockFilters = {
        search: 'laptop',
        category: 'electronics',
        minPrice: 100,
        maxPrice: 1000,
      };

      const mockResult = {
        data: [],
        totalCount: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockProductsService.searchProductsWithFilters.mockResolvedValue(
        mockResult,
      );

      const result = await controller.searchProductsWithFilters(mockFilters);

      expect(service.searchProductsWithFilters).toHaveBeenCalledWith(
        mockFilters,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products by category', async () => {
      const categorySlug = 'laptops';
      const paginationOptions = { page: 1, limit: 12 };

      const mockResult = {
        data: [],
        totalCount: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockProductsService.getProductsByCategory.mockResolvedValue(mockResult);

      const result = await controller.getProductsByCategory(
        categorySlug,
        paginationOptions,
      );

      expect(service.getProductsByCategory).toHaveBeenCalledWith(
        categorySlug,
        paginationOptions,
      );
      expect(result).toEqual(mockResult);
    });
  });

  describe('getRelatedProducts', () => {
    it('should return related products', async () => {
      const productId = 'test-id';
      const limit = 8;

      const mockProducts = [
        {
          id: '2',
          name: 'Related Product',
          slug: 'related-product',
          basePrice: 200,
        },
      ];

      mockProductsService.getRelatedProducts.mockResolvedValue(mockProducts);

      const result = await controller.getRelatedProducts(productId, limit);

      expect(service.getRelatedProducts).toHaveBeenCalledWith(productId, limit);
      expect(result).toEqual(mockProducts);
    });
  });

  describe('searchProducts', () => {
    it('should return empty result when no search query provided', async () => {
      const searchDto = { page: 1, limit: 12 };

      const result = await controller.searchProducts(searchDto);

      expect(result).toEqual({
        data: [],
        totalCount: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      });
    });

    it('should search products with query', async () => {
      const searchDto = { q: 'laptop', page: 1, limit: 12 };

      const mockResult = {
        data: [],
        totalCount: 0,
        page: 1,
        limit: 12,
        totalPages: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };

      mockProductsService.searchProducts.mockResolvedValue(mockResult);

      const result = await controller.searchProducts(searchDto);

      expect(service.searchProducts).toHaveBeenCalledWith('laptop', {
        page: 1,
        limit: 12,
      });
      expect(result).toEqual(mockResult);
    });
  });
});
