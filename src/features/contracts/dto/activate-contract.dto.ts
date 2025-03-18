import { IsNotEmpty, IsNumber } from 'class-validator';

export class ActivateContractDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
