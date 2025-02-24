import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Gallery } from './entities/gallery.entity';
import { AbstractRepository } from '@app/common';

@Injectable()
export class GalleriesRepository extends AbstractRepository<Gallery> {
  protected readonly logger = new Logger(GalleriesRepository.name);

  constructor(entityManager: EntityManager) {
    super(entityManager.getRepository(Gallery), entityManager);
  }
}
