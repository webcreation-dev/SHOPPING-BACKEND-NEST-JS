import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Visit } from './entities/visit.entity';
import { AbstractRepository } from '@app/common';

@Injectable()
export class VisitsRepository extends AbstractRepository<Visit> {
  protected readonly logger = new Logger(VisitsRepository.name);

  constructor(entityManager: EntityManager) {
    super(entityManager.getRepository(Visit), entityManager);
  }
}
