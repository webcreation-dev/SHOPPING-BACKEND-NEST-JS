import { Injectable } from '@nestjs/common';
import { VisitsRepository } from './visits.repository';
import { CreateVisitDto } from './dto/create-visit.dto';
import { Visit } from './entities/visit.entity';
import { UpdateVisitDto } from './dto/update-visit.dto';
import { User } from '../auth/users/entities/user.entity';
import { UsersService } from '../auth/users/users.service';
import { PropertiesService } from '../properties/properties.service';
import { VisitsQueryDto } from './querying/visits-query.dto';
import { DefaultPageSize, PaginationService } from '@app/common';
import { FinalizeVisitDto } from './dto/finalize-visit.dto';
import { VisitResource } from 'src/features/visits/resources/visit.resource';
import { PropertyResource } from '../properties/resources/property.resource';
import { PropertiesRepository } from 'src/features/properties/properties.repository';
import { UsersRepository } from 'src/features/auth/users/users.repository';
import { NotificationsService } from '../notifications/notifications.service';
import {
  AlertModules,
  AlertOptions,
} from '../notifications/alerts/alert-types';

@Injectable()
export class VisitsService {
  constructor(
    private readonly visitsRepository: VisitsRepository,
    private readonly usersService: UsersService,
    private usersRepository: UsersRepository,
    private readonly propertiesService: PropertiesService,
    private readonly propertiesRepository: PropertiesRepository,
    private readonly paginationService: PaginationService,
    private readonly visitResource: VisitResource,
    private readonly propertyResource: PropertyResource,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(visitsQueryDto: VisitsQueryDto, user: User) {
    return this.findVisitsByFilter(visitsQueryDto, user, { userId: user.id });
  }

  async findManaged(visitsQueryDto: VisitsQueryDto, user: User) {
    return this.findVisitsByFilter(visitsQueryDto, user, {
      managerId: user.id,
    });
  }

  async findVisitsByFilter(
    visitsQueryDto: VisitsQueryDto,
    user: User,
    filter: { userId?: number; managerId?: number },
  ) {
    const { page, status } = visitsQueryDto;
    const limit = visitsQueryDto.limit ?? DefaultPageSize.VISIT;
    const offset = this.paginationService.calculateOffset(limit, page);

    const whereCondition = filter.userId
      ? { user: { id: filter.userId }, status }
      : { manager: { id: filter.managerId }, status };

    const [data, count] = await this.visitsRepository.findAndCount(
      whereCondition,
      {
        relations: { user: true, property: true, manager: true },
        skip: offset,
        take: limit,
      },
    );

    const meta = this.paginationService.createMeta(limit, page, count);
    return { data: this.visitResource.formatCollection(data), meta };
  }

  async create({ property_id }: CreateVisitDto, { id }: User) {
    const userData = await this.usersRepository.findOne({ id });
    const property = await this.propertiesRepository.findOne(
      { id: property_id },
      { user: true },
    );

    const visit = await this.visitsRepository.create(
      new Visit({
        user: userData,
        property: property,
        manager: property.user,
      }),
    );
    await this.notificationsService.sendNotification({
      module: AlertModules.VISIT,
      option: AlertOptions.CREATE,
      module_id: visit.id,
      user: userData,
    });
    return await this.findOne(visit.id);
  }

  async findOne(id: number) {
    const visit = await this.visitsRepository.findOne(
      { id },
      { user: true, property: true, manager: true },
    );
    return this.visitResource.format(visit);
  }

  async findMany(ids: number[]) {
    const results = await Promise.allSettled(ids.map((id) => this.findOne(id)));
    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result: PromiseFulfilledResult<any>) => result.value);
  }

  async update(id: number, updateVisitDto: UpdateVisitDto) {
    await this.visitsRepository.findOneAndUpdate({ id }, updateVisitDto);
    return await this.findOne(id);
  }

  async finalize(id: number, finalizeVisitDto: FinalizeVisitDto) {
    await this.visitsRepository.findOneAndUpdate({ id }, finalizeVisitDto);
    return await this.findOne(id);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.visitsRepository.findOneAndDelete({ id });
  }
}
