import { IsPhoneNumber } from 'class-validator';
import { User } from '../entities/user.entity';
import { IsUnique } from 'common/decorators/validators/is-unique/is-unique.decorator';
import { OtpDto } from 'otp/dto/otp.dto';

export class SaveUserDto extends OtpDto {
  @IsPhoneNumber('BJ')
  @IsUnique(User, 'phone', { message: 'Phone must be unique' })
  readonly phone: string;
}
