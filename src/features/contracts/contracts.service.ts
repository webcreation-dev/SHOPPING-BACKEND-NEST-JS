import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from '../auth/users/entities/user.entity';
import { UsersService } from '../auth/users/users.service';
// import { PropertiesService } from '../properties/properties.service';
import { ContractsQueryDto } from './querying/contracts-query.dto';
import { DefaultPageSize, PaginationService } from '@app/common';
import { Contract } from './entities/contract.entity';
import { CreateContractDto } from './dto/create-contract.dto';
import { ContractsRepository } from './repositories/contracts.repository';
import { ActivateContractDto } from './dto/activate-contract.dto';
import { StatusContractEnum } from './enums/status-contract.enum';
import { DuesRepository } from './repositories/dues.repository';
import { Due } from './entities/due.entity';
import { PropertiesRepository } from '../properties/properties.repository';

@Injectable()
export class ContractsService {
  constructor(
    private readonly contractsRepository: ContractsRepository,
    private readonly usersService: UsersService,
    private readonly propertiesRepository: PropertiesRepository,
    private readonly paginationService: PaginationService,
    private readonly duesRepository: DuesRepository,
  ) {}

  async findOwn(contractsQueryDto: ContractsQueryDto, user: User) {
    return this.findContractsByFilter(contractsQueryDto, user, {
      tenantId: user.id,
    });
  }

  async findManaged(contractsQueryDto: ContractsQueryDto, user: User) {
    return this.findContractsByFilter(contractsQueryDto, user, {
      landlordId: user.id,
    });
  }

  async findContractsByFilter(
    contractsQueryDto: ContractsQueryDto,
    user: User,
    filter: { tenantId?: number; landlordId?: number },
  ) {
    const { page } = contractsQueryDto;
    const limit = contractsQueryDto.limit ?? DefaultPageSize.CONTRACTS;
    const offset = this.paginationService.calculateOffset(limit, page);

    const whereCondition = filter.tenantId
      ? { tenant: { id: filter.tenantId } }
      : { landlord: { id: filter.landlordId } };

    const [data, count] = await this.contractsRepository.findAndCount(
      whereCondition,
      {
        relations: {},
        skip: offset,
        take: limit,
      },
    );

    const meta = this.paginationService.createMeta(limit, page, count);
    return { data, meta };
  }

  async create(
    { tenant_id, landlord_id, property_id, start_date }: CreateContractDto,
    { id }: User,
  ) {
    const [tenant, landlord, property] = await Promise.all([
      this.usersService.findOne(tenant_id),
      this.usersService.findOne(landlord_id),
      this.propertiesRepository.findOne(
        { id: property_id },
        { galleries: true, user: true, owner: true },
      ),
    ]);

    // if (property.user.id !== id) {
    //   throw new BadRequestException(
    //     `Vous n'etes pas autorisé à effectuer cette action.`,
    //   );
    // }

    const contract = await this.contractsRepository.create(
      new Contract({
        tenant,
        landlord,
        property,
        start_date,
        articles: property.articles,
        rent_price: property.rent_price,
      }),
    );
    return await this.findOne(contract.id);
  }

  async findOne(id: number) {
    return this.contractsRepository.findOne(
      { id },
      { tenant: true, landlord: true, property: true, dues: true },
    );
  }

  async findMany(ids: number[]) {
    const results = await Promise.allSettled(ids.map((id) => this.findOne(id)));
    return results
      .filter((result) => result.status === 'fulfilled')
      .map((result: PromiseFulfilledResult<any>) => result.value);
  }

  async activate(
    id: number,
    user: User,
    activateContractDto: ActivateContractDto,
  ) {
    await this.contractsRepository.findOne({
      id,
      tenant: { id: user.id },
      status: StatusContractEnum.PENDING,
    });

    const contract = await this.contractsRepository.findOneAndUpdate(
      { id },
      {
        status: StatusContractEnum.ACTIVE,
      },
    );

    this.duesRepository.create(
      new Due({
        contract,
      }),
    );

    return contract;
  }
}
