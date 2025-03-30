import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { AbstractRepository } from '@app/common';

@Injectable()
export class NotificationsRepository extends AbstractRepository<Notification> {
  protected readonly logger = new Logger(NotificationsRepository.name);

  constructor(entityManager: EntityManager) {
    super(entityManager.getRepository(Notification), entityManager);
  }
}
