import { Injectable, Logger } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { AbstractRepository } from '@app/common';
import { Contract } from './entities/contract.entity';

@Injectable()
export class ContractsRepository extends AbstractRepository<Contract> {
  protected readonly logger = new Logger(ContractsRepository.name);

  constructor(entityManager: EntityManager) {
    super(entityManager.getRepository(Contract), entityManager);
  }
}
