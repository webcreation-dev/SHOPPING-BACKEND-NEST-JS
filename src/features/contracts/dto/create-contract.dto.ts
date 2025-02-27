import { IsDate, IsNotEmpty, IsNumber } from 'class-validator';
import { IsExist } from 'libs/common/src';
import { IsCertified } from 'libs/common/src/usual/decorators/validators/is-certified.decorator';
import { Property } from 'src/features/properties/entities/property.entity';

export class CreateContractDto {
  @IsNumber()
  @IsNotEmpty()
  @IsCertified('id')
  tenant_id: number;

  @IsNumber()
  @IsNotEmpty()
  @IsCertified('id')
  landlord_id: number;

  @IsNumber()
  @IsNotEmpty()
  @IsExist(Property, 'id')
  property_id: number;

  @IsDate()
  @IsNotEmpty()
  start_date: Date;

  @IsDate()
  @IsNotEmpty()
  end_date: Date;
}
