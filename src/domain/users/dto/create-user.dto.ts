import { IsPhoneNumber, Length } from 'class-validator';
import { User } from '../entities/user.entity';
import { IsUnique } from 'common/decorators/validators/is-unique/is-unique.decorator';
import { PasswordDto } from './password.dto';

export class CreateUserDto extends PasswordDto {
  @Length(2, 50)
  readonly name: string;

  @IsPhoneNumber('BJ')
  @IsUnique(User, 'phone', { message: 'Phone must be unique' })
  readonly phone: string;
}
