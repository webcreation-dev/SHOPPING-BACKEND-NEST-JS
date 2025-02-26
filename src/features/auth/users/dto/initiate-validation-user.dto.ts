import { IsNumber } from 'class-validator';

export class InitiateValidationUserDto {
  @IsNumber()
  readonly card_number: number;
}
