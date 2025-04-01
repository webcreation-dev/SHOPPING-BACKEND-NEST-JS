import { Injectable } from '@nestjs/common';
import { User } from '../auth/users/entities/user.entity';
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
import { UsersRepository } from 'src/features/auth/users/users.repository';
import { ContractResource } from './resources/contract.resource';
import { NotificationsService } from 'src/features/notifications/notifications.service';
import {
  AlertModules,
  AlertOptions,
} from '../notifications/alerts/alert-types';

@Injectable()
export class ContractsService {
  constructor(
    private readonly contractsRepository: ContractsRepository,
    private usersRepository: UsersRepository,
    private readonly propertiesRepository: PropertiesRepository,
    private readonly paginationService: PaginationService,
    private readonly duesRepository: DuesRepository,
    private readonly contractResource: ContractResource,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(contractsQueryDto: ContractsQueryDto, user: User) {
    const [ownContracts, ownerContracts] = await Promise.all([
      this.findOwn(contractsQueryDto, user),
      this.findManaged(contractsQueryDto, user),
    ]);
    return { own: ownContracts, managed: ownerContracts };
  }

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

    const [data] = await this.contractsRepository.findAndCount(whereCondition, {
      relations: { tenant: true, landlord: true, property: true, dues: true },
      skip: offset,
      take: limit,
    });

    // edit each contract to include dues
    for (const contract of data) {
      const [dues] = await this.duesRepository.findAndCount(
        { contract: { id: contract.id } },
        { relations: { annuities: true } },
      );
      contract.dues = dues;
    }

    return this.contractResource.formatCollection(data);
  }

  async create(
    { tenant_id, landlord_id, property_id, start_date }: CreateContractDto,
    { id }: User,
  ) {
    const [tenant, landlord, property] = await Promise.all([
      this.usersRepository.findOne({ id: tenant_id }),
      this.usersRepository.findOne({ id: landlord_id }),
      this.propertiesRepository.findOne(
        { id: property_id, user: { id } },
        { galleries: true, user: true, owner: true },
      ),
    ]);

    const contract = await this.contractsRepository.create(
      new Contract({
        tenant,
        landlord,
        property,
        start_date,
        articles: property.articles,
        rent_price: property.rent_price,
        caution: property.caution,
      }),
    );

    await this.notificationsService.sendNotification({
      module: AlertModules.CONTRACT,
      option: AlertOptions.CREATE,
      module_id: contract.id,
      user: await this.usersRepository.findOne({ id: tenant_id }),
    });

    return await this.findOne(contract.id);
  }

  async findOne(id: number) {
    const contract = this.contractResource.format(
      await this.contractsRepository.findOne(
        { id },
        { tenant: true, landlord: true, property: true, dues: true },
      ),
    );

    const [dues] = await this.duesRepository.findAndCount(
      { contract: { id } },
      { relations: { annuities: true } },
    );
    contract.dues = dues;
    return contract;
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
      caution: activateContractDto.amount,
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
        carry_over_amount: contract.rent_price,
        contract,
      }),
    );

    return await this.findOne(contract.id);
  }

  async getAll(): Promise<Contract[]> {
    return await this.contractsRepository.find({});
  }
}
