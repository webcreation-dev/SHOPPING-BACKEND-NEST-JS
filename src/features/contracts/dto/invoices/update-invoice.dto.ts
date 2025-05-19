import { ValidateNested, IsNumber, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateInvoiceDto } from './create-invoices.dto';

export class UpdateInvoiceDto {
  @ValidateNested()
  @Type(() => CreateInvoiceDto)
  invoice: CreateInvoiceDto;

  @IsNumber()
  @IsNotEmpty()
  invoice_id: number;
}
