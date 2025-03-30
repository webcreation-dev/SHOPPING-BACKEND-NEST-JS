import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import {
  CurrentUser,
  HeaderOperation,
  ApiPaginatedResponse,
} from '@app/common';
import { NotificationsService } from './notifications.service';
import { Notification } from './entities/notification.entity';
import { NotificationsQueryDto } from './querying/notifications-query.dto';
import { User } from '../auth/users/entities/user.entity';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiPaginatedResponse(Notification)
  @HeaderOperation('GET ALL', NotificationsQueryDto)
  findAll(
    @Query() notificationsQueryDto: NotificationsQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.notificationsService.findAll(notificationsQueryDto, user);
  }

  @Get(':id')
  @HeaderOperation('GET ONE')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.notificationsService.findOne(id);
  }

  @Get('/all_read')
  @HeaderOperation('ALL READ')
  async allRead(@Body() ids: number[]) {
    return await this.notificationsService.allRead(ids);
  }
}
