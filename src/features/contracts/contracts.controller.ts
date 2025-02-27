import { Body, Controller, Post } from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import { CurrentUser, HeaderOperation } from '@app/common';
import { User } from '../auth/users/entities/user.entity';

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

  // @Get()
  // @ApiPaginatedResponse(Contract)
  // @HeaderOperation('GET OWN', ContractsQueryDto)
  // findAll(
  //   @Query() contractsQueryDto: ContractsQueryDto,
  //   @CurrentUser() user: User,
  // ) {
  //   return this.contractsService.findAll(contractsQueryDto, user);
  // }

  // @Get('/managed')
  // @ApiPaginatedResponse(Contract)
  // @HeaderOperation('GET MANAGED', ContractsQueryDto)
  // findManaged(
  //   @Query() contractsQueryDto: ContractsQueryDto,
  //   @CurrentUser() user: User,
  // ) {
  //   return this.contractsService.findManaged(contractsQueryDto, user);
  // }

  // @Get(':id')
  // @HeaderOperation('GET ONE')
  // findOne(@Param('id', ParseIntPipe) id: number) {
  //   return this.contractsService.findOne(id);
  // }

  // @Delete(':id')
  // @HeaderOperation('DELETE')
  // async remove(@Param() { id }: IdDto) {
  //   return this.contractsService.remove(id);
  // }
}
