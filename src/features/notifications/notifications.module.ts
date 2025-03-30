import { Module } from '@nestjs/common';
import { DatabaseModule, QueryingModule } from '@app/common';
import { Notification } from './entities/notification.entity';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { NotificationsRepository } from './notifications.repository';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([Notification]),
    QueryingModule,
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService, NotificationsRepository],
  exports: [NotificationsService],
})
export class NotificationsModule {}
