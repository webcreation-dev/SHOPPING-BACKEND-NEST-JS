import { Controller, Param, Post } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { IdDto } from 'common/dto/id.dto';
import { CurrentUser } from 'auth/decorators/user.decorator';
import { RequestUser } from 'auth/interfaces/request-user.interface';
import { ApiExcludeController } from '@nestjs/swagger';

@ApiExcludeController()
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post(':id')
  payOrder(@Param() { id }: IdDto, @CurrentUser() user: RequestUser) {
    return this.paymentsService.payOrder(id, user);
  }
}
