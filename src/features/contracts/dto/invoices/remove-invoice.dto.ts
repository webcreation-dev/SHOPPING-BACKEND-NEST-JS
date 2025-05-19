import { IsNumber, IsNotEmpty } from 'class-validator';

export class RemoveInvoiceDto {
  @IsNumber()
  @IsNotEmpty()
  invoice_id: number;
}
