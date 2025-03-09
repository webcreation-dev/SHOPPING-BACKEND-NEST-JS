import { RolesRepository } from '../roles.repository';
import {
  DataSource,
  EntitySubscriberInterface,
  EventSubscriber,
  InsertEvent,
  UpdateEvent,
} from 'typeorm';
import { User } from '../entities/user.entity';
import { HashingService } from 'libs/common/src';
import { randomBytes } from 'crypto';
import { AppTypeEnum } from '../enums/app_type.enum';
import { RoleEnum } from '../enums/role.enum';
import { NotFoundException } from '@nestjs/common';
import { Role } from '../entities/role.entity';

@EventSubscriber()
export class UsersSubscriber implements EntitySubscriberInterface<User> {
  constructor(
    private readonly dataSource: DataSource,
    private readonly hashingService: HashingService,
    private readonly rolesRepository: RolesRepository,
  ) {
    dataSource.subscribers.push(this);
  }

  async beforeInsert(event: InsertEvent<User>) {
    const { entity: user } = event;

    await this.rolesRepository.create(new Role({ name: RoleEnum.USER }));
    await this.rolesRepository.create(new Role({ name: RoleEnum.MANAGER }));

    user.password = await this.hashingService.hash(user.password);
    user.code = randomBytes(3).toString('hex').toUpperCase();
    user.roles = [
      await this.rolesRepository.findOne({
        name: await this.getRole(user.app_type),
      }),
    ];
  }

  private async getRole($app_type) {
    switch ($app_type) {
      case AppTypeEnum.LOCAPAY:
        return RoleEnum.USER;
      case AppTypeEnum.LOCAPAY_BUSINESS:
        return RoleEnum.MANAGER;
      default:
        throw new NotFoundException(`Invalid user type`);
    }
  }

  async beforeUpdate(event: UpdateEvent<User>) {
    // const { entity, databaseEntity: databaseUser } = event;
    // const user = entity as User;
    // if (user.password !== databaseUser.password) {
    //   user.password = await this.hashingService.hash(user.password);
    // }
  }

  listenTo() {
    return User;
  }
}
