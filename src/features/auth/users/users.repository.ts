import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { User } from './entities/user.entity';
import { AbstractRepository } from 'libs/common/src';

@Injectable()
export class UsersRepository extends AbstractRepository<User> {
  protected readonly logger = new Logger(UsersRepository.name);

  constructor(entityManager: EntityManager) {
    super(entityManager.getRepository(User), entityManager);
  }
}
