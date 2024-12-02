import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { AuthModule } from 'auth/auth.module';
import { UsersSubscriber } from './subscribers/users.subscriber';
import { QueryingModule } from 'querying/querying.module';
import { IsUniqueConstraint } from 'common/decorators/validators/is-unique.decorator';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, QueryingModule],
  controllers: [UsersController],
  providers: [UsersService, UsersSubscriber, IsUniqueConstraint],
})
export class UsersModule {}
