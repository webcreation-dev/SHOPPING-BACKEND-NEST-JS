import { forwardRef, Module } from '@nestjs/common';
import { DatabaseModule, HashingModule } from '@app/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { UsersSubscriber } from './subscribers/users.subscriber';
import { RolesRepository } from './roles.repository';
import { TempUserService } from './temps/temp-user.service';
import { Role } from './entities/role.entity';
import { User } from './entities/user.entity';
import { PropertiesModule } from 'src/features/properties/properties.module';

@Module({
  imports: [
    DatabaseModule,
    DatabaseModule.forFeature([User, Role]),
    HashingModule,
    forwardRef(() => PropertiesModule),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    TempUserService,
    UsersRepository,
    UsersSubscriber,
    RolesRepository,
  ],
  exports: [UsersService, TempUserService, UsersRepository],
})
export class UsersModule {}
