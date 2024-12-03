import { IsPhoneNumber } from 'class-validator';
import { User } from '../entities/user.entity';
import { IsExist } from 'common/decorators/validators/is-exist/is-exist.decorator';

export class ForgotPasswordDto {
  @IsPhoneNumber('BJ')
  @IsExist(User, 'phone', { message: 'Phone does not exist' })
  readonly phone: string;
}
