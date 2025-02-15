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

    // await this.rolesRepository.create(new Role({ name: RoleEnum.USER}));
    // await this.rolesRepository.create(new Role({ name: RoleEnum.MANAGER}));

    user.password = await this.hashingService.hash(user.password);
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
