import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { Annuity } from '../entities/annuity.entity';

@Injectable()
export class AnnuitiesRepository extends AbstractRepository<Annuity> {
  protected readonly logger = new Logger(AnnuitiesRepository.name);

  constructor(entityManager: EntityManager) {
    super(entityManager.getRepository(Annuity), entityManager);
  }
}
