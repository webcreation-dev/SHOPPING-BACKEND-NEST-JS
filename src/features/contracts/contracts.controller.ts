import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ContractsService } from './contracts.service';
import { CreateContractDto } from './dto/create-contract.dto';
import {
  ApiPaginatedResponse,
  CurrentUser,
  HeaderOperation,
  IdDto,
} from '@app/common';
import { User } from '../auth/users/entities/user.entity';
import { ContractsQueryDto } from './querying/contracts-query.dto';
import { ActivateContractDto } from './dto/activate-contract.dto';
import { Contract } from './entities/contract.entity';
import { AddInvoicesDto } from './dto/invoices/add-invoice.dto';
import { UpdateInvoiceDto } from './dto/invoices/update-invoice.dto';
import { RemoveInvoiceDto } from './dto/invoices/remove-invoice.dto';

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
  @HeaderOperation('GET ALL')
  findAll(
    @Query() contractsQueryDto: ContractsQueryDto,
    @CurrentUser() user: User,
  ) {
    return this.contractsService.findAll(contractsQueryDto, user);
  }

  @Get(':id')
  @HeaderOperation('GET ONE')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.contractsService.findOne(id);
  }

  @Patch(':id/suspend')
  @HeaderOperation('SUSPEND CONTRACT')
  suspend(@Param() { id }: IdDto, @CurrentUser() user: User) {
    return this.contractsService.suspend(id, user);
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

  @Patch('/due/:id/add_invoices')
  @HeaderOperation('ADD INVOICES', AddInvoicesDto)
  addInvoices(@Param() { id }: IdDto, @Body() addInvoicesDto: AddInvoicesDto) {
    return this.contractsService.addInvoices(id, addInvoicesDto);
  }

  @Patch('due/:id/update_invoice')
  @HeaderOperation('UPDATE INVOICE', UpdateInvoiceDto)
  updateInvoice(
    @Param() { id }: IdDto,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
  ) {
    return this.contractsService.updateInvoice(id, updateInvoiceDto);
  }

  @Delete('due/:id/remove_invoice')
  @HeaderOperation('REMOVE INVOICE', RemoveInvoiceDto)
  removeInvoice(
    @Param() { id }: IdDto,
    @Body() { invoice_id }: RemoveInvoiceDto,
  ) {
    return this.contractsService.removeInvoice(id, invoice_id);
  }
}
