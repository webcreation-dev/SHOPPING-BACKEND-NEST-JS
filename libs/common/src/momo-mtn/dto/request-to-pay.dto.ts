import { IsNumber, IsString, ValidateNested } from 'class-validator';
import { PartDto } from './shared/party.dto';
import { Type } from 'class-transformer';
import { ApiTokenDto } from './shared/api-token.dto';

export class RequestToPayDto extends ApiTokenDto {
  @IsString()
  x_reference_id: string;

  @IsNumber()
  amount: number;

  @IsString()
  currency: string;

  @IsNumber()
  externalId: string;

  @ValidateNested()
  @Type(() => PartDto)
  payer: PartDto;

  @IsString()
  payerMessage: string;

  @IsString()
  payeeNote: string;
}
