import { IsNotEmpty, IsNumber } from 'class-validator';

export class PayDueDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
