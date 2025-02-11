import { Module } from '@nestjs/common';
// import { PropertiesModule } from './features/properties/properties.module';
import {
  CommonModule,
  DatabaseModule,
  EnvModule,
  FilesModule,
  LoggerModule,
  OtpModule,
  QueryingModule,
} from '@app/common';
import { SeedingModule } from 'libs/common/src/database/seeding/seeding.module';
import { AuthModule } from './features/auth/auth.module';
import { UsersModule } from './features/auth/users/users.module';

@Module({
  imports: [
    CommonModule,
    DatabaseModule,
    EnvModule,
    SeedingModule,
    AuthModule,
    UsersModule,
    FilesModule,
    QueryingModule,
    OtpModule,
    // PropertiesModule,
    LoggerModule,
  ],
})
export class AppModule {}
