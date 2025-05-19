import { IsString, IsNotEmpty, IsNumber } from 'class-validator';

export class CreateInvoiceDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
