import { IsString } from 'class-validator';
import { ApiTokenDto } from './shared/api-token.dto';

export class RefundCallbackDto extends ApiTokenDto {
  @IsString()
  request_id_refund: string;
}
