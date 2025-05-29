import {
  Body,
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Post,
  Put,
  Req,
} from '@nestjs/common';
import { CurrentUser, HeaderOperation } from '@app/common';
import { BillingsService } from 'src/features/billings/billings.service';
import { PayDueDto } from './dto/pay-due.dto';
import { User } from '../auth/users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';
import { PayCallbackDto } from 'libs/common/src/momo-mtn/dto/pay-callback.dto';
import { PaymentStatusDto } from './dto/payment-status.dto';

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

  ////
  @Post('request_payment')
  @HeaderOperation('TEST REQUEST PAYMENT', PayDueDto)
  requestPayment(@Body() payDueDto: any) {
    return this.billingsService.initiatePayment(payDueDto);
  }

  @Post('status_payment')
  @HeaderOperation('GET PAYMENT STATUS', PaymentStatusDto)
  statusPayment(@Body() payCallback: PaymentStatusDto) {
    return this.billingsService.payCallback(payCallback);
  }
  /////

  @Put('collections/callback')
  @HeaderOperation('WEBHOOK MTN', null, null, true)
  async paymentWebhook(@Req() req: Request, @Body() body: any) {
    try {
      const uploadDir = 'upload';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const logFilePath = path.join(uploadDir, 'payment-webhook.log');

      // Log plus détaillé
      const logEntry = `
[${new Date().toISOString()}] 
Headers: ${JSON.stringify(req.headers)}
Body: ${JSON.stringify(body)}
-------------------\n`;

      console.log('📝 Log Path:', logFilePath);
      console.log('📦 Webhook Data:', logEntry);

      fs.appendFileSync(logFilePath, logEntry, 'utf8');

      return { status: 'success', message: 'Webhook received successfully' };
    } catch (error) {
      console.error('❌ Erreur webhook:', error);
      return { status: 'error', message: error.message };
    }
  }

  @Get('collections/webhook-logs')
  @HeaderOperation('WEBHOOK MTN', null, null, true)
  async getWebhookLogs() {
    try {
      const logFilePath = path.join('upload', 'payment-webhook.log');

      if (fs.existsSync(logFilePath)) {
        const logs = fs.readFileSync(logFilePath, 'utf8');
        return {
          logs: logs.split('\n').slice(-50), // 50 dernières lignes
          lastModified: fs.statSync(logFilePath).mtime,
        };
      } else {
        return { message: 'Aucun log trouvé', logs: [] };
      }
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
