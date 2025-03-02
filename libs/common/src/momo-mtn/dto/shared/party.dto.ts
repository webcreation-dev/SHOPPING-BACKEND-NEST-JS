import { IsNumber, IsString } from 'class-validator';

export class PartDto {
  @IsString()
  partyIdType: string;

  @IsNumber()
  partyId: number;
}
