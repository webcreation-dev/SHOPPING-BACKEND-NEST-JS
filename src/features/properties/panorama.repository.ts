import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Panorama } from './entities/panorama.entity';
import { AbstractRepository } from '@app/common';

@Injectable()
export class PanoramaRepository extends AbstractRepository<Panorama> {
  protected readonly logger = new Logger(PanoramaRepository.name);

  constructor(entityManager: EntityManager) {
    super(entityManager.getRepository(Panorama), entityManager);
  }
}
