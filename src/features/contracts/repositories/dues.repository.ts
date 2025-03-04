import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { Due } from '../entities/due.entity';

@Injectable()
export class DuesRepository extends AbstractRepository<Due> {
  protected readonly logger = new Logger(DuesRepository.name);

  constructor(entityManager: EntityManager) {
    super(entityManager.getRepository(Due), entityManager);
  }
}
