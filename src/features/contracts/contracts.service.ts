import { Injectable } from '@nestjs/common';
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

  async create({ tenant_id }: CreateContractDto, { id }: User) {
    // const userData = await this.usersService.findOne(id);
    // const property = await this.propertiesService.findOne(property_id);
    // console.log('property', property);
    // const contract = await this.contractsRepository.create(
    //   new Contract({
    //     user: userData,
    //     property: property,
    //     manager: property.user,
    //   }),
    // );
    // return await this.findOne(contract.id);
  }

  // async findOne(id: number) {
  //   return this.contractsRepository.findOne(
  //     { id },
  //     { user: true, property: true, manager: true },
  //   );
  // }

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
