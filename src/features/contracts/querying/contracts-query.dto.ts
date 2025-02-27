import { PaginationDto } from '@app/common';
import { IntersectionType } from '@nestjs/swagger';

export class ContractsQueryDto extends IntersectionType(PaginationDto) {}
