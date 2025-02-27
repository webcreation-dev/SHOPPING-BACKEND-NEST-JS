import { IsNotEmpty, IsNumber } from 'class-validator';
import { IsCertified } from 'libs/common/src/usual/decorators/validators/is-certified.decorator';

export class CreateContractDto {
  @IsNumber()
  @IsNotEmpty()
  @IsCertified('id')
  tenant_id: number;

  // @IsNumber()
  // @IsNotEmpty()
  // landlord_id: number;
}
