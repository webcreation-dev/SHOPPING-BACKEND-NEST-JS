import { Body, Controller, Get, Post } from '@nestjs/common';
import { CurrentUser, HeaderOperation } from '@app/common';
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

  @Post('pay_dues')
  @HeaderOperation('PAY DUE', PayDueDto)
  payDue(@Body() payDueDto: PayDueDto, @CurrentUser() user: User) {
    return this.billingsService.payDue(user, payDueDto);
  }
}
