import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { Waitlist } from './entities/waitlist.entity';

@Injectable()
export class WaitlistsRepository extends AbstractRepository<Waitlist> {
  protected readonly logger = new Logger(WaitlistsRepository.name);

  constructor(entityManager: EntityManager) {
    super(entityManager.getRepository(Waitlist), entityManager);
  }
}
