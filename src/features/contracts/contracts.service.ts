import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../auth/users/entities/user.entity';
import { UsersService } from '../auth/users/users.service';
import { PropertiesService } from '../properties/properties.service';
import { ContractsQueryDto } from './querying/contracts-query.dto';
import { DefaultPageSize, PaginationService } from '@app/common';
import { Contract } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { ContractsRepository } from './contracts.repository';

@Injectable()
export class ContractsService {
  constructor(
    private readonly contractsRepository: ContractsRepository,
    private readonly usersService: UsersService,
    private readonly propertiesService: PropertiesService,
    private readonly paginationService: PaginationService,
  ) {}

  // async findAll(contractsQueryDto: ContractsQueryDto, user: User) {
  //   return this.findContractsByFilter(contractsQueryDto, user, {
  //     userId: user.id,
  //   });
  // }

  // async findManaged(contractsQueryDto: ContractsQueryDto, user: User) {
  //   return this.findContractsByFilter(contractsQueryDto, user, {
  //     managerId: user.id,
  //   });
  // }

  // async findContractsByFilter(
  //   contractsQueryDto: ContractsQueryDto,
  //   user: User,
  //   filter: { userId?: number; managerId?: number },
  // ) {
  //   const { page } = contractsQueryDto;
  //   const limit = contractsQueryDto.limit ?? DefaultPageSize.VISIT;
  //   const offset = this.paginationService.calculateOffset(limit, page);

  //   const whereCondition = filter.userId
  //     ? { user: { id: filter.userId } }
  //     : { manager: { id: filter.managerId } };

  //   const [data, count] = await this.contractsRepository.findAndCount(
  //     whereCondition,
  //     {
  //       relations: {},
  //       skip: offset,
  //       take: limit,
  //     },
  //   );

  //   const meta = this.paginationService.createMeta(limit, page, count);
  //   return { data, meta };
  // }

  async create(
    {
      tenant_id,
      landlord_id,
      property_id,
      start_date,
      end_date,
    }: CreateContractDto,
    { id }: User,
  ) {
    const [tenant, landlord, property] = await Promise.all([
      this.usersService.findOne(tenant_id),
      this.usersService.findOne(landlord_id),
      this.propertiesService.findOne(property_id),
    ]);

    if (property.user.id !== id) {
      throw new BadRequestException(
        `Vous n'etes pas autorisé à effectué cette action.`,
      );
    }

    if (property.user.id !== landlord_id && property.owner.id !== landlord_id) {
      throw new BadRequestException(
        `Vous n'etes pas autorisé à effectuer cette action.`,
      );
    }

    const contract = await this.contractsRepository.create(
      new Contract({
        tenant,
        landlord,
        property,
        start_date,
        end_date,
        articles: property.articles,
        rent_price: property.rent_price,
      }),
    );
    return await this.findOne(contract.id);
  }

  async findOne(id: number) {
    return this.contractsRepository.findOne(
      { id },
      { tenant: true, landlord: true, property: true },
    );
  }

  // async findMany(ids: number[]) {
  //   const results = await Promise.allSettled(ids.map((id) => this.findOne(id)));
  //   return results
  //     .filter((result) => result.status === 'fulfilled')
  //     .map((result: PromiseFulfilledResult<any>) => result.value);
  // }

  // async update(id: number, updateContractDto: UpdateContractDto) {
  //   return this.contractsRepository.findOneAndUpdate({ id }, updateContractDto);
  // }

  // async finalize(id: number, finalizeContractDto: FinalizeContractDto) {
  //   return this.contractsRepository.findOneAndUpdate(
  //     { id },
  //     finalizeContractDto,
  //   );
  // }

  // async remove(id: number) {
  //   await this.findOne(id);
  //   await this.contractsRepository.findOneAndDelete({ id });
  // }
}
