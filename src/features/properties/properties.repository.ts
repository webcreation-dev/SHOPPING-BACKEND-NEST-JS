import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Property } from './entities/property.entity';
import { AbstractRepository } from '@app/common';

@Injectable()
export class PropertiesRepository extends AbstractRepository<Property> {
  protected readonly logger = new Logger(PropertiesRepository.name);

  constructor(entityManager: EntityManager) {
    super(entityManager.getRepository(Property), entityManager);
  }
}
