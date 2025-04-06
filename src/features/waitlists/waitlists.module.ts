import { Module } from '@nestjs/common';
import { WaitlistsController } from './waitlists.controller';
import { WaitlistsService } from './waitlists.service';
import { DatabaseModule, QueryingModule } from '@app/common';
import { Waitlist } from './entities/waitlist.entity';
import { WaitlistsRepository } from './waitlists.repository';
import { UsersModule } from '../auth/users/users.module';
import { PropertiesModule } from '../properties/properties.module';
import { WaitlistResource } from './resources/waitlist.resource';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([Waitlist]),
    QueryingModule,
    UsersModule,
    NotificationsModule,
    PropertiesModule,
  ],
  controllers: [WaitlistsController],
  providers: [WaitlistsService, WaitlistsRepository, WaitlistResource],
})
export class WaitlistsModule {}
