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
  ],
})
export class AppModule {}
