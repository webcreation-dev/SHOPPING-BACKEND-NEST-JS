import { IsString } from 'class-validator';
import { ApiTokenDto } from './shared/api-token.dto';

export class PayCallbackDto extends ApiTokenDto {
  @IsString()
  request_id_debit: string;
}
