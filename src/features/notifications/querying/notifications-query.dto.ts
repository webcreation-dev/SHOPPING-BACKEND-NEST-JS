import { PaginationDto } from '@app/common';
import { IntersectionType } from '@nestjs/swagger';
import { NotificationsFilterDto } from './notifications-filter.dto';

export class NotificationsQueryDto extends IntersectionType(
  PaginationDto,
  NotificationsFilterDto,
) {}
