import { Test, TestingModule } from '@nestjs/testing';
import { ProductsService } from './products.service';
import { PrismaService } from '../../common/services/prisma.service';
import { SupabaseService } from '../../common/services/supabase.service';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      count: jest.fn(),
    },
    category: {
      findUnique: jest.fn(),
    },
    brand: {
      findUnique: jest.fn(),
    },
    productVariant: {
      findFirst: jest.fn(),
    },
  };

  const mockSupabaseService = {};

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: SupabaseService,
          useValue: mockSupabaseService,
        },
      ],
    }).compile();

    service = module.get<ProductsService>(ProductsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getFeaturedProducts', () => {
    it('should return featured products', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Featured Product',
          isFeatured: true,
          isActive: true,
          status: 'ACTIVE',
        },
      ];

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.getFeaturedProducts(12);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          isFeatured: true,
          isActive: true,
          status: 'ACTIVE',
        },
        take: 12,
        orderBy: { createdAt: 'desc' },
        include: {
          brand: { select: { name: true, slug: true } },
          category: { select: { name: true, slug: true } },
          productImages: {
            where: { isPrimary: true },
            take: 1,
            select: { url: true, altText: true },
          },
          _count: {
            select: { productReviews: true },
          },
        },
      });
      expect(result).toEqual(mockProducts);
    });
  });

  describe('getProductsByCategory', () => {
    it('should return products by category slug', async () => {
      const categorySlug = 'laptops';
      const mockCategory = { id: 'category-id', slug: categorySlug };
      const mockProducts = [{ id: '1', name: 'Laptop' }];
      const mockCount = 1;

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(mockCount);

      const result = await service.getProductsByCategory(categorySlug, {
        page: 1,
        limit: 12,
      });

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { slug: categorySlug },
      });
      expect(result.data).toEqual(mockProducts);
      expect(result.totalCount).toBe(mockCount);
    });

    it('should throw NotFoundException when category not found', async () => {
      const categorySlug = 'nonexistent';

      mockPrismaService.category.findUnique.mockResolvedValue(null);

      await expect(
        service.getProductsByCategory(categorySlug, { page: 1, limit: 12 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getRelatedProducts', () => {
    it('should return related products', async () => {
      const productId = 'product-id';
      const mockProduct = { categoryId: 'cat-id', brandId: 'brand-id' };
      const mockRelatedProducts = [{ id: '2', name: 'Related Product' }];

      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.product.findMany.mockResolvedValue(mockRelatedProducts);

      const result = await service.getRelatedProducts(productId, 8);

      expect(prismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: productId },
        select: { categoryId: true, brandId: true },
      });
      expect(result).toEqual(mockRelatedProducts);
    });

    it('should throw NotFoundException when product not found', async () => {
      const productId = 'nonexistent';

      mockPrismaService.product.findUnique.mockResolvedValue(null);

      await expect(service.getRelatedProducts(productId, 8)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('searchProducts', () => {
    it('should search products by query', async () => {
      const searchQuery = 'laptop';
      const mockProducts = [{ id: '1', name: 'Gaming Laptop' }];
      const mockCount = 1;

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(mockCount);

      const result = await service.searchProducts(searchQuery, {
        page: 1,
        limit: 12,
      });

      expect(result.data).toEqual(mockProducts);
      expect(result.totalCount).toBe(mockCount);
    });
  });

  describe('searchProductsWithFilters', () => {
    it('should search products with multiple filters', async () => {
      const filters = {
        search: 'laptop',
        minPrice: 100,
        maxPrice: 1000,
        isFeatured: true,
      };
      const mockProducts = [{ id: '1', name: 'Gaming Laptop' }];
      const mockCount = 1;

      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(mockCount);

      const result = await service.searchProductsWithFilters(filters);

      expect(result.data).toEqual(mockProducts);
      expect(result.totalCount).toBe(mockCount);
    });

    it('should handle category slug filter', async () => {
      const filters = { category: 'laptops' };
      const mockCategory = { id: 'category-id', slug: 'laptops' };
      const mockProducts = [{ id: '1', name: 'Laptop' }];
      const mockCount = 1;

      mockPrismaService.category.findUnique.mockResolvedValue(mockCategory);
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(mockCount);

      const result = await service.searchProductsWithFilters(filters);

      expect(prismaService.category.findUnique).toHaveBeenCalledWith({
        where: { slug: 'laptops' },
      });
      expect(result.data).toEqual(mockProducts);
    });

    it('should handle brand slug filter', async () => {
      const filters = { brand: 'apple' };
      const mockBrand = { id: 'brand-id', slug: 'apple' };
      const mockProducts = [{ id: '1', name: 'MacBook' }];
      const mockCount = 1;

      mockPrismaService.brand.findUnique.mockResolvedValue(mockBrand);
      mockPrismaService.product.findMany.mockResolvedValue(mockProducts);
      mockPrismaService.product.count.mockResolvedValue(mockCount);

      const result = await service.searchProductsWithFilters(filters);

      expect(prismaService.brand.findUnique).toHaveBeenCalledWith({
        where: { slug: 'apple' },
      });
      expect(result.data).toEqual(mockProducts);
    });
  });
});
