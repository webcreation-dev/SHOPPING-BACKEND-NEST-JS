import { IsPhoneNumber, IsNumber } from 'class-validator';
import { User } from '../entities/user.entity';
import { IsUnique } from 'common/decorators/validators/is-unique.decorator';

export class SaveUserDto {
  @IsPhoneNumber('BJ')
  @IsUnique(User, 'phone', { message: 'Phone must be unique' })
  readonly phone: string;

  @IsNumber()
  readonly otp: number;
}
