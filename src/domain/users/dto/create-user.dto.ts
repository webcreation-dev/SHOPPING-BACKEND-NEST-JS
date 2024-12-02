import { IsEmail, IsPhoneNumber, Length } from 'class-validator';
import { IsPassword } from 'common/decorators/validators/is-password.decorator';
import { User } from '../entities/user.entity';
import { IsUnique } from 'common/decorators/validators/is-unique.decorator';

export class CreateUserDto {
  @Length(2, 50)
  @IsUnique(User, 'name', { message: 'Name must be unique' })
  readonly name: string;

  @IsEmail()
  @IsUnique(User, 'email', { message: 'Email must be unique' })
  readonly email: string;

  @IsPhoneNumber('BR')
  @IsUnique(User, 'phone', { message: 'Phone must be unique' })
  readonly phone: string;

  /**
   * Requires:
   * 1. 8 to 20 characters
   * 2. At least one
   * - Lowercase letter
   * - Uppercase letter
   * - Number
   * - Special character
   */
  @IsPassword()
  readonly password: string;
}
