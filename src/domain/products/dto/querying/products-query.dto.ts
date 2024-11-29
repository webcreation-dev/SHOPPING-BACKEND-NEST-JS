import { PaginationDto } from 'querying/dto/pagination.dto';
import { ProductsFilterDto } from './products-filter.dto';
import { ProductsSortDto } from './products-sort.dto';
import { IntersectionType } from '@nestjs/swagger';

export class ProductsQueryDto extends IntersectionType(
  PaginationDto,
  ProductsFilterDto,
  ProductsSortDto,
) {}
