import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { ApiPaginatedResponse, CurrentUser, HeaderOperation, IdDto } from '@app/common';
import { User } from '../auth/users/entities/user.entity';
import { ContractsQueryDto } from './querying/contracts-query.dto';
import { ActivateContractDto } from './dto/activate-contract.dto';
import { Contract } from './entities/contract.entity';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService) {}

  @Post()
  @HeaderOperation('CREATE ', CreateContractDto)
  create(
    @Body() createContractDto: CreateContractDto,
    @CurrentUser() user: User,
  ) {
    return this.contractsService.create(createContractDto, user);
  }

  @Get()
  @ApiPaginatedResponse(Contract)
  @HeaderOperation('GET OWN')
  findAll(
    @Query() contractsQueryDto: ContractsQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.contractsService.findOwn(contractsQueryDto, user);
  }

  @Get('/managed')
  @ApiPaginatedResponse(Contract)
  @HeaderOperation('GET MANAGED', ContractsQueryDto)
  findManaged(
    @Query() contractsQueryDto: ContractsQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.contractsService.findManaged(contractsQueryDto, user);
  }

  @Get(':id')
  @HeaderOperation('GET ONE')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id/activate')
  @HeaderOperation('ACTIVATE', ActivateContractDto)
  activate(
    @Param() { id }: IdDto,
    @Body() activateContractDto: ActivateContractDto,
    @CurrentUser() user: User,
  ) {
    return this.contractsService.activate(id, user, activateContractDto);
  }
}
