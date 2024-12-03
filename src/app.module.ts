import { Module } from '@nestjs/common';
import { UsersModule } from './domain/users/users.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { EnvModule } from './env/env.module';
import { OrdersModule } from './domain/orders/orders.module';
import { PaymentsModule } from './domain/payments/payments.module';
import { CategoriesModule } from './domain/categories/categories.module';
import { ProductsModule } from './domain/products/products.module';
import { SeedingModule } from 'database/seeding/seeding.module';
import { AuthModule } from './auth/auth.module';
import { FilesModule } from './files/files.module';
import { QueryingModule } from './querying/querying.module';
import { OtpModule } from './otp/otp.module';

@Module({
  imports: [
    UsersModule,
    CommonModule,
    DatabaseModule,
    EnvModule,
    OrdersModule,
    PaymentsModule,
    CategoriesModule,
    ProductsModule,
    SeedingModule,
    AuthModule,
    FilesModule,
    QueryingModule,
    OtpModule,
  ],
})
export class AppModule {}
