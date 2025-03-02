import { IsString } from 'class-validator';
import { PayCallbackDto } from './pay-callback.dto';

export class SendNotificationCallbackDto extends PayCallbackDto {
  @IsString()
  notificationMessage: string;
}
