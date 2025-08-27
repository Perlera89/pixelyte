import {
  Injectable,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/services/prisma.service';
import {
  CreateProductReviewDto,
  UpdateProductReviewDto,
  CreateReviewVoteDto,
} from './dto/review.dto';
import {
  PaginationOptions,
  PaginationHelper,
  PaginatedResult,
} from '../../common/utils/pagination.util';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async createReview(createReviewDto: CreateProductReviewDto) {
    // Verificar que el producto existe
    const product = await this.prisma.product.findUnique({
      where: { id: createReviewDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: createReviewDto.userId },
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Verificar si el usuario ya tiene una reseña para este producto
    const existingReview = await this.prisma.productReview.findFirst({
      where: {
        productId: createReviewDto.productId,
        userId: createReviewDto.userId,
      },
    });

    if (existingReview) {
      throw new ConflictException(
        'Ya has dejado una reseña para este producto',
      );
    }

    // Verificar si es una compra verificada
    let isVerifiedPurchase = false;
    if (createReviewDto.orderId) {
      const order = await this.prisma.order.findFirst({
        where: {
          id: createReviewDto.orderId,
          userId: createReviewDto.userId,
          status: 'DELIVERED',
          orderItems: {
            some: {
              productId: createReviewDto.productId,
            },
          },
        },
      });

      isVerifiedPurchase = !!order;
    }

    return this.prisma.productReview.create({
      data: {
        ...createReviewDto,
        isVerifiedPurchase,
      },
      include: {
        user: {
          select: {
            id: true,
            names: true,
            surnames: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async findReviewsByProduct(
    productId: string,
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      searchQuery,
    } = paginationOptions;
    const offset = PaginationHelper.calculateOffset(page, limit);
    const where: any = {
      productId,
      isApproved: true,
    };
    if (searchQuery) {
      where.OR = [
        { title: { contains: searchQuery, mode: 'insensitive' } },
        { content: { contains: searchQuery, mode: 'insensitive' } },
        { summary: { contains: searchQuery, mode: 'insensitive' } },
      ];
    }
    const [reviews, totalCount] = await Promise.all([
      this.prisma.productReview.findMany({
        where,
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              names: true,
              surnames: true,
              profile: {
                select: {
                  avatarUrl: true,
                },
              },
            },
          },
          reviewVote: {
            select: {
              isHelpful: true,
            },
          },
        },
      }),
      this.prisma.productReview.count({ where }),
    ]);
    return PaginationHelper.createPaginatedResult(
      reviews,
      totalCount,
      page,
      limit,
    );
  }

  async findReviewsByUser(
    userId: string,
    paginationOptions: PaginationOptions,
  ): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = paginationOptions;
    const offset = PaginationHelper.calculateOffset(page, limit);

    const [reviews, totalCount] = await Promise.all([
      this.prisma.productReview.findMany({
        where: { userId },
        skip: offset,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              productImages: {
                where: { isPrimary: true },
                take: 1,
                select: {
                  url: true,
                  altText: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.productReview.count({ where: { userId } }),
    ]);

    return PaginationHelper.createPaginatedResult(
      reviews,
      totalCount,
      page,
      limit,
    );
  }

  async findOneReview(id: string) {
    const review = await this.prisma.productReview.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            names: true,
            surnames: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        reviewVote: {
          include: {
            user: {
              select: {
                id: true,
                names: true,
                surnames: true,
              },
            },
          },
        },
      },
    });

    if (!review) {
      throw new NotFoundException('Reseña no encontrada');
    }

    return review;
  }

  async updateReview(
    id: string,
    updateReviewDto: UpdateProductReviewDto,
    userId?: string,
  ) {
    const review = await this.findOneReview(id);

    // Si no es admin, verificar que sea el propietario de la reseña
    if (userId && review.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para actualizar esta reseña',
      );
    }

    return this.prisma.productReview.update({
      where: { id },
      data: updateReviewDto,
      include: {
        user: {
          select: {
            id: true,
            names: true,
            surnames: true,
            profile: {
              select: {
                avatarUrl: true,
              },
            },
          },
        },
        product: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
    });
  }

  async removeReview(id: string, userId?: string) {
    const review = await this.findOneReview(id);

    // Si no es admin, verificar que sea el propietario de la reseña
    if (userId && review.userId !== userId) {
      throw new ForbiddenException(
        'No tienes permisos para eliminar esta reseña',
      );
    }

    return this.prisma.productReview.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async voteReview(createVoteDto: CreateReviewVoteDto) {
    // Verificar que la reseña existe
    await this.findOneReview(createVoteDto.reviewId);

    // Verificar si el usuario ya votó en esta reseña
    const existingVote = await this.prisma.reviewVote.findFirst({
      where: {
        reviewId: createVoteDto.reviewId,
        userId: createVoteDto.userId,
      },
    });

    if (existingVote) {
      // Actualizar voto existente
      const updatedVote = await this.prisma.reviewVote.update({
        where: { id: existingVote.id },
        data: { isHelpful: createVoteDto.isHelpful },
      });

      // Actualizar contador de helpful
      await this.updateHelpfulCount(createVoteDto.reviewId);

      return updatedVote;
    }

    // Crear nuevo voto
    const vote = await this.prisma.reviewVote.create({
      data: createVoteDto,
    });

    // Actualizar contador de helpful
    await this.updateHelpfulCount(createVoteDto.reviewId);

    return vote;
  }

  async getProductReviewStats(productId: string) {
    const stats = await this.prisma.productReview.groupBy({
      by: ['rating'],
      where: {
        productId,
        isApproved: true,
      },
      _count: {
        rating: true,
      },
    });

    const totalReviews = await this.prisma.productReview.count({
      where: {
        productId,
        isApproved: true,
      },
    });

    const averageRating = await this.prisma.productReview.aggregate({
      where: {
        productId,
        isApproved: true,
      },
      _avg: {
        rating: true,
      },
    });

    const ratingDistribution = {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
    };

    stats.forEach((stat) => {
      ratingDistribution[stat.rating] = stat._count.rating;
    });

    return {
      totalReviews,
      averageRating: averageRating._avg.rating || 0,
      ratingDistribution,
    };
  }

  private async updateHelpfulCount(reviewId: string) {
    const helpfulCount = await this.prisma.reviewVote.count({
      where: {
        reviewId,
        isHelpful: true,
      },
    });

    await this.prisma.productReview.update({
      where: { id: reviewId },
      data: { helpfulCount },
    });
  }
}
