import { Logger, NotFoundException } from '@nestjs/common';
import { AbstractEntity } from './abstract.entity';
import {
  EntityManager,
  FindOptionsOrder,
  FindOptionsRelations,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

export abstract class AbstractRepository<T extends AbstractEntity<T>> {
  protected abstract readonly logger: Logger;

  constructor(
    protected readonly itemsRepository: Repository<T>,
    protected readonly entityManager: EntityManager,
  ) {}

  async create(entity: T): Promise<T> {
    return this.entityManager.save(entity);
  }

  async findOne(
    where: FindOptionsWhere<T>,
    relations?: FindOptionsRelations<T>,
  ): Promise<T> {
    const entity = await this.itemsRepository.findOne({ where, relations });

    if (!entity) {
      this.logger.warn('Document not found with where', where);
      throw new NotFoundException('Entity not found.');
    }

    return entity;
  }

  async findOneAndUpdate(
    where: FindOptionsWhere<T>,
    partialEntity: QueryDeepPartialEntity<T>,
  ) {
    const updateResult = await this.itemsRepository.update(
      where,
      partialEntity,
    );

    if (!updateResult.affected) {
      this.logger.warn('Entity not found with where', where);
      throw new NotFoundException('Entity not found.');
    }

    return this.findOne(where);
  }

  async find(where: FindOptionsWhere<T>) {
    return this.itemsRepository.findBy(where);
  }

  async findOneAndDelete(where: FindOptionsWhere<T>) {
    await this.itemsRepository.delete(where);
  }

  async save(entity: T): Promise<T> {
    return this.itemsRepository.save(entity);
  }

  async findAndCount(
    where: FindOptionsWhere<T>,
    options: {
      relations?: FindOptionsRelations<T>;
      order?: FindOptionsOrder<T>;
      skip?: number;
      take?: number;
    } = {},
  ): Promise<[T[], number]> {
    return this.itemsRepository.findAndCount({
      where,
      relations: options.relations,
      order: options.order,
      skip: options.skip,
      take: options.take,
    });
  }
}
