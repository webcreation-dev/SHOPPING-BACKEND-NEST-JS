import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Role } from './entities/role.entity';
import { AbstractRepository } from 'libs/common/src';

@Injectable()
export class RolesRepository extends AbstractRepository<Role> {
  protected readonly logger = new Logger(RolesRepository.name);

  constructor(entityManager: EntityManager) {
    super(entityManager.getRepository(Role), entityManager);
  }
}
