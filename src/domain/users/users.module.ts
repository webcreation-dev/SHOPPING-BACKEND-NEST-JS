import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'auth/auth.module';
import { UsersSubscriber } from './subscribers/users.subscriber';
import { QueryingModule } from 'querying/querying.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, QueryingModule],
  controllers: [UsersController],
  providers: [UsersService, UsersSubscriber],
})
export class UsersModule {}
