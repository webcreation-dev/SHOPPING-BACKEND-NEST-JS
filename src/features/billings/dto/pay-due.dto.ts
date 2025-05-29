import { IsEnum, IsNotEmpty, IsNumber } from 'class-validator';
import { IsExist } from 'libs/common/src';
import { Contract } from 'src/features/contracts/entities/contract.entity';
import { PaymentTypeEnum } from '../enums/payment-type.enum';
import { PaymentMethodEnum } from '../enums/payment-method.enum';

export class PayDueDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  @IsExist(Contract, 'id')
  contract_id: number;

  @IsNumber()
  @IsNotEmpty()
  msisdn: number;

  @IsEnum(PaymentTypeEnum)
  @IsNotEmpty()
  payment_type: PaymentTypeEnum;

  @IsEnum(PaymentMethodEnum)
  @IsNotEmpty()
  payment_method: PaymentMethodEnum;
}
