import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesRepository extends AbstractRepository<Role> {
  protected readonly logger = new Logger(RolesRepository.name);

  constructor(
    @InjectRepository(Role)
    rolesRepository: Repository<Role>,
    entityManager: EntityManager,
  ) {
    super(rolesRepository, entityManager);
  }
}
