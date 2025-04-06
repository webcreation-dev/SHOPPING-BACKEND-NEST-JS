import { PaginationDto } from '@app/common';
import { IntersectionType } from '@nestjs/swagger';

export class WaitlistsQueryDto extends IntersectionType(PaginationDto) {}
