import { Module, forwardRef } from '@nestjs/common';
import { DatabaseModule, HashingModule } from '@app/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersSubscriber } from './subscribers/users.subscriber';
import { RolesRepository } from './roles.repository';
import { TempUserService } from './temps/temp-user.service';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([User, Role]),
    HashingModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    TempUserService,
    UsersRepository,
    UsersSubscriber,
    RolesRepository,
  ],
  exports: [UsersService, TempUserService],
})
export class UsersModule {}
