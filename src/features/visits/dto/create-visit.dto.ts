import { IsNotEmpty, IsNumber } from 'class-validator';
import { IsExist } from 'libs/common/src';
import { User } from 'src/features/auth/users/entities/user.entity';
import { Property } from 'src/features/properties/entities/property.entity';
import { IsVisitExist } from '../../../../libs/common/src/usual/decorators/validators/is-visit-exist.decorator';

@IsVisitExist()
export class CreateVisitDto {
  @IsNumber()
  @IsNotEmpty()
  @IsExist(Property, 'id')
  property_id: number;

  @IsNumber()
  @IsNotEmpty()
  @IsExist(User, 'id')
  visitor_id: number;
}
