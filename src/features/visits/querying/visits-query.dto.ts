import { PaginationDto } from '@app/common';
import { IntersectionType } from '@nestjs/swagger';

export class VisitsQueryDto extends IntersectionType(PaginationDto) {}
