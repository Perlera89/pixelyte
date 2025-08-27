import { ApiProperty } from '@nestjs/swagger';

export class PaginationMetaDto {
  @ApiProperty({
    description: 'Número total de elementos',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Número de página actual',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Elementos por página',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Número total de páginas',
    example: 10,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Indica si hay página anterior',
    example: false,
  })
  hasPreviousPage: boolean;

  @ApiProperty({
    description: 'Indica si hay página siguiente',
    example: true,
  })
  hasNextPage: boolean;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({
    description: 'Datos de la página actual',
    isArray: true,
  })
  data: T[];

  @ApiProperty({
    description: 'Metadatos de paginación',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}
