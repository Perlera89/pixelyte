export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchQuery?: string;
}

export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export class PaginationHelper {
  static calculateOffset(page: number, limit: number): number {
    return (page - 1) * limit;
  }

  static calculateTotalPages(totalCount: number, limit: number): number {
    return Math.ceil(totalCount / limit);
  }

  static createPaginatedResult<T>(
    data: T[],
    totalCount: number,
    page: number,
    limit: number,
  ): PaginatedResult<T> {
    const totalPages = this.calculateTotalPages(totalCount, limit);
    return {
      data,
      totalCount,
      page,
      limit,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1 && totalPages > 0,
    };
  }
}
