import { IsDate, IsNotEmpty, IsNumber, MinDate } from 'class-validator';
import { IsExist } from 'libs/common/src';
import { IsCertified } from 'libs/common/src/usual/decorators/validators/is-certified.decorator';
import { Property } from 'src/features/properties/entities/property.entity';
import { IsContractExist } from '../../../../libs/common/src/usual/decorators/validators/is-contract-exist.decorator';
import { User } from 'src/features/auth/users/entities/user.entity';

@IsContractExist()
export class CreateContractDto {
  @IsNumber()
  @IsNotEmpty()
  @IsExist(User, 'id')
  @IsCertified(User, 'id')
  tenant_id: number;

  @IsNumber()
  @IsNotEmpty()
  @IsExist(User, 'id')
  @IsCertified(User, 'id')
  landlord_id: number;

  @IsNumber()
  @IsNotEmpty()
  @IsExist(Property, 'id')
  property_id: number;

  @IsDate()
  @IsNotEmpty()
  @MinDate(new Date(), { message: 'La date de début doit être dans le futur.' })
  start_date: Date;
}
