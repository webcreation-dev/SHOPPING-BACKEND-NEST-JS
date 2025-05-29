import { IsString } from 'class-validator';

export class PaymentStatusDto {
  @IsString()
  request_id_debit: string;
}
