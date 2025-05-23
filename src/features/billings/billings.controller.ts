import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { CurrentUser, HeaderOperation } from '@app/common';
import { BillingsService } from 'src/features/billings/billings.service';
import { PayDueDto } from './dto/pay-due.dto';
import { User } from '../auth/users/entities/user.entity';
import * as fs from 'fs';
import * as path from 'path';

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

  @Post('request_payment')
  @HeaderOperation('PAY DUE', PayDueDto)
  getApiKey(@Body() payDueDto: any) {
    return this.billingsService.initiatePayment(payDueDto);
  }

  @Post('collections/callback')
  @HeaderOperation('WEBHOOK MTN', null, null, true)
  async paymentWebhook(@Req() req: Request, @Body() body: any) {
    try {
      // Chemin du fichier de log
      const logDir = path.join(__dirname, '../../../logs');
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir);
        console.log('✅ Répertoire de logs créé.');
      }
      const logFilePath = path.join('logs/payment-webhook.log');

      // Format du log
      const logEntry = `[${new Date().toISOString()}] Webhook received: ${JSON.stringify(
        body,
      )}\n`;

      console.log(logFilePath, logEntry);
      // Écrire dans le fichier de log
      fs.appendFileSync(logFilePath, logEntry, 'utf8');

      console.log('✅ Webhook reçu et écrit dans le fichier de log.');

      // Retourner une réponse au service qui a envoyé le webhook
      return { status: 'success', message: 'Webhook received successfully' };
    } catch (error) {
      console.error('❌ Erreur lors de la gestion du webhook:', error);
      throw error;
    }
  }
}
