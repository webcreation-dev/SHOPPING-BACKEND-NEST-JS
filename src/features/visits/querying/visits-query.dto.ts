import { PaginationDto } from '@app/common';
import { IntersectionType } from '@nestjs/swagger';
import { VisitsFilterDto } from './visits-filter.dto';

export class VisitsQueryDto extends IntersectionType(
  PaginationDto,
  VisitsFilterDto,
) {}
