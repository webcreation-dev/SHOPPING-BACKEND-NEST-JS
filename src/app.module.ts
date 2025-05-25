import { Module } from '@nestjs/common';
import { PropertiesModule } from './features/properties/properties.module';
import {
  CommonModule,
  DatabaseModule,
  EnvModule,
  FilesModule,
  LoggerModule,
  QueryingModule,
} from '@app/common';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/auth/users/users.module';
import { VisitsModule } from './features/visits/visits.module';
import { ContractsModule } from './features/contracts/contracts.module';
import { BillingsModule } from './features/billings/billings.module';
import { NotificationsModule } from './features/notifications/notifications.module';
import { WaitlistsModule } from './features/waitlists/waitlists.module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    CommonModule,
    DatabaseModule,
    EnvModule,
    AuthModule,
    UsersModule,
    FilesModule,
    QueryingModule,
    PropertiesModule,
    VisitsModule,
    LoggerModule,
    ContractsModule,
    BillingsModule,
    NotificationsModule,
    WaitlistsModule,
    ScheduleModule.forRoot(),
  ],
})
export class AppModule {}
