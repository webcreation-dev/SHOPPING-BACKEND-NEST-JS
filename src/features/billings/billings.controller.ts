import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser, HeaderOperation, IdDto } from '@app/common';
import { BillingsService } from 'src/features/billings/billings.service';
import { PayDueDto } from './dto/pay-due.dto';
import { User } from '../auth/users/entities/user.entity';

@Controller('billings')
export class BillingsController {
  constructor(private readonly billingsService: BillingsService) {}

  @Get('generate_dues')
  @HeaderOperation('CREATE DUE')
  createDue() {
    return this.billingsService.createDue();
  }

  @Post(':id/pay')
  @HeaderOperation('PAY DUE', PayDueDto)
  payDue(
    @Param() { id }: IdDto,
    @Body() payDueDto: PayDueDto,
    @CurrentUser() user: User,
  ) {
    return this.billingsService.payDue(id, user, payDueDto);
  }

  // @Get()
  // @ApiPaginatedResponse(Contract)
  // @HeaderOperation('GET OWN')
  // findAll(
  //   @Query() contractsQueryDto: ContractsQueryDto,
  //   @CurrentUser() user: User,
  // ) {
  //   return this.contractsService.findOwn(contractsQueryDto, user);
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
}
