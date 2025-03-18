import { IsNotEmpty, IsNumber } from 'class-validator';
import { IsExist } from 'libs/common/src';
import { Contract } from 'src/features/contracts/entities/contract.entity';

export class PayDueDto {
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @IsNumber()
  @IsNotEmpty()
  @IsExist(Contract, 'id')
  contract_id: number;
}
