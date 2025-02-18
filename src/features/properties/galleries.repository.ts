import { Injectable, Logger } from '@nestjs/common';
import { AbstractRepository } from '@app/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Gallery } from './models/gallery.entity';

@Injectable()
export class GalleriesRepository extends AbstractRepository<Gallery> {
  protected readonly logger = new Logger(GalleriesRepository.name);

  constructor(
    @InjectRepository(Gallery)
    itemsRepository: Repository<Gallery>,
    entityManager: EntityManager,
  ) {
    super(itemsRepository, entityManager);
  }
}
