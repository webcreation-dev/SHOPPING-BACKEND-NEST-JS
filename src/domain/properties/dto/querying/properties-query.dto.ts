import { PaginationDto } from 'querying/dto/pagination.dto';
import { PropertiesFilterDto } from './properties-filter.dto';
import { PropertiesSortDto } from './properties-sort.dto';
import { IntersectionType } from '@nestjs/swagger';

export class PropertiesQueryDto extends IntersectionType(
  PaginationDto,
  PropertiesFilterDto,
  PropertiesSortDto,
) {}
