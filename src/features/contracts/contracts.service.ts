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
import { Due, InvoiceItem } from './entities/due.entity';
import { PropertiesRepository } from '../properties/properties.repository';
import { UsersRepository } from 'src/features/auth/users/users.repository';
import { ContractResource } from './resources/contract.resource';
import { NotificationsService } from 'src/features/notifications/notifications.service';
import {
  AlertModules,
  AlertOptions,
} from '../notifications/alerts/alert-types';
import { AddInvoicesDto } from './dto/invoices/add-invoice.dto';
import { UpdateInvoiceDto } from './dto/invoices/update-invoice.dto';

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
    const [ownContracts, managedContracts, ownedPropertiesContracts] =
      await Promise.all([
        this.findOwn(contractsQueryDto, user),
        this.findMangaged(contractsQueryDto, user),
        this.findOwnedPropertiesContracts(contractsQueryDto, user),
      ]);
    return {
      tenant: ownContracts,
      managed: managedContracts,
      owner: ownedPropertiesContracts,
    };
  }

  async findOwn(contractsQueryDto: ContractsQueryDto, user: User) {
    return this.findContractsByFilter(contractsQueryDto, user, {
      tenantId: user.id,
    });
  }

  async findMangaged(contractsQueryDto: ContractsQueryDto, user: User) {
    return this.findContractsByFilter(contractsQueryDto, user, {
      landlordId: user.id,
    });
  }

  async findOwnedPropertiesContracts(
    contractsQueryDto: ContractsQueryDto,
    user: User,
  ) {
    return this.findContractsByFilter(contractsQueryDto, user, {
      ownerId: user.id,
    });
  }

  async findContractsByFilter(
    contractsQueryDto: ContractsQueryDto,
    user: User,
    filter: { tenantId?: number; landlordId?: number; ownerId?: number },
  ) {
    const { page } = contractsQueryDto;
    const limit = contractsQueryDto.limit ?? DefaultPageSize.CONTRACTS;
    const offset = this.paginationService.calculateOffset(limit, page);

    let whereCondition: any;

    if (filter.tenantId) {
      whereCondition = {
        tenant: { id: filter.tenantId },
        status: StatusContractEnum.ACTIVE,
      };
    } else if (filter.landlordId) {
      whereCondition = {
        landlord: { id: filter.landlordId },
        status: StatusContractEnum.ACTIVE,
      };
    } else if (filter.ownerId) {
      whereCondition = {
        property: { owner: { id: filter.ownerId } },
        status: StatusContractEnum.ACTIVE,
      };
    }

    const [data] = await this.contractsRepository.findAndCount(whereCondition, {
      relations: {
        tenant: true,
        landlord: true,
        property: { owner: true },
        dues: true,
      },
      skip: offset,
      take: limit,
    });

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
        caution: property.caution || 25000,
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

  async addInvoices(dueId: number, addInvoicesDto: AddInvoicesDto) {
    const due = await this.duesRepository.findOne(
      { id: dueId },
      { contract: true },
    );

    const maxInvoiceId =
      Array.isArray(due.invoices) && due.invoices.length
        ? Math.max(...due.invoices.map((a) => a.id))
        : 0;

    const newInvoices = addInvoicesDto.invoices.map((invoice, index) => ({
      id: maxInvoiceId + index + 1,
      ...invoice,
      status: 'PENDING',
    })) as InvoiceItem[];

    due.invoices = [...(due.invoices ?? []), ...newInvoices];
    const updateData: any = { invoices: due.invoices };

    await this.duesRepository.findOneAndUpdate({ id: dueId }, updateData);

    return this.findOne(due.contract.id);
  }

  async updateInvoice(dueId: number, updatedInvoice: UpdateInvoiceDto) {
    const due = await this.duesRepository.findOne(
      { id: dueId },
      { contract: true },
    );

    const invoiceIndex = due.invoices.findIndex(
      (invoice) => invoice.id === updatedInvoice.invoice_id,
    );

    due.invoices[invoiceIndex] = {
      ...due.invoices[invoiceIndex],
      ...updatedInvoice.invoice,
      status: 'PENDING',
    };

    await this.duesRepository.findOneAndUpdate(
      { id: dueId },
      { invoices: due.invoices },
    );

    return this.findOne(due.contract.id);
  }

  async removeInvoice(dueId: number, invoiceId: number) {
    const due = await this.duesRepository.findOne(
      { id: dueId },
      { contract: true },
    );

    const invoiceIndex = due.invoices.findIndex(
      (invoice) => invoice.id === invoiceId,
    );

    due.invoices.splice(invoiceIndex, 1);

    await this.duesRepository.findOneAndUpdate(
      { id: dueId },
      { invoices: due.invoices },
    );

    return this.findOne(due.contract.id);
  }
}
