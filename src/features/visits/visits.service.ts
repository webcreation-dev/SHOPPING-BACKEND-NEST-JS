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
import { Property } from '../properties/entities/property.entity';
import { StatusEnum } from './enums/status.enum';
import { In } from 'typeorm';

@Injectable()
export class VisitsService {
  constructor(
    private readonly visitsRepository: VisitsRepository,
    private readonly usersService: UsersService,
    private readonly propertiesService: PropertiesService,
    private readonly paginationService: PaginationService,
    private readonly visitResource: VisitResource,
    private readonly propertyResource: PropertyResource,
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
    const { page } = visitsQueryDto;
    const limit = visitsQueryDto.limit ?? DefaultPageSize.VISIT;
    const offset = this.paginationService.calculateOffset(limit, page);

    const whereCondition = filter.userId
      ? { user: { id: filter.userId } }
      : { manager: { id: filter.managerId } };

    const [data, count] = await this.visitsRepository.findAndCount(
      whereCondition,
      {
        relations: { user: true, property: true, manager: true },
        skip: offset,
        take: limit,
      },
    );

    for (const visit of data) {
      visit.property = (await this.propertyResource.format(
        await this.propertiesService.findOne(visit.property.id),
      )) as Property;
    }

    const meta = this.paginationService.createMeta(limit, page, count);
    return { data: this.visitResource.formatCollection(data), meta };
  }

  async create({ property_id }: CreateVisitDto, { id }: User) {
    const userData = await this.usersService.findOne(id);
    const property = await this.propertiesService.findOne(property_id);

    const existingVisit = await this.visitsRepository.findOne({
      user: { id: userData.id },
      property: { id: property.id },
      status: In([StatusEnum.WAITING, StatusEnum.IN_PROGRESS]),
    });

    if (!existingVisit) {
      const visit = await this.visitsRepository.create(
        new Visit({
          user: userData,
          property: property,
          manager: property.user,
        }),
      );
      return await this.findOne(visit.id);
    } else {
      return await this.findOne(existingVisit.id);
    }
  }

  async findOne(id: number) {
    const visit = await this.visitsRepository.findOne(
      { id },
      { user: true, property: true, manager: true },
    );
    visit.property = (await this.propertyResource.format(
      await this.propertiesService.findOne(visit.property.id),
    )) as Property;
    return visit;
  }

  async findMany(ids: number[]) {
    const results = await Promise.allSettled(ids.map((id) => this.findOne(id)));
    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result: PromiseFulfilledResult<any>) => result.value);
  }

  async update(id: number, updateVisitDto: UpdateVisitDto) {
    return this.visitsRepository.findOneAndUpdate({ id }, updateVisitDto);
  }

  async finalize(id: number, finalizeVisitDto: FinalizeVisitDto) {
    return this.visitsRepository.findOneAndUpdate({ id }, finalizeVisitDto);
  }

  async remove(id: number) {
    await this.findOne(id);
    await this.visitsRepository.findOneAndDelete({ id });
  }
}
